"""Agents for Core Module."""

from app.modules.core.agents.descriptor_agent import descriptor_agent
from app.modules.core.agents.gk_agent import gk_agent
from app.modules.core.agents.query_expansion_agent import query_expansion_agent

core_agents = [gk_agent, query_expansion_agent, descriptor_agent]
