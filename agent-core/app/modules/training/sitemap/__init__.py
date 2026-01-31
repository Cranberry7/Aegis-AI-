"""Training runner for sitemaps."""

import asyncio
import xml.etree.ElementTree as ET
from typing import override
from urllib.parse import urlparse

import requests
from crawl4ai import CrawlResult

from app.common.enums import EventActionType, SupportedTrainingExtensions
from app.modules.training.markdown import MarkdownTrain
from app.modules.training.scraper.crawler4ai_scraper import crawl_urls
from app.modules.training.training_types import DocMetadata
from app.modules.training.utils.send_events import complete_training_event_sync
from app.utils.logger import logger


class SitemapTrain(MarkdownTrain):
    """Sitemap training runner."""

    def __init__(
        self,
        user_id: str,
        account_id: str,
        source_id: str,
        source_content: str,
        send_complete_event: bool = True,
    ):
        """Sitemap training runner constructor."""
        self.url = source_content
        self.source_name = urlparse(self.url).netloc

        super().__init__(
            user_id,
            account_id,
            source_id,
            self.source_name,
            send_complete_event=send_complete_event,
        )

        self.source_type = SupportedTrainingExtensions.WEB_DOCS

    def __extract_urls_from_sitemap(self, sitemap_url: str) -> list[str]:
        """Extract URLs from a sitemap."""
        urls = []

        try:
            # Fetch the sitemap XML
            response = requests.get(sitemap_url)
            response.raise_for_status()  # Raise an error for HTTP issues

            # Parse the XML content
            root = ET.fromstring(response.content)

            # Extract all URLs from <loc> tags
            urls = [
                element.text or ""
                for element in root.iter()
                if element.tag.endswith("loc")
            ]
        except requests.exceptions.RequestException as e:
            logger.exception(f"Error fetching the sitemap: {e}")
        except ET.ParseError as e:
            logger.exception(f"Error parsing the XML: {e}")

        return urls

    @override
    def run(self) -> None:
        """Run the sitemap training."""
        try:
            urls: list[str] = self.__extract_urls_from_sitemap(self.url)
            total_urls: int = len(urls)
            success_urls: int = 0

            markdown_results: list[CrawlResult] = asyncio.run(crawl_urls(urls))

            all_urls_chunks: list[str] = []
            all_urls_metadata: list[DocMetadata] = []

            for result in markdown_results:
                text_chunks, chunk_metadata = self.chunk_markdown_text(result)
                all_urls_chunks.extend(text_chunks)
                all_urls_metadata.extend(chunk_metadata)

            self.add_to_vector_db(all_urls_chunks, all_urls_metadata)

            if self.send_complete_event:
                complete_training_event_sync(
                    self.user_id,
                    self.account_id,
                    self.source_id,
                    EventActionType.COMPLETED,
                )

            logger.info(
                f"Successfully trained {success_urls} out of {total_urls} urls."
            )
            if self.send_complete_event:
                complete_training_event_sync(
                    self.user_id,
                    self.account_id,
                    self.source_id,
                    EventActionType.COMPLETED,
                )
        except Exception:
            logger.exception("Error while training on sitemap")

            if self.send_complete_event:
                complete_training_event_sync(
                    self.user_id,
                    self.account_id,
                    self.source_id,
                    EventActionType.FAILED,
                )
