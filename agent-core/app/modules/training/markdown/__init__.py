"""Process MarkDown files for training."""

import re
from collections.abc import Generator
from typing import override

from app.common.enums import (
    EventActionType,
    KnowledgeType,
    MediaType,
    SupportedTrainingExtensions,
)
from app.modules.core.agents.descriptor_agent import describe_media_url
from app.modules.data.chunk.fixed_chunking import chunk_markdown
from app.modules.db.vector_db import add_chunks_to_vector_db
from app.modules.training import Train
from app.modules.training.training_types import DocMetadata
from app.modules.training.utils import get_batches
from app.modules.training.utils.send_events import complete_training_event_sync
from app.utils.exceptions import TrainingError
from app.utils.image import generate_image_hash, save_base64_image
from app.utils.logger import logger
from app.utils.shlink import shorten_url


class MarkdownTrain(Train):
    """Markdown training runner."""

    def __init__(  # noqa: PLR0913
        self,
        user_id: str,
        account_id: str,
        source_id: str,
        source_name: str,
        source_content: str = "",
        source_url: str = "",
        send_complete_event: bool = True,
    ):
        """Markdown training runner constructor."""
        super().__init__(
            user_id,
            account_id,
            source_id,
            source_type=SupportedTrainingExtensions.MARKDOWN,
            source_url=source_url,
            send_complete_event=send_complete_event,
        )
        self.source_name: str = source_name
        self.source_content: str = source_content

    def process_images(self, content: str) -> str:
        """Process images in markdown content."""
        # Find all image links and process them
        pattern = r"!\[([^\]]*)\]\(([^)]+)\)"
        matches = re.findall(pattern, content)
        for alt_text, image_url in matches:
            if image_url.startswith("data:image/"):
                # Handle base64 images
                base64_pattern = r"data:image/([^;]+);base64,(.+)"
                base64_match = re.match(base64_pattern, image_url)
                if base64_match:
                    image_type = base64_match.group(1)
                    base64_data = base64_match.group(2)
                    image_hash = generate_image_hash(base64_data)
                    image_name = f"image_{image_hash}.{image_type}"
                    new_image_url = save_base64_image(
                        base64_data,
                        f"{self.account_id}/{self.user_id}/{self.source_id}",
                        image_name,
                    )
            else:
                new_image_url = image_url

            # Handle normal image URLs
            new_alt_text = describe_media_url(
                new_image_url, MediaType.IMAGE
            )  # short URL does not work for LLM, thus full URL
            content = content.replace(
                f"![{alt_text}]({image_url})",
                f"![{new_alt_text}]({shorten_url(new_image_url)})",
            )

        return content

    def get_content_in_markdown(self) -> Generator:
        """Get content from the source in markdown format."""
        file_content: str = self.process_images(self.source_content)
        yield file_content

    def chunk_markdown_text(self, text: str) -> tuple[list, list[DocMetadata]]:
        """Chunk markdown text."""
        return chunk_markdown(
            text,
            source=self.source_name,
            source_id=self.source_id,
            source_url=self.source_url,
        )

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
                knowledge_type=KnowledgeType.TEXT,
            )

    @override
    def run(self):
        try:
            for markdown_text in self.get_content_in_markdown():
                text_chunks, chunk_metadata = self.chunk_markdown_text(markdown_text)
                self.add_to_vector_db(text_chunks, chunk_metadata)
            if self.send_complete_event:
                complete_training_event_sync(
                    self.user_id,
                    self.account_id,
                    self.source_id,
                    EventActionType.COMPLETED,
                )
        except Exception as e:
            logger.exception("Error while training on markdown document")
            raise TrainingError(str(e)) from e
