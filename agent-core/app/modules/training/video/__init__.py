"""Video Training."""

from collections.abc import Generator
from typing import override
from urllib.parse import urlparse

from app.common.enums import KnowledgeType, MediaType, SupportedTrainingExtensions
from app.modules.core.agents.descriptor_agent import describe_media_url
from app.modules.db.vector_db import add_chunks_to_vector_db
from app.modules.training.markdown import MarkdownTrain
from app.modules.training.training_types import DocMetadata
from app.modules.training.utils import get_batches
from app.utils.video import youtube_tools


class VideoTrain(MarkdownTrain):
    """Video training runner."""

    def __init__(  # noqa: PLR0913
        self,
        user_id: str,
        account_id: str,
        source_id: str,
        source_content: str,
        source_url: str,
        source_name: str | None = None,
        send_complete_event: bool = True,
    ):
        """Video training runner constructor."""
        self.source_name = (
            source_name if source_name else urlparse(source_content).netloc
        )

        super().__init__(
            user_id,
            account_id,
            source_id,
            self.source_name,
            source_content,
            source_url,
            send_complete_event,
        )

    def __identify_video_extension(self) -> SupportedTrainingExtensions:
        """Identify the extension of video."""
        if self.source_url.endswith(".mov"):
            return SupportedTrainingExtensions.VIDEO_MOV
        if self.source_url.endswith(".avi"):
            return SupportedTrainingExtensions.VIDEO_AVI
        if self.source_url.endswith(".wmv"):
            return SupportedTrainingExtensions.VIDEO_WMV
        if self.source_url.endswith(".webm"):
            return SupportedTrainingExtensions.VIDEO_WEBM

        # Default extension
        return SupportedTrainingExtensions.VIDEO_MP4

    @override
    def add_to_vector_db(
        self,
        text_chunks: list[str],
        chunk_metadata: list[DocMetadata],
    ) -> None:
        """Add chunks to vector db."""
        for batch_chunks, batch_metadata in get_batches([text_chunks, chunk_metadata]):
            add_chunks_to_vector_db(
                batch_chunks,
                batch_metadata,
                self.source_type,
                self.source_name,
                knowledge_type=KnowledgeType.MEDIA,
            )

    @override
    def get_content_in_markdown(self) -> Generator:
        # To determine if it is youtube video
        youtube_id = youtube_tools.get_youtube_video_id(self.source_url)
        if youtube_id:
            self.source_type = SupportedTrainingExtensions.YOUTUBE
            self.source_url = f"https://www.youtube.com/embed/{youtube_id}"
            yield youtube_tools.get_video_timestamps(self.source_url)
        else:
            self.source_type = self.__identify_video_extension()
            yield describe_media_url(self.source_url, MediaType.VIDEO)
