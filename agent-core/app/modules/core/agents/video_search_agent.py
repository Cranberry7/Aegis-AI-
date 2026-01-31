"""Reference agent for sending video references."""

from agno.agent import Agent
from pydantic import BaseModel, computed_field

from app.common.enums import EventMessageType
from app.common.prompts import (
    VIDEO_SEARCH_AGENT_INSTRUCTIONS,
    VIDEO_SEARCH_AGENT_PROMPT,
)
from app.config import settings
from app.modules.core.knowledge_bases import video_knowledge_base
from app.modules.core.llm import agent_llm
from app.modules.core.tools.publisher import publish_message
from app.utils.video import youtube_tools

ENABLE_VIDEO_SEARCH = settings.ENABLE_VIDEO_SEARCH


# Classes cause circular import in types dir
class VideoReference(BaseModel):
    """video reference."""

    url: str
    title: str
    timeRange: list[str] = ["00:00:00", "00:00:00"]  # noqa: N815

    # only works with computed_field before property
    @computed_field  # type: ignore[prop-decorator]
    @property
    def youtubeId(self) -> str | None:  # noqa: N802
        """Youtube id extracted from url."""
        return youtube_tools.get_youtube_video_id(self.url)


class VideoReferences(BaseModel):
    """video references list."""

    references: list[VideoReference]


video_search_agent = Agent(
    description="Selects valid video references",
    instructions=VIDEO_SEARCH_AGENT_INSTRUCTIONS,
    response_model=VideoReferences,
    model=agent_llm,
)


async def run_video_search_agent(
    user_query: str,
    user_id: str,
    session_id: str,
) -> VideoReferences | None:
    """Run the video search agent and return the list of references."""
    if not ENABLE_VIDEO_SEARCH:
        return None

    await publish_message(EventMessageType.DEBUG, "Searching in videos...")

    video_kb_documents = await video_knowledge_base.vector_db.async_search(
        user_query, user_id=user_id
    )

    video_references = await video_search_agent.arun(
        message=VIDEO_SEARCH_AGENT_PROMPT.format(
            message=user_query,
            video_kb_documents=video_kb_documents,
        ),
        user_id=user_id,
        session_id=session_id,
    )

    return video_references.content
