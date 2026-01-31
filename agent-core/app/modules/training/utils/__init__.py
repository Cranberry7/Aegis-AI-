"""Training Utils."""

from collections.abc import Generator
from typing import Any

from app.config import settings
from app.utils.logger import logger

TRAINING_BATCH_SIZE: int = settings.TRAINING_BATCH_SIZE


def get_total_batch_number(docs_len: int) -> int:
    """Calculate the total number of batches required for training."""
    return (docs_len + TRAINING_BATCH_SIZE - 1) // TRAINING_BATCH_SIZE


def get_batches(data: list[Any] | list[list[Any]]) -> Generator:
    """Generate batches of data from the provided list."""
    total_batches: int = get_total_batch_number(
        len(data[0] if isinstance(data[0], list) else data)
    )
    logger.info(f"Generated {total_batches} batches")

    for i in range(total_batches):
        start, end = (
            i * TRAINING_BATCH_SIZE,
            i * TRAINING_BATCH_SIZE + TRAINING_BATCH_SIZE,
        )

        if data and isinstance(data, list) and isinstance(data[0], list):
            yield tuple(sub_data[start:end] for sub_data in data)
        else:
            yield data[start:end]
