"""Core LLM."""

from agno.models.google import Gemini as AgentLLM

from app.config import settings
from app.utils.logger import logger

LLM_MODEL_NAME: str = settings.LLM_MODEL_NAME
LLM_API_KEY: str = settings.LLM_API_KEY
agent_llm = AgentLLM(id=LLM_MODEL_NAME, api_key=LLM_API_KEY)

logger.debug(f"[Agent] {agent_llm.provider}'s LLM {agent_llm.name} is ready.")
