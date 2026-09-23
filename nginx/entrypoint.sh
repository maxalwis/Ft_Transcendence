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

# nginx.conf includes this file to resolve optional upstreams (kibana, elasticsearch,
# prisma-studio) at request time instead of at startup. The DNS address is the
# container's own resolver (Docker: 127.0.0.11, Podman: the network gateway),
# read from /etc/resolv.conf so it works the same on both.
NAMESERVER=$(awk '/^nameserver/ { print $2; exit }' /etc/resolv.conf)
echo "resolver ${NAMESERVER} valid=10s;" > /etc/nginx/resolver.conf

# hand off to nginx's own entrypoint (runs /docker-entrypoint.d/* then starts nginx)
exec /docker-entrypoint.sh nginx -g 'daemon off;'
