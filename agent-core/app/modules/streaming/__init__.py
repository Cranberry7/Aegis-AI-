"""Streaming Module for Communication with Frontend."""

import asyncio

from redis.asyncio import Redis

from app.common.constants import ERROR_MESSAGES, SUCCESS_MESSAGES
from app.common.enums import EventMessageType
from app.config import settings
from app.utils.context import get_all_context, set_context
from app.utils.json_utils import json_dumps
from app.utils.logger import logger
from app.utils.retry import retry_on_exception

REDIS_HOST: str = settings.REDIS_HOST
REDIS_PORT: int = settings.REDIS_PORT
REDIS_PUBLISH_MAX_RETRIES: int = settings.REDIS_PUBLISH_MAX_RETRIES

# Redis connection
redis_client = Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)

channel_template = "ai:chat:{session_id}"


# Async generator to look for new messages and stream them to frontend
async def stream_redis_channel(session_id: str):
    """Stream messages from Redis channel."""
    pubsub = redis_client.pubsub()
    await pubsub.subscribe(channel_template.format(session_id=session_id))

    logger.info(SUCCESS_MESSAGES.STREAMING_CHANNEL_STARTED)

    try:
        async for message in pubsub.listen():
            if message and message["type"] == "message":
                # Send in SSE-suitable format "data: {string_message} \n\n"
                yield f"data: {message['data']}\n\n"
            await asyncio.sleep(0.01)
    except Exception:
        logger.error(ERROR_MESSAGES.STREAMING_CHANNEL_FAILED)
    finally:
        await pubsub.unsubscribe(channel_template.format(session_id=session_id))
        await pubsub.close()


def no_subscriber(e) -> bool:
    """No subscriber retry condition."""
    return isinstance(e, TimeoutError)


# Function to publish messages to Channel
@retry_on_exception(
    max_retries=REDIS_PUBLISH_MAX_RETRIES,
    retry_condition=no_subscriber,
)
async def publish_message(
    msg_type: EventMessageType,
    text: str,
):
    """Publish message to the streaming channel."""
    try:
        context: dict = get_all_context()

        session_id = context.get("session_id")
        message_id = context.get("agent_message_id")

        channel = channel_template.format(session_id=session_id)
        message = json_dumps(
            {
                "type": msg_type,
                "text": text,
                "sessionId": session_id,
                "messageId": message_id,
            }
        )

        response = await redis_client.publish(channel, message)
        if msg_type == EventMessageType.DEBUG:
            debug_steps = context.get("debug_steps") or []
            debug_steps.append(text)
            set_context("debug_steps", debug_steps)
        if response > 0:
            # Add a small delay to ensure message is processed
            await asyncio.sleep(0.01)
            return

        raise TimeoutError("No subscribers available for the channel")  # noqa: TRY301
    except Exception as e:
        logger.error(f"Error publishing message: {e}")
