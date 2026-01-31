"""Celery App Initialization."""

from celery.app import Celery
from kombu.serialization import register

from app.config import settings
from app.utils.json_utils import json_dumps, json_loads

CELERY_BROKER: str = settings.CELERY_BROKER


# Serializer registration
register(
    "custom_json",
    json_dumps,
    json_loads,
    content_type="application/x-custom-json",
    content_encoding="utf-8",
)

# TODO: Need to re-add this to wherever required
celery_app = Celery(
    "tasks",
    broker=CELERY_BROKER,
    backend=CELERY_BROKER,
)

celery_app.conf.update(
    task_track_started=True,  # Track task progress
    task_serializer="custom_json",
    accept_content=["application/x-custom-json", "json"],  # Adjust as needed
    result_serializer="custom_json",
)

celery_app.autodiscover_tasks(["app.modules.events.training_events"])
