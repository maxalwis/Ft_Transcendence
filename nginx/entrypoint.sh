#!/bin/sh
set -e
CERT_DIR=/etc/nginx/certs
if [ ! -f "$CERT_DIR/cert.pem" ] || [ ! -f "$CERT_DIR/key.pem" ]; then
  echo "[nginx] generating a self-signed certificate (dev only)"
  mkdir -p "$CERT_DIR"
  openssl req -x509 -newkey rsa:2048 -nodes \
    -keyout "$CERT_DIR/key.pem" -out "$CERT_DIR/cert.pem" \
    -days 365 -subj "/CN=localhost" \
    -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"
fi
# hand off to nginx's own entrypoint (runs /docker-entrypoint.d/* then starts nginx)
exec /docker-entrypoint.sh nginx -g 'daemon off;'
