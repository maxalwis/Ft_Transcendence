#!/bin/sh

echo "Waiting for Kibana API..."
until curl -s http://kibana:5601/api/status | grep -q '"overall":{"level":"available"'; do
  sleep 3
done

echo "1. Importing Saved Objects..."
curl -s -X POST "http://kibana:5601/api/saved_objects/_import?overwrite=true" \
  -H "kbn-xsrf: true" \
  --form file=@/usr/local/bin/kibana-dashboard.ndjson

echo "2. Syncing Data View (nestjs-logs-pattern)..."
curl -s -X POST "http://kibana:5601/api/data_views/data_view" \
  -H "Content-Type: application/json" \
  -H "kbn-xsrf: true" \
  -d '{
    "override": true,
    "data_view": {
      "id": "nestjs-logs-pattern",
      "title": "nestjs-logs-*",
      "name": "NestJS Logs",
      "timeFieldName": "@timestamp"
    }
  }'

echo "3. Setting default Data View..."
curl -s -X POST "http://kibana:5601/api/kibana/settings/defaultIndex" \
  -H "Content-Type: application/json" \
  -H "kbn-xsrf: true" \
  -d '{"value": "nestjs-logs-pattern"}'

echo "4. Setting default Route..."
curl -s -X POST "http://kibana:5601/api/kibana/settings/defaultRoute" \
  -H "Content-Type: application/json" \
  -H "kbn-xsrf: true" \
  -d '{"value": "/app/dashboards#/view/f159da20-9bcb-11f1-ba7a-57e6a5c8394b"}'

echo "Kibana setup complete!"