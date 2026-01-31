"""Health routes."""

from fastapi import APIRouter, FastAPI
from fastapi.responses import HTMLResponse
from scalar_fastapi import get_scalar_api_reference

# Create router once at module level
scalar_router = APIRouter()


def get_scalar_router(app: FastAPI) -> APIRouter:
    """Get the scalar router with app instance."""
    # Only add the route if it doesn't already exist
    if not scalar_router.routes:

        @scalar_router.get("/", include_in_schema=False)
        async def scalar_html() -> HTMLResponse:
            return get_scalar_api_reference(
                title="AI Agent Core API Documentation",
                openapi_url=app.openapi_url,
                hide_client_button=True,
                default_open_all_tags=True,
                scalar_favicon_url="https://zeno.sarvaha.ai/assets/sarvaha-logo.png",
                servers=[
                    {
                        "name": "prod",
                        "url": "https://zeno.sarvaha.ai/agent-core",
                    }
                ],
            )

    return scalar_router
