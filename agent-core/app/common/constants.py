"""Application Constants."""

from typing import NoReturn

from app.common.enums import SupportedTrainingExtensions


class _ImmutableConstants:
    """A class to define immutable constants."""

    def __setattr__(self, *args) -> NoReturn:
        raise AttributeError(ERROR_MESSAGES.CONSTANTS_CANNOT_MODIFY)

    def __delattr__(self, *args) -> NoReturn:
        raise AttributeError(ERROR_MESSAGES.CONSTANTS_CANNOT_DELETE)


class SUCCESS_MESSAGES(_ImmutableConstants):  # noqa: N801
    """Success messages constants."""

    # Core (Agent)
    AGENT_RESPONSE_SUCCESS: str = "[Agent] Agent Responded Successfully."
    STREAMING_CHANNEL_STARTED: str = "[Agent] Streaming Channel is Ready."

    # Events
    EVENT_CONSUMER_STARTED: str = "[Event] Waiting for messages in '{queue_name}'."
    EVENT_RECEIVED: str = "[Event] Received event from '{queue_name}'"
    EVENT_SENT: str = "[Event] Sent event to '{queue_name}'"

    # Training
    WEB_URL_TRAINING_STARTED: str = "[Training] Started Training on Web Docs"
    MARKDOWN_TRAINING_STARTED: str = "[Training] Started Training on Markdown files"


class ERROR_MESSAGES(_ImmutableConstants):  # noqa: N801
    """Error messages constants."""

    # Core (Agent)
    INVALID_USER_QUERY: str = "[Agent] User Query Invalid"
    INVALID_HTTP_METHOD: str = "[Agent] Invalid HTTP method"
    EVENT_INFORMATION_RETRIEVAL_FAILED: str = (
        "[Agent] Failed to retrieve Event Information"
    )
    AGENT_PROCESS_FAILED: str = "[Agent] Error while processing the request."
    STREAMING_CHANNEL_FAILED: str = "[Agent] Streaming channel failed."

    # Events
    EVENT_CONSUMER_FAILED: str = "[Event] Failed to start RabbitMQ consumer: {error}"
    EVENT_PROCESSING_FAILED: str = "[Event] Failed to process event: {error}"
    EVENT_SEND_FAILED: str = "[Event] Failed to send message: {error}"

    # Training Process
    TRAINING_FAILED: str = "[Training] Training failed due to some error."
    OCR_FAILED: str = "Unable to read images using OCR."

    # Training Inputs
    INPUT_PROCESSING_FAILED: str = "[Training] Error while processing training document"
    INPUT_INVALID_TYPE: str = "[Training] Invalid input type"
    INPUT_UPLOAD_FAILED: str = "[Training] Failed to upload file"

    # Token
    MISSING_TOKEN: str = "[Auth] Missing token"
    INVALID_TOKEN: str = "[Auth] Invalid or expired token"

    # User Data
    NO_USER_DATA: str = "[Auth] No user data in response"
    USER_SCHEMA_INVALID: str = "[Auth] User data scheme invalid"
    INCOMPLETE_USER_INFO: str = "[Auth] Missing essential user information"
    INCOMPLETE_ACCOUNT_INFO: str = "[Auth] Account information missing"

    # Others
    CONSTANTS_CANNOT_MODIFY: str = "Cannot modify a constant value"
    CONSTANTS_CANNOT_DELETE: str = "Cannot delete a constant value"

    REQUEST_VALIDATION_FAILED: str = "Error while request validation"

    INTERNAL_SERVER_ERROR: str = "Internal server error"

    UNAUTHORIZED_ACCESS: str = "Unauthorized access"


# ---------------------------------------------------------------------------- #

APPLICATION_TITLE = "AI Agent Core API"

APPLICATION_DESCRIPTION = """
# 🔐 Authentication

This API uses a secure cookie named `token` to authenticate requests.

- You must log in to receive this cookie.
- When using **Try It Out** in the docs, **you must manually set the `token` cookie** in your browser.
- You can find it in dev tools → Application → Cookies → {current url} -> `token`.

**Note**: Scalar does not automatically send cookies during "Try it out".
"""

# ---------------------------------------------------------------------------- #


class RABBITMQ_QUEUES(_ImmutableConstants):  # noqa: N801
    """Queues used for RabbitMQ."""

    NEW_KNOWLEDGE: str = "new_knowledge"
    DELETE_KNOWLEDGE: str = "delete_knowledge"
    COMPLETE_TRAINING: str = "complete_training"


READABLE_EXTENSIONS: list[SupportedTrainingExtensions] = [
    SupportedTrainingExtensions.TEXT,
    SupportedTrainingExtensions.MARKDOWN,
]
VIDEO_EXTENSIONS: list[SupportedTrainingExtensions] = [
    SupportedTrainingExtensions.VIDEO_AVI,
    SupportedTrainingExtensions.VIDEO_MOV,
    SupportedTrainingExtensions.VIDEO_MP4,
    SupportedTrainingExtensions.VIDEO_WEBM,
    SupportedTrainingExtensions.VIDEO_WMV,
]
