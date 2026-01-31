"""RabbitMQ consumer module for handling event processing.

This module provides functionality to consume messages from RabbitMQ queues
and process them using the event handler.
"""

import asyncio
from collections.abc import Callable, Coroutine
from typing import Any

from aio_pika import connect_robust

from app.common.constants import ERROR_MESSAGES, RABBITMQ_QUEUES, SUCCESS_MESSAGES
from app.config import settings
from app.modules.events.training_events import (
    handle_delete_knowledge_event,
    handle_training_event,
)
from app.utils.logger import logger

RABBITMQ_URL: str = settings.RABBITMQ_URL
PREFETCH_COUNT: int = settings.PREFETCH_COUNT

# Define queue handlers
QUEUE_HANDLERS: dict[str, Callable[[Any], Coroutine]] = {
    RABBITMQ_QUEUES.NEW_KNOWLEDGE: handle_training_event,
    RABBITMQ_QUEUES.DELETE_KNOWLEDGE: handle_delete_knowledge_event,
}


async def start_single_consumer(queue_name: str, handler: Callable[[Any], Coroutine]):
    """Start a single RabbitMQ consumer."""
    try:
        connection = await connect_robust(RABBITMQ_URL)
        channel = await connection.channel()
        await channel.set_qos(prefetch_count=PREFETCH_COUNT)
        queue = await channel.declare_queue(queue_name, durable=True)
        await queue.consume(handler)
        logger.info(
            SUCCESS_MESSAGES.EVENT_CONSUMER_STARTED.format(queue_name=queue_name)
        )
    except Exception as e:
        logger.error(ERROR_MESSAGES.EVENT_CONSUMER_FAILED.format(error=e))


async def start_rabbitmq_listener():
    """Start RabbitMQ listeners for all configured queues in separate tasks."""
    tasks = []
    for queue_name, handler in QUEUE_HANDLERS.items():
        task = asyncio.create_task(start_single_consumer(queue_name, handler))
        tasks.append(task)

    # Wait for all consumers to start
    await asyncio.gather(*tasks)
