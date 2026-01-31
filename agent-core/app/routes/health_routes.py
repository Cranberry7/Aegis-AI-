"""Health routes."""

from fastapi import APIRouter

from app.common.models import HealthResponseModel, ResMessage
from app.common.types import JSONRes
from app.utils import format_response

health_router = APIRouter()


@health_router.get("/ping", response_model=HealthResponseModel)
def ping_server() -> JSONRes:
    """Endpoint to check the health of the server."""
    return format_response(ResMessage(data="pong!"))
