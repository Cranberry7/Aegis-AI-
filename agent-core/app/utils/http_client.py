"""Http client for making requests with JWT authentication."""

from typing import Any

import httpx

from app.config import settings
from app.utils.logger import logger


class HttpClient:
    """Reusable HTTP client for calling backend services with JWT authentication."""

    def __init__(self, base_url: str | None = None, token: str | None = None) -> None:
        """Initialize the HttpClient."""
        self.base_url = (base_url or settings.BACKEND_URL).rstrip("/")
        self.client = httpx.Client(
            base_url=self.base_url,
            headers={"Content-Type": "application/json"},
        )
        if token:
            self.set_token(token)

    def set_token(self, token: str) -> None:
        """Set or update the JWT token."""
        self.client.cookies["token"] = token

    def get(self, path: str, **kwargs: Any) -> httpx.Response:
        """Send a GET request to the specified path."""
        return self._request("GET", path, **kwargs)

    def post(
        self, path: str, data: Any | None = None, json: Any | None = None, **kwargs: Any
    ) -> httpx.Response:
        """Send a POST request to the specified path."""
        return self._request("POST", path, data=data, json=json, **kwargs)

    def put(
        self, path: str, data: Any | None = None, json: Any | None = None, **kwargs: Any
    ) -> httpx.Response:
        """Send a PUT request to the specified path."""
        return self._request("PUT", path, data=data, json=json, **kwargs)

    def delete(self, path: str, **kwargs: Any) -> httpx.Response:
        """Send a DELETE request to the specified path."""
        return self._request("DELETE", path, **kwargs)

    def _request(self, method: str, path: str, **kwargs: Any) -> httpx.Response:
        """Handle HTTP requests with logging and error handling."""
        if "token" not in self.client.cookies:
            raise ValueError("JWT token must be set before making requests")
        if not path.startswith("/"):
            path = "/" + path

        url = self.base_url + path
        logger.info(f"{method} request to: {url}")

        try:
            resp = self.client.request(method, path, **kwargs)
            resp.raise_for_status()
        except httpx.HTTPError as err:
            logger.exception(f"{method} {url} failed.")
            raise RuntimeError(f"{method} {url} failed: {err}") from err
        else:
            return resp
