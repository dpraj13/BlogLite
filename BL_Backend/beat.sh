#! /bin/sh
celery -A main.celery beat --max-interval 1 -l info
