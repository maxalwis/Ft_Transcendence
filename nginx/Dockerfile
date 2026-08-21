FROM nginx:alpine
RUN apk add --no-cache openssl
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
EXPOSE 443
ENTRYPOINT ["/entrypoint.sh"]
