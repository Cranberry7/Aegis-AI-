"""Module for scraping data using Crawl4AI."""

from crawl4ai import CrawlerRunConfig, CrawlResult
from crawl4ai.async_webcrawler import AsyncWebCrawler

from app.utils.logger import logger

exclude_following_tags: list[str] = [
    "header",
    "footer",
    "nav",
    "aside",
    ".header",
    ".top",
    ".navbar",
    "#header",
    ".footer",
    ".bottom",
    "#footer",
    ".sidebar",
    ".side",
    ".aside",
    "#sidebar",
    ".modal",
    ".popup",
    "#modal",
    ".overlay",
    ".ad",
    ".ads",
    ".advert",
    "#ad",
    ".lang-selector",
    ".language",
    "#language-selector",
    ".social",
    ".social-media",
    ".social-links",
    "#social",
    ".menu",
    ".navigation",
    "#nav",
    ".breadcrumbs",
    "#breadcrumbs",
    ".share",
    "#share",
    ".widget",
    "#widget",
    ".cookie",
    "#cookie",
]


config = CrawlerRunConfig(
    # Tag exclusions
    excluded_tags=exclude_following_tags,
)


async def crawl_url(url: str) -> str | None:
    """Crawl a URL and return the markdown content."""
    async with AsyncWebCrawler() as crawler:
        result: CrawlResult = await crawler.arun(url=url, config=config)
        return result.markdown


async def crawl_urls(urls: list[str]) -> list[str]:
    """Crawl a list of URLs and return the markdown content."""
    async with AsyncWebCrawler() as crawler:
        results: list[str] = []

        for url in urls:
            try:
                result: CrawlResult = await crawler.arun(url=url, config=config)
                results.append(result.markdown)
            except Exception as error:
                logger.error(f"Error while crawling url: {url} - {error!s}")
                results.append("")

        return results
