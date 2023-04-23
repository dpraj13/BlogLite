#! /bin/sh
celery -A main.celery worker -l info