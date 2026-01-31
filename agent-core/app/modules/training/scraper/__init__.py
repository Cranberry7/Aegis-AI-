"""Collect data via scrapers."""

import asyncio
from collections.abc import Generator
from typing import override
from urllib.parse import urlparse

from app.common.enums import SupportedTrainingExtensions
from app.modules.training.markdown import MarkdownTrain
from app.modules.training.scraper.crawler4ai_scraper import crawl_url


class URLTrain(MarkdownTrain):
    """URL training runner."""

    def __init__(  # noqa: PLR0913
        self,
        user_id: str,
        account_id: str,
        source_id: str,
        source_content: str,
        source_url: str,
        send_complete_event: bool = True,
    ):
        """URL training runner constructor."""
        self.source_name = urlparse(source_content).netloc

        super().__init__(
            user_id,
            account_id,
            source_id,
            self.source_name,
            source_content,
            source_url,
            send_complete_event,
        )

        self.source_type = SupportedTrainingExtensions.WEB_DOCS

    @override
    def get_content_in_markdown(self) -> Generator:
        scraped_data: str | None = asyncio.run(crawl_url(self.source_url))
        yield scraped_data if scraped_data else ""
