"""Common Utilities."""

from datetime import datetime
from http import HTTPStatus

from app.common.enums import StatusType
from app.common.models import ResMessage
from app.common.types import JSONRes


def format_response(
    data: ResMessage,
    status_code: int = HTTPStatus.OK,
    success_status: StatusType = StatusType.SUCCESS,
) -> JSONRes:
    """Return formatted generic response object."""
    return JSONRes(
        status_code=status_code,
        content={
            "status": success_status.value,
            "data": data.data,
            "task_id": data.task_id,
            "timestamp": datetime.now().isoformat(),
        },
    )
