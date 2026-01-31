"""Module for managing chat history and user memories."""

import asyncio

from agno.memory.v2.db.redis import RedisMemoryDb
from agno.memory.v2.memory import Memory
from agno.storage.session.team import TeamSession

from app.common.enums import EventMessageType
from app.config import settings
from app.modules.core.llm import agent_llm
from app.modules.core.storage import redis_agent_storage
from app.modules.streaming import publish_message
from app.utils.context import ContextType, get_context
from app.utils.logger import logger

REDIS_HOST = settings.REDIS_HOST
REDIS_PORT = settings.REDIS_PORT
REDIS_MEMORY_DB = settings.REDIS_MEMORY_DB

memory = Memory(
    model=agent_llm,
    db=RedisMemoryDb(
        prefix="user_memories",
        db=REDIS_MEMORY_DB,
        host=REDIS_HOST,
        port=REDIS_PORT,
    ),
)


async def update_user_memory(text: str):
    """Update and write user memory for a given user ID.

    Runs in background to avoid blocking the main conversation flow.

    Args:
        text (str): The text or information to be added to the user's memory.

    Returns:
        str: Immediate confirmation message.

    Side Effects:
        - Triggers an update to the user's memory in the memory database (background).
        - May initiate background processing or storage depending on the memory backend.

    Example:
        update_user_memory(text="User likes science fiction books.")

    """
    user_id: ContextType = get_context("user_id")

    # Create background task to avoid blocking
    async def _update_memory_background():
        try:
            await memory.aupdate_memory_task(task=text, user_id=user_id)
            await publish_message(EventMessageType.DEBUG, "User memory updated")
        except Exception:
            await publish_message(EventMessageType.ERROR, "Memory update failed")

    # Start background task without awaiting
    asyncio.create_task(_update_memory_background())  # noqa: RUF006

    return "Memory update initiated"


def get_last_n_interactions(n: int = 10) -> list:
    """Retrieve the last n pairs of interactions for a given session and user.

    Args:
        session_id (str): The unique identifier for the chat session.
        user_id (str): The unique identifier for the user.
        n (int, optional): The number of most recent interaction pairs.
            Defaults to 10.

    Returns:
        list: A list of the last n interaction pairs, where each pair is represented
            as a list of dictionaries with "user" and "assistant" keys.
            If no interactions are found, an empty list is returned.

    Notes:
        - If the session or user does not exist in storage,
          the function returns an empty list.
        - The function logs a warning if no RunResponse event is found for the session.

    """
    session_id: ContextType = get_context("session_id")
    user_id: ContextType = get_context("user_id")

    storage: TeamSession | None = redis_agent_storage.read(
        session_id=session_id,
        user_id=user_id,
    )

    interactions = []
    current_interaction = []

    if storage is None:
        return []

    team_runs = storage.memory.get("runs", {})

    try:
        chat_history = next(
            run for run in team_runs[::-1] if run.get("event") == "RunResponse"
        )["messages"]
    except StopIteration:
        logger.warning(f"No RunResponse found for session {session_id}")
        return []

    filtered_msgs = list(
        filter(
            lambda x: x["role"] in ["user", "assistant"]
            and x.get("content") is not None
            and isinstance(x.get("content"), str)
            and '"answer": ' not in x.get("content", ""),
            chat_history,
        )
    )

    for msg in filtered_msgs:
        role = msg["role"]
        content = msg["content"].split("[SEARCH_RESULTS]")[0]

        if role == "user":
            current_interaction += [{"user": content}]
        elif role == "assistant" and current_interaction:
            current_interaction.append({"assistant": content})
            interactions.append(current_interaction)
            current_interaction = []

    logger.debug(
        f"Fetched last {n} interactions for user: {user_id} and session: {session_id}"
    )

    return interactions[-n:] if interactions else []


def get_current_user_memories() -> str:
    r"""Fetch and concatenate all memories associated with the current user.

    Returns:
        str: All user memories joined by "\n---\n".
        Returns an empty string if the user has no memories.

    """
    user_id: ContextType = get_context("user_id")

    user_memories: str = "\n---\n".join(
        [
            user_memory.memory
            for user_memory in memory.get_user_memories(user_id=user_id)
        ]
    )
    logger.debug(f"Fetched user memories for user: {user_id}")
    return user_memories
