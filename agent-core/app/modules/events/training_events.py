"""Module for Training related events."""

import json
from functools import wraps

from aio_pika import IncomingMessage

from app.common.constants import ERROR_MESSAGES, SUCCESS_MESSAGES
from app.modules.training.training_types import (
    DeleteKnowledgeEvent,
    EventMetadata,
    TrainingEvent,
)
from app.modules.training.utils.delete_training import delete_training_data
from app.modules.training.utils.trigger_training import route_training_events
from app.utils.logger import logger


def handle_event(ignore_processed=False):
    """Handle event decorator."""

    def decorator(func):
        @wraps(func)
        async def wrapper(message: IncomingMessage):
            try:
                async with message.process(ignore_processed=ignore_processed):
                    data = message.body.decode()
                    logger.info(
                        SUCCESS_MESSAGES.EVENT_RECEIVED.format(
                            queue_name=message.routing_key
                        )
                    )
                    return await func(message, json.loads(data)["data"])
            except Exception as e:
                logger.exception(ERROR_MESSAGES.EVENT_PROCESSING_FAILED.format(error=e))

        return wrapper

    return decorator


@handle_event(ignore_processed=True)
async def handle_training_event(message: IncomingMessage, data: dict):
    """Handle incoming RabbitMQ messages."""
    training_event = TrainingEvent(**data)
    event_metadata = EventMetadata(
        user_id=training_event.user_id, account_id=training_event.account_id
    )
    for event in training_event.data:
        await route_training_events(event, event_metadata)


@handle_event(ignore_processed=True)
async def handle_delete_knowledge_event(message: IncomingMessage, data: dict):
    """Handle delete knowledge event."""
    event = DeleteKnowledgeEvent(**data)
    await delete_training_data(event)
