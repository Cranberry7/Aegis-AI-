"""Helper function to shorten URLs using Shlink API."""

from app.config import settings
from app.utils.http_client import HttpClient

API_KEY_HEADER = {"X-Api-Key": settings.SHLINK_API_KEY}


def shorten_url(long_url: str) -> str:
    """Shorten a URL using shlink service."""
    client = HttpClient(base_url=str(settings.SHLINK_BASE_URL))
    client.set_token("")
    client.client.headers.update(API_KEY_HEADER)

    resp = client.post(
        "/rest/v2/short-urls",
        json={"longUrl": long_url, "findIfExists": True},
    )
    resp.raise_for_status()
    return resp.json()["shortUrl"]
