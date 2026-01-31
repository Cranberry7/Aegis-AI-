"""Chat Service."""

from fastapi import Request

from app.common.types import ChatRequest
from app.modules.core import prompt_agent


async def call_agent(request: Request, chat_request: ChatRequest):
    """Call agent."""
    await prompt_agent(request, chat_request)
