"""Tasks Service."""

from celery.result import AsyncResult

from app.common.models import ResMessage
from app.modules.bg_process import celery_app


def get_task_status_by_id(task_id: str) -> AsyncResult:
    """Retrieve the status of a task by its ID."""
    task = AsyncResult(task_id, app=celery_app)
    return ResMessage(
        data={"status": task.status, "result": str(task.result)},
        task_id=task_id,
    )
