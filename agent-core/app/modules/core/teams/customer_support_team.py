"""Customer Support Team."""

from agno.team import Team

from app.common.enums import EventMessageType
from app.common.prompts import CUSTOMER_SUPPORT_TEAM_LEAD_INSTRUCTIONS
from app.modules.core.agents import query_expansion_agent
from app.modules.core.llm import agent_llm
from app.modules.core.memories import (
    get_current_user_memories,
    memory,
    update_user_memory,
)
from app.modules.core.storage import redis_agent_storage
from app.modules.core.tools.publisher import publish_message
from app.modules.core.workflows.qna_workflow import run_qna_workflow

customer_support_team = Team(
    name="Customer Support Team",
    mode="coordinate",
    model=agent_llm,
    instructions=CUSTOMER_SUPPORT_TEAM_LEAD_INSTRUCTIONS,
    members=[query_expansion_agent],
    tools=[
        run_qna_workflow,
        update_user_memory,
        get_current_user_memories,
    ],
    # debug_mode=True,  # Uncomment for detailed logs
    memory=memory,
    storage=redis_agent_storage,
    enable_agentic_memory=True,
    enable_user_memories=True,
    read_team_history=True,
    enable_team_history=True,
    add_datetime_to_instructions=True,
)


async def run_customer_support_team(
    user_query: str, user_id: str, agent_message_id: str, session_id: str
) -> str:
    """Run the customer support team and return the agent response."""
    agent_response = ""
    async for response_chunk in await customer_support_team.arun(
        message=user_query,
        user_id=user_id,
        agent_message_id=agent_message_id,
        session_id=session_id,
        stream=True,
    ):
        if response_chunk.content:
            agent_response += response_chunk.content
            await publish_message(
                EventMessageType.AGENT_RESPONSE, response_chunk.content
            )
    return agent_response
