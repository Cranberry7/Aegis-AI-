"""Descriptor Agent."""

from agno.agent import Agent, RunResponse
from agno.media import Audio as InputAudio
from agno.media import Image as InputImage
from agno.media import Video as InputVideo
from fastapi import UploadFile

from app.common.enums import MediaType
from app.common.prompts import (
    ANNOTATION_AGENT_DESCRIPTION,
    ANNOTATION_AGENT_INSTRUCTIONS,
    ANNOTATION_AGENT_PROMPT,
)
from app.modules.core.llm import agent_llm
from app.utils.logger import logger
from app.utils.video import get_video_from_url

descriptor_agent = Agent(
    name="Media Analysis Agent",
    description=ANNOTATION_AGENT_DESCRIPTION,
    instructions=ANNOTATION_AGENT_INSTRUCTIONS,
    model=agent_llm,
)


def describe_media_url(media_url: str, media_type: MediaType) -> str:
    """Describe a media from a URL."""
    try:
        if media_type == MediaType.VIDEO:
            video_file: UploadFile = get_video_from_url(media_url)
            video_bytes = video_file.file.read()

        response: RunResponse = descriptor_agent.run(
            ANNOTATION_AGENT_PROMPT.format(media_type=media_type),
            images=(
                [InputImage(url=media_url)] if media_type == MediaType.IMAGE else None
            ),
            audio=(
                [InputAudio(url=media_url)] if media_type == MediaType.AUDIO else None
            ),
            # S3 url not supported as input
            videos=(
                [InputVideo(content=video_bytes)]
                if media_type == MediaType.VIDEO
                else None
            ),
        )
    except Exception as e:
        logger.error(
            f"Unable to generate annotation for {media_type} url ({media_url}) - {e}"
        )
        return ""
    else:
        return response.content
