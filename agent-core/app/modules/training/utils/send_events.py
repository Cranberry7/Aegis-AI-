"""Events Module."""

import json
from datetime import datetime

from app.common.constants import RABBITMQ_QUEUES
from app.common.enums import EventActionType
from app.modules.rabbitmq import send_event, send_event_sync
from app.modules.training.training_types import CompleteTrainingEvent, EventBody


async def complete_training_event(
    user_id: str,
    account_id: str,
    source_id: str,
    action: EventActionType,
) -> None:
    """Send completed event for training."""
    await add_or_update_event(
        EventBody(
            pattern=RABBITMQ_QUEUES.COMPLETE_TRAINING,
            data=CompleteTrainingEvent(
                user_id=user_id,
                account_id=account_id,
                timestamp=datetime.now().isoformat(),
                data={
                    "content": {
                        "sourceId": source_id,
                        "action": action.value,
                    },
                },
            ),
        ),
    )


def complete_training_event_sync(
    user_id: str,
    account_id: str,
    source_id: str,
    action: EventActionType,
) -> None:
    """Run complete_training_event in a synchronous context."""
    event = EventBody(
        pattern=RABBITMQ_QUEUES.COMPLETE_TRAINING,
        data=CompleteTrainingEvent(
            user_id=user_id,
            account_id=account_id,
            timestamp=datetime.now().isoformat(),
            data={
                "content": {
                    "sourceId": source_id,
                    "action": action.value,
                },
            },
        ),
    )
    send_event_sync(json.dumps(event.model_dump(mode="json")), event.pattern)


async def add_or_update_event(event: EventBody):
    """Send final response from the agent."""
    data = event.model_dump(mode="json")
    await send_event(json.dumps(data), event.pattern)
