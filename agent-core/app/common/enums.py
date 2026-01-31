"""Enums for core application."""

from enum import Enum


class StatusType(Enum):
    """Request status enum."""

    SUCCESS = "SUCCESS"
    FAILURE = "FAILURE"


class EventMessageType(Enum):
    """Types of message to frontend."""

    DEBUG = "debug"
    AGENT_RESPONSE = "agent_response"
    ERROR = "error"
    END = "end"
    SUGGESTED_QUESTIONS = "suggested_questions"
    VIDEO_REFERENCE = "video_reference"


class EventActionType(Enum):
    """Event action type enum."""

    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    NEW = "NEW"
    ACKNOWLEDGED = "ACKNOWLEDGED"


class TrainingEventActions(Enum):
    """Training event action type enum."""

    NEW = "new"
    DELETE = "delete"


class EventResponseType(Enum):
    """Event response type enum."""

    DEBUG = "debug"
    FINAL = "final"


class EventResponseSeverity(Enum):
    """Event response type enum."""

    LOW = "low"
    HIGH = "high"


class TrainingResourceType(Enum):
    """Training resource type enum."""

    FILE = "file"
    URL = "url"
    SITEMAP = "sitemap"


class KnowledgeType(Enum):
    """Knowledge type enum."""

    TEXT = "text"
    MEDIA = "media"


class SupportedTrainingExtensions(Enum):
    """Supported training file types and sources enum."""

    MARKDOWN = "md"
    TEXT = "txt"
    PDF = "pdf"
    WEB_DOCS = "web_docs"

    # Video types
    YOUTUBE = "youtube"
    VIDEO_MP4 = "mp4"
    VIDEO_MOV = "mov"
    VIDEO_AVI = "avi"
    VIDEO_WMV = "wmv"
    VIDEO_WEBM = "webm"


class MediaType(Enum):
    """Types of media."""

    IMAGE = "image"
    VIDEO = "video"
    AUDIO = "audio"


class SuggestedQuestionsType(Enum):
    """Refers to the type of suggested question."""

    INITIAL = "initial"
    FOLLOW_UP = "follow up"


class ConversationType(Enum):
    """Types of conversations."""

    USER = "user"
    AGENT = "agent_response"
    SYSTEM = "system"
