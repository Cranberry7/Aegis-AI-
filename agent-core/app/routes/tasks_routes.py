"""Tasks routes."""

from fastapi import APIRouter

from app.common.models import ResMessage, TaskStatusResponseModel
from app.common.types import JSONRes
from app.services.tasks_service import get_task_status_by_id
from app.utils import format_response

tasks_router = APIRouter()


@tasks_router.get("/status/{task_id}", response_model=TaskStatusResponseModel)
def get_task_status(task_id: str) -> JSONRes:
    """Get status of the running task."""
    result: ResMessage = get_task_status_by_id(task_id)
    return format_response(result)
