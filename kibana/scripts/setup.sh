#!/bin/sh

echo "Waiting for Kibana API to be fully responsive..."
until curl -s http://kibana:5601/api/status | grep -q "available"; do
  sleep 3
done

echo "Waiting another 10s for Kibana internal indexes to settle..."
sleep 10

echo "Creating Kibana Data View..."
curl -X POST "http://kibana:5601/api/data_views/data_view" \
  -H "Content-Type: application/json" \
  -H "kbn-xsrf: true" \
  -d '{
    "data_view": {
      "id": "nestjs-logs-pattern",
      "title": "nestjs-logs-*",
      "name": "NestJS Logs"
    }
  }'

echo "Setting as default Data View..."
curl -X POST "http://kibana:5601/api/kibana/settings/defaultIndex" \
  -H "Content-Type: application/json" \
  -H "kbn-xsrf: true" \
  -d '{"value": "nestjs-logs-pattern"}'

echo "Fully configured successfully!"