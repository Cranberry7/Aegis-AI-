"""Application entrypoint module."""

import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware

from app.common.constants import APPLICATION_DESCRIPTION, APPLICATION_TITLE
from app.common.types import FastAPIApp
from app.config import settings
from app.middlewares import error_handler, validate_jwt_token, validation_error_handler
from app.modules.rabbitmq.listener import start_rabbitmq_listener
from app.modules.tracing.tracer import init_tracer
from app.routes import add_scalar_routes, register_routes
from app.utils.logger import logger

CORS_ORIGIN: str = settings.CORS_ORIGINS


@asynccontextmanager
async def lifespan(app: FastAPI):
    """App lifespan handler for startup and ending events."""
    asyncio.create_task(start_rabbitmq_listener())  # noqa: RUF006
    yield
    logger.info("Stopping the Agent Core Service...")


def create_app() -> FastAPIApp:
    """Create and initialize the FastAPI app."""
    if settings.ENABLE_TRACING:
        logger.debug("Initializing tracing...")
        init_tracer()

    origins: list[str] = CORS_ORIGIN.split(",")

    app = FastAPI(
        title=APPLICATION_TITLE,
        description=APPLICATION_DESCRIPTION,
        version="1.0.0",
        root_path="/agent-core",
        openapi_url=(
            "/agent-core/openapi.json"
            if settings.ENVIRONMENT == "PROD"
            else "/openapi.json"
        ),
        lifespan=lifespan,
        docs_url=None,
        redoc_url=None,
    )
    # 1. CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # 2. Error handler (wraps others)
    app.add_exception_handler(RequestValidationError, validation_error_handler)
    app.middleware("http")(error_handler)

    # 3. JWT validator middleware
    app.middleware("http")(validate_jwt_token)

    # 4. Register all routers (must include /chat)
    register_routes(app)
    add_scalar_routes(app)

    logger.debug("Agent Core Service is running...")
    return app
