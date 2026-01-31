"""Common models and data classes."""

from dataclasses import dataclass
from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel


@dataclass
class ResMessage:
    """Return message object."""

    data: dict | str = ""
    task_id: str | None = ""


class BaseResponseModel(BaseModel):
    """Base response model for all endpoints."""

    status: Literal["SUCCESS", "ERROR"] = "SUCCESS"
    data: Any
    task_id: str = ""
    timestamp: datetime


class HealthResponseModel(BaseResponseModel):
    """Response model for health endpoints."""

    data: Literal["pong!"]


class TaskStatusResponseModel(BaseResponseModel):
    """Response model for task status endpoints."""

    data: dict  # Task status data


class ChatResponseModel(BaseResponseModel):
    """Response model for chat endpoints."""

    data: Literal["OK"]
