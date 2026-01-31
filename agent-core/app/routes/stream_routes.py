"""Streaming Routes."""

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.modules.streaming import stream_redis_channel

stream_router = APIRouter()


# Streaming API endpoint
@stream_router.get(
    "/",
    response_class=StreamingResponse,
    responses={
        200: {
            "description": "Server-Sent Events stream",
            "content": {
                "text/event-stream": {
                    "schema": {"type": "string", "description": "SSE event stream"}
                }
            },
        }
    },
)
async def stream(session_id: str) -> StreamingResponse:
    """Endpoint for frontend to subscribe with streaming channel."""
    return StreamingResponse(
        stream_redis_channel(session_id), media_type="text/event-stream"
    )
