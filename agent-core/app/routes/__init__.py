"""Application Routes."""

from app.common.types import FastAPIApp
from app.routes.chat_routes import chat_router
from app.routes.health_routes import health_router
from app.routes.scalar_docs_routes import get_scalar_router
from app.routes.stream_routes import stream_router
from app.routes.tasks_routes import tasks_router
from app.utils.rate_limiter import init_rate_limiter


def add_scalar_routes(app: FastAPIApp) -> None:
    """Add scalar routes to the application."""
    scalar_router = get_scalar_router(app)
    app.include_router(scalar_router, prefix="/docs", tags=["Documentation"])


def register_routes(app: FastAPIApp) -> None:
    """Register all routes to the application."""
    init_rate_limiter(app)

    app.include_router(health_router, prefix="/health", tags=["Health"])
    app.include_router(tasks_router, prefix="/task", tags=["Tasks"])
    app.include_router(chat_router, prefix="/chat", tags=["Chat"])
    app.include_router(stream_router, prefix="/stream", tags=["Stream"])
