"""General knowledge agent."""

from agno.agent.agent import Agent
from pydantic import BaseModel, Field

from app.common.prompts import (
    GENERAL_KNOWLEDGE_AGENT_EXPECTED_FORMAT,
    GENERAL_KNOWLEDGE_AGENT_PROMPT,
)
from app.modules.core.llm import agent_llm


class GkAgentResponse(BaseModel):
    """Response model for the GK agent."""

    answer: str = Field(
        description=f"The comprehensive, user-facing answer in Markdown as per agent instructions. {GENERAL_KNOWLEDGE_AGENT_EXPECTED_FORMAT}",  # noqa: E501
    )
    title: str = Field(
        description="A contextual title summarizing the session intent, which should be concise and relevant to the user's query, do not provide markdown format, it should be plain text"  # noqa: E501
    )
    suggested_questions: list[str] = Field(
        description="A list of 2-5 relevant follow-up questions based on all the context provided."  # noqa: E501
    )


gk_agent = Agent(
    name="General knowledge expert",
    description=GENERAL_KNOWLEDGE_AGENT_PROMPT,
    response_model=GkAgentResponse,
    model=agent_llm,
    add_datetime_to_instructions=True,
    # debug_mode=True,  # Uncomment for testing
    read_chat_history=True,
    num_history_runs=3,
)
