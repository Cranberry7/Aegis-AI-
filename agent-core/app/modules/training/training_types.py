"""Types for the app."""

from pydantic import BaseModel, Field, field_validator

from app.common.constants import RABBITMQ_QUEUES
from app.common.enums import (
    TrainingEventActions,
    TrainingResourceType,
)
from app.common.types import IncomingReqSerializer, ResponseSerializer


class DocMetadata(IncomingReqSerializer):
    """Metadata object for documents."""

    chunk_index: int
    headers: str
    source: str


# Training Event Types
class UrlTrainingMetadata(IncomingReqSerializer):
    """URL training metadata model."""

    url: str
    source_id: str = Field(alias="sourceId")
    is_media: bool


class FileTrainingMetadata(IncomingReqSerializer):
    """File training metadata model."""

    file_name: str
    original_name: str
    size: int
    mimetype: str
    source_id: str
    folder: str
    is_media: bool = False


class TrainingContent(IncomingReqSerializer):
    """Training content model."""

    resource_type: TrainingResourceType
    metadata: UrlTrainingMetadata | FileTrainingMetadata


class TrainingDataObject(IncomingReqSerializer):
    """Training data object model."""

    content: TrainingContent
    action: TrainingEventActions


class EventObject(IncomingReqSerializer):
    """Event object type for rabbitmq message."""

    user_id: str
    account_id: str
    timestamp: str
    data: object | list


class TrainingEvent(EventObject):
    """Training event model."""

    # Override
    data: list[TrainingDataObject]


# Delete knowledge event
class DeleteKnowledgeDataObject(IncomingReqSerializer):
    """Delete knowledge data object model."""

    document_id: str


class DeleteKnowledgeEvent(EventObject):
    """Delete knowledge event model."""

    # Override
    data: DeleteKnowledgeDataObject


# --- Send event ---------------------------------------------------------------


class CompleteTrainingEvent(ResponseSerializer):
    """Complete training event model."""

    user_id: str
    account_id: str
    timestamp: str
    data: object


class EventBody(ResponseSerializer):
    """Event body model."""

    pattern: str
    data: CompleteTrainingEvent

    @field_validator("pattern")
    def validate_option(cls, v):  # noqa: N805
        """Validate the event pattern."""
        assert v in vars(RABBITMQ_QUEUES).values()
        return v


class EventMetadata(IncomingReqSerializer):
    """Event metadata model."""

    account_id: str
    user_id: str


class ExtractedImage(BaseModel):
    """Extracted Image from OCR."""

    description: str = Field(..., description="A description of the image.")


class StoredImageObject(BaseModel):
    """Stored Image Object."""

    path: str
    annotation: str


StoredImages = dict[str, StoredImageObject]
