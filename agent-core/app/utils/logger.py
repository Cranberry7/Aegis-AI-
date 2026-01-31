"""Logger utility."""

from logging import Logger
from sys import stdout

from loguru import logger as loguru_logger

from app.config import settings

JSON_LOGS = settings.JSON_LOGS
DEBUG_LOGS = settings.DEBUG_LOGS

loguru_logger.remove()

# CLI logs config
loguru_logger.add(
    stdout,
    serialize=JSON_LOGS,
    level="DEBUG" if DEBUG_LOGS else "INFO",
)

# Save logs to file
# loguru_logger.add(
#     "app.log",
#     rotation="5 MB",
#     retention="10 days",
#     serialize=JSON_LOGS,
# )

logger: Logger = loguru_logger  # type: ignore
