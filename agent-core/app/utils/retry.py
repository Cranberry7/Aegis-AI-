"""Retry util."""

import asyncio
import inspect
import time
from collections.abc import Callable
from functools import wraps

from app.utils.logger import logger


def retry_on_exception(
    max_retries: int = 3,
    delay_seconds: float = 1,
    exceptions: tuple = (Exception,),
    retry_condition: Callable[[Exception], bool] | None = None,
):
    """Retry decorator."""

    def decorator(func):
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            attempts = 0
            while attempts < max_retries:
                try:
                    return await func(*args, **kwargs)
                except exceptions as e:
                    if retry_condition and not retry_condition(e):
                        raise
                    attempts += 1
                    logger.debug(f"Attempt {attempts}/{max_retries} failed: {e}")
                    if attempts < max_retries:
                        await asyncio.sleep(delay_seconds)
                    else:
                        raise  # Re-raise the exception after max retries
            return None

        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            attempts = 0
            while attempts < max_retries:
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    if retry_condition and not retry_condition(e):
                        raise
                    attempts += 1
                    logger.debug(f"Attempt {attempts}/{max_retries} failed: {e}")
                    if attempts < max_retries:
                        time.sleep(delay_seconds)
                    else:
                        raise  # Re-raise the exception after max retries
            return None

        if inspect.iscoroutinefunction(func):
            return async_wrapper
        return sync_wrapper

    return decorator
