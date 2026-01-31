"""Chat Routes."""

from fastapi import APIRouter, BackgroundTasks, Request

from app.common.models import ChatResponseModel, ResMessage
from app.common.types import ChatRequest
from app.config import settings
from app.services.chat_service import call_agent
from app.utils import format_response
from app.utils.rate_limiter import limiter

chat_router = APIRouter()


@chat_router.post("/", response_model=ChatResponseModel)
@limiter.limit(f"{settings.CHAT_RATE_LIMIT_COUNT}/{settings.CHAT_RATE_LIMIT_UNIT}")
async def handle_chat_request(
    request: Request,
    chat_request: ChatRequest,
    background_tasks: BackgroundTasks,
):
    """Handle agent events."""
    background_tasks.add_task(call_agent, request, chat_request)
    return format_response(ResMessage(data="OK"))
