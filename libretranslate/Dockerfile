FROM docker.io/libretranslate/libretranslate:latest

RUN /app/venv/bin/python -m pip install --no-cache-dir \
    "requests==2.31.0" \
    "urllib3<2.1.0" \
    "chardet<6.0.0"

RUN sed -i \
    's#^\./venv/bin/gunicorn#exec ./venv/bin/gunicorn --graceful-timeout 5#' \
    /app/scripts/entrypoint.sh