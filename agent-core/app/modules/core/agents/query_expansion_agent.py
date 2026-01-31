"""Query Expansion Agent."""

from agno.agent.agent import Agent

from app.common.prompts import (
    QUERY_EXPANSION_AGENT_DESCRIPTION,
    QUERY_EXPANSION_AGENT_INSTRUCTIONS,
)
from app.modules.core.knowledge_bases import text_knowledge_base
from app.modules.core.llm import agent_llm
from app.modules.core.tools import publish_status

query_expansion_agent = Agent(
    name="Query expansion agent",
    description=QUERY_EXPANSION_AGENT_DESCRIPTION,
    instructions=QUERY_EXPANSION_AGENT_INSTRUCTIONS,
    tools=[text_knowledge_base.vector_db.basic_search, publish_status],
    model=agent_llm,
    add_datetime_to_instructions=True,
    # debug_mode=True,  # Uncomment for testing
)
