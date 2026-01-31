"""RabbitMQ Module."""

import asyncio

from aio_pika import Message, connect_robust

from app.common.constants import ERROR_MESSAGES, SUCCESS_MESSAGES
from app.config import settings
from app.utils.logger import logger

RABBITMQ_URL: str = settings.RABBITMQ_URL


async def send_event(message_body: str, queue: str):
    """Send an event to the RabbitMQ queue."""
    try:
        # Establish connection to RabbitMQ
        connection = await connect_robust(RABBITMQ_URL)
        async with connection:
            channel = await connection.channel()
            await channel.declare_queue(queue, durable=True)
            message = Message(body=message_body.encode())
            await channel.default_exchange.publish(message, routing_key=queue)
            logger.info(SUCCESS_MESSAGES.EVENT_SENT.format(queue_name=queue))
    except Exception as e:
        logger.error(ERROR_MESSAGES.EVENT_SEND_FAILED.format(error=e))


def send_event_sync(message_body: str, queue: str):
    """Run send_event in a synchronous context."""
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = None

    if loop and loop.is_running():
        asyncio.create_task(send_event(message_body, queue))  # noqa: RUF006
    else:
        asyncio.run(send_event(message_body, queue))
