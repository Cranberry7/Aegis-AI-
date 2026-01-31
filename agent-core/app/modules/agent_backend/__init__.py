"""Agent Backend Module."""

from app.common.enums import ConversationType
from app.common.types import ConversationPayload
from app.config import settings
from app.utils.context import get_context, set_context
from app.utils.http_client import HttpClient
from app.utils.logger import logger


class AgentBackend:
    """Handles interactions and operations with the agent-backend service."""

    def __init__(self) -> None:
        """Initialize the AgentBackend instance."""
        self.http_client: HttpClient = HttpClient(base_url=settings.BACKEND_URL)

    def authenticate_token(self, token: str):
        """Authenticate the token."""
        self.http_client.set_token(token)
        return self.http_client.get("auth", timeout=5)

    def add_conversation_to_db(
        self,
        token: str,
        session_id: str,
        payload: ConversationPayload,
        source: ConversationType,
        message_id: str | None = None,
    ) -> None:
        """Save one conversation record in backend."""
        self.http_client.set_token(token)
        debug_steps = get_context("debug_steps")

        if (
            debug_steps
            and isinstance(debug_steps, list)
            and all(isinstance(x, str) for x in debug_steps)
        ):
            payload.debugSteps = debug_steps

        data = {
            "sessionId": session_id,
            "payload": payload.model_dump(),
            "source": source.value,
        }
        if message_id:
            data["id"] = message_id

        logger.info(f"Saving {source.value.upper()} message {message_id}")
        self.http_client.post("/conversations", json=data)
        logger.info(f"{source.value.upper()} message {message_id} saved")

        if debug_steps:
            set_context("debug_steps", [])

    def update_session_title(
        self,
        token: str,
        session_id: str,
        title: str,
        user_id: str,
    ) -> None:
        """Update session context in backend."""
        self.http_client.set_token(token)

        logger.info(f"Updating session context for session {session_id}")
        self.http_client.post(
            "/sessions",
            json={"id": session_id, "title": title, "userId": user_id},
        )
        logger.info(f"Session context for session {session_id} updated")


agent_backend = AgentBackend()
