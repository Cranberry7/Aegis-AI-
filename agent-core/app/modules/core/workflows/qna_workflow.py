"""Customer agent QnA workflow."""

import asyncio

from agno.agent import Agent
from agno.workflow import Workflow

from app.common.enums import EventMessageType
from app.config import settings
from app.modules.agent_backend import agent_backend
from app.modules.core.agents.gk_agent import gk_agent
from app.modules.core.agents.video_search_agent import run_video_search_agent
from app.modules.core.knowledge_bases import text_knowledge_base
from app.modules.core.memories import get_current_user_memories, get_last_n_interactions
from app.modules.core.tools.publisher import publish_message
from app.utils.context import get_all_context, set_context
from app.utils.logger import logger

ENABLE_VIDEO_SEARCH: bool = settings.ENABLE_VIDEO_SEARCH


class CustomerSupportQnAWorkflow(Workflow):
    """Customer support QnA workflow."""

    description: str = (
        "A workflow to answer user queries similar to an expert customer support agent."
    )

    gk_agent: Agent = gk_agent

    async def run_workflow(
        self,
        token: str,
        message: str,
        user_id: str,
        session_id: str,
        agent_message_id: str,
    ):
        """Run the workflow."""
        self.user_id = user_id if user_id else ""
        self.session_id = session_id if session_id else ""
        self.agent_message_id = agent_message_id if agent_message_id else ""

        await publish_message(EventMessageType.AGENT_RESPONSE, "")
        await publish_message(EventMessageType.DEBUG, "Searching knowledge base...")

        # Prepare agent workflow tasks
        async def run_gk_agent():
            search_results = await text_knowledge_base.vector_db.async_search(message)

            source_ids = []
            for doc in search_results:
                meta = getattr(doc, "meta_data", {}) or {}
                sid = (
                    meta.get("source_id")
                    if isinstance(meta, dict)
                    else getattr(meta, "source_id", None)
                )
                if sid:
                    source_ids.append(sid)
            set_context("source_ids", source_ids)

            search_block = (
                f"[SEARCH_RESULTS]\n{search_results}\n" if search_results else ""
            )

            query_template = f"""
            [USER_QUERY]
            {message}
            {search_block}
            [CHAT_HISTORY]
            {await asyncio.to_thread(get_last_n_interactions)}
            [USER_MEMORIES]
            {await asyncio.to_thread(get_current_user_memories)}
            """

            await publish_message(EventMessageType.DEBUG, "Synthesizing answer...")

            agent_response = await gk_agent.arun(
                message=query_template,
                user_id=user_id,
                session_id=session_id,
                agent_message_id=agent_message_id,
            )

            if not agent_response or not agent_response.content:
                raise ValueError("Agent failed to generate a response")

            return agent_response.content

        # Execute both operations concurrently if video search is enabled
        if ENABLE_VIDEO_SEARCH:
            response, video_references = await asyncio.gather(
                run_gk_agent(),
                run_video_search_agent(message, user_id, session_id),
            )
        else:
            response = await run_gk_agent()
            video_references = None

        yield response.answer

        # Handle video references
        video_references_list = []
        if video_references and video_references.references:
            video_count = len(video_references.references)
            yield f"\n\n ({video_count} video reference{'s' if video_count > 1 else ''} provided)"  # noqa: E501

            for reference in video_references.references:
                await publish_message(
                    EventMessageType.VIDEO_REFERENCE, reference.model_dump_json()
                )
                video_references_list.append(reference.model_dump())

        # Store video references in context
        set_context("video_references", video_references_list)

        # Publish suggested questions to the user
        if response.suggested_questions:
            logger.debug("Publishing suggested questions to the user")
            for question in response.suggested_questions:
                await publish_message(EventMessageType.SUGGESTED_QUESTIONS, question)

        # Publish title to the session context
        if response.title:
            logger.debug("Publishing title to the session context")
            await asyncio.to_thread(
                agent_backend.update_session_title,
                token=token,
                session_id=session_id,
                title=response.title,
                user_id=user_id,
            )

        logger.info(
            "[QNA Workflow] Processed the user query and returned with response"
        )


async def run_qna_workflow(query: str):
    """Run the customer support workflow.

    This function takes in the user query and the chat history and returns the
    response from the customer support workflow.
    """
    context: dict = get_all_context()
    customer_support_workflow = CustomerSupportQnAWorkflow()

    return customer_support_workflow.run_workflow(
        message=query,
        token=context["token"],
        user_id=context["user_id"],
        session_id=context["session_id"],
        agent_message_id=context["agent_message_id"],
    )
