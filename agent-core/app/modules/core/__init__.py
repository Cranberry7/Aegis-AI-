"""Core Agent Module."""

import asyncio
from time import time
from uuid import uuid4

from fastapi import Request

from app.common.constants import ERROR_MESSAGES
from app.common.enums import ConversationType, EventMessageType
from app.common.types import ChatRequest, ConversationPayload
from app.modules.agent_backend import agent_backend
from app.modules.core.teams.customer_support_team import run_customer_support_team
from app.modules.core.tools.publisher import publish_message
from app.utils.context import get_context, set_context
from app.utils.logger import logger


async def prompt_agent(request: Request, chat_request: ChatRequest):
    """Execute agent call."""
    user_msg_id: str = str(uuid4())
    agent_message_id: str = str(uuid4())
    token = request.cookies.get("token") or ""
    agent_response: str = ""

    try:
        start = time()
        user_query: str = chat_request.query.strip()
        session_id: str = chat_request.session_id
        user_id: str = chat_request.user_id

        if not user_query:
            logger.error(ERROR_MESSAGES.INVALID_USER_QUERY)
            return

        # Set the context for our status publisher tool
        set_context("user_id", user_id)
        set_context("session_id", session_id)
        set_context("agent_message_id", agent_message_id)
        set_context("token", token)

        # Save the user message
        await asyncio.to_thread(
            agent_backend.add_conversation_to_db,
            token,
            session_id,
            ConversationPayload(content=user_query),
            ConversationType.USER,
            user_msg_id,
        )

        await publish_message(EventMessageType.AGENT_RESPONSE, "")
        await publish_message(
            EventMessageType.DEBUG, "Agent is processing the query..."
        )

        # Execute customer support team workflow
        agent_response = await run_customer_support_team(
            user_query, user_id, agent_message_id, session_id
        )

        # Get video references from the workflow
        list_of_references = get_context("video_references")
        source_ids = get_context("source_ids")

        await publish_message(
            EventMessageType.DEBUG,
            f"Took {time() - start:.2f} seconds to process and respond",
        )

        # Signal the end of the stream
        await publish_message(EventMessageType.END, "")

        # Save the agent response
        await asyncio.to_thread(
            agent_backend.add_conversation_to_db,
            token,
            session_id,
            ConversationPayload(
                content=agent_response,
                videoReferences=list_of_references,
                sourceIds=source_ids,
            ),
            ConversationType.AGENT,
            agent_message_id,
        )

    except Exception as err:
        logger.exception(err)

        error_message_id = str(uuid4())

        await publish_message(EventMessageType.ERROR, str(err))
        await asyncio.to_thread(
            agent_backend.add_conversation_to_db,
            token=token,
            session_id=session_id,
            payload=ConversationPayload(content=str(err)),
            source=ConversationType.SYSTEM,
            message_id=error_message_id,
        )
