FROM docker.io/libretranslate/libretranslate:latest

RUN sed -i \
    's#^\./venv/bin/gunicorn#exec ./venv/bin/gunicorn --graceful-timeout 5#' \
    /app/scripts/entrypoint.sh