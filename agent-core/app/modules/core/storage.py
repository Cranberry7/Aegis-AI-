"""Storage for the llm."""

from agno.storage.redis import RedisStorage

from app.config import settings

REDIS_HOST = settings.REDIS_HOST
REDIS_PORT = settings.REDIS_PORT

redis_agent_storage = RedisStorage(
    prefix="agent_storage", host=REDIS_HOST, port=REDIS_PORT
)
