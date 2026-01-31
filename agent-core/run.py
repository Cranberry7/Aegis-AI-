"""Runner for FastAPI app."""

import uvicorn
from fastapi import FastAPI

from app.config import settings
from app.main import create_app

app: FastAPI = create_app()

PORT: int = settings.AGENT_CORE_PORT
NUM_WORKERS: int = settings.NUM_WORKERS


def run() -> None:
    """Start uvicorn preview server."""
    uvicorn.run("run:app", host="0.0.0.0", port=PORT, workers=NUM_WORKERS)


def run_dev() -> None:
    """Start uvicorn dev server."""
    uvicorn.run("run:app", host="0.0.0.0", port=PORT, reload=True)


if __name__ == "__main__":
    run()
