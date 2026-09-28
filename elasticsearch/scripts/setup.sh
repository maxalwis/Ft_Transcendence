#!/bin/sh
# One-shot Elasticsearch bootstrap, run by the `elasticsearch-setup` compose service
# before Kibana and Logstash start. Idempotent: every call is a PUT, safe to replay.
#
#   1. Service users   : kibana_system password, logstash_internal writer user
#   2. Archiving       : filesystem snapshot repository + daily SLM snapshot policy
#   3. Retention       : ILM policy (hot -> warm at 7d -> delete at 30d, after a snapshot)
#   4. Index template  : applies the ILM policy to every nestjs-logs-* index
set -e

ES=http://elasticsearch:9200
ILM_POLICY=nestjs-logs-policy
SLM_POLICY=daily-logs-archive
SNAPSHOT_REPO=logs-archive

for var in ELASTIC_PASSWORD KIBANA_SYSTEM_PASSWORD LOGSTASH_INTERNAL_PASSWORD; do
  eval "value=\${$var}"
  if [ -z "$value" ]; then
    echo "[es-setup] $var is not set in .env, refusing to continue" >&2
    exit 1
  fi
done

# curl wrapper: authenticated as the `elastic` superuser, fails on HTTP errors
es() {
  method=$1
  path=$2
  shift 2
  curl -sS --fail-with-body -u "elastic:${ELASTIC_PASSWORD}" -X "$method" "${ES}${path}" \
    -H 'Content-Type: application/json' "$@"
  echo
}

echo "[es-setup] Waiting for Elasticsearch..."
until curl -s -u "elastic:${ELASTIC_PASSWORD}" "${ES}/_cluster/health" | grep -q '"status":"\(green\|yellow\)"'; do
  sleep 3
done

echo "[es-setup] 1. Service users"
es POST /_security/user/kibana_system/_password -d "{\"password\": \"${KIBANA_SYSTEM_PASSWORD}\"}"

# Least privilege for Logstash: it can only create and write nestjs-logs-* indices
es PUT /_security/role/logstash_writer -d '{
  "cluster": ["monitor"],
  "indices": [{
    "names": ["nestjs-logs-*"],
    "privileges": ["create_index", "create", "write", "auto_configure"]
  }]
}'
es PUT /_security/user/logstash_internal -d "{
  \"password\": \"${LOGSTASH_INTERNAL_PASSWORD}\",
  \"roles\": [\"logstash_writer\"],
  \"full_name\": \"Logstash ingestion user\"
}"

echo "[es-setup] 2. Archiving: snapshot repository + daily SLM policy"
# path.repo is mounted on the elasticsearch_snapshots volume (see docker-compose.yml),
# so archives survive the deletion of the indices and of the data volume.
es PUT "/_snapshot/${SNAPSHOT_REPO}" -d '{
  "type": "fs",
  "settings": { "location": "/usr/share/elasticsearch/snapshots", "compress": true }
}'
# Every night at 01:30: snapshot all log indices, keep archives for 1 year
es PUT "/_slm/policy/${SLM_POLICY}" -d "{
  \"schedule\": \"0 30 1 * * ?\",
  \"name\": \"<nestjs-logs-{now/d}>\",
  \"repository\": \"${SNAPSHOT_REPO}\",
  \"config\": { \"indices\": [\"nestjs-logs-*\"], \"include_global_state\": false },
  \"retention\": { \"expire_after\": \"365d\", \"min_count\": 7, \"max_count\": 400 }
}"

echo "[es-setup] 3. Retention: ILM policy"
# Daily indices (nestjs-logs-YYYY.MM.dd) are created by Logstash, so there is no rollover:
# min_age counts from each index's creation date.
#   hot    : current day, highest recovery priority
#   warm   : after 7 days, merged into 1 segment and made read-only
#   delete : after 30 days, only once the SLM policy has archived it
es PUT "/_ilm/policy/${ILM_POLICY}" -d "{
  \"policy\": { \"phases\": {
    \"hot\":    { \"min_age\": \"0ms\", \"actions\": { \"set_priority\": { \"priority\": 100 } } },
    \"warm\":   { \"min_age\": \"7d\",  \"actions\": {
      \"forcemerge\": { \"max_num_segments\": 1 },
      \"readonly\": {},
      \"set_priority\": { \"priority\": 50 }
    } },
    \"delete\": { \"min_age\": \"30d\", \"actions\": {
      \"wait_for_snapshot\": { \"policy\": \"${SLM_POLICY}\" },
      \"delete\": {}
    } }
  } }
}"

echo "[es-setup] 4. Index template for nestjs-logs-*"
# Single node: no replicas, otherwise every index stays yellow
es PUT /_index_template/nestjs-logs -d "{
  \"index_patterns\": [\"nestjs-logs-*\"],
  \"priority\": 100,
  \"template\": { \"settings\": {
    \"index.lifecycle.name\": \"${ILM_POLICY}\",
    \"number_of_replicas\": 0
  } }
}"

# Indices created before this template existed get the policy too
if curl -s -u "elastic:${ELASTIC_PASSWORD}" "${ES}/_cat/indices/nestjs-logs-*?h=index" | grep -q .; then
  es PUT '/nestjs-logs-*/_settings' -d "{
    \"index.lifecycle.name\": \"${ILM_POLICY}\",
    \"number_of_replicas\": 0
  }"
fi

echo "[es-setup] Elasticsearch setup complete!"
