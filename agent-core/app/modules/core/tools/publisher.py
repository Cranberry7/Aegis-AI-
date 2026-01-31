"""Status Publisher Tool for Agentic Communication.

This tool is used to publish status messages to the user-facing stream.
"""

from agno.tools import tool

from app.common.enums import EventMessageType
from app.modules.streaming import publish_message


@tool(
    name="publish_status",
    description="Publish a status message to the user-facing stream.",
    show_result=False,
)
async def publish_status(message: str) -> str:
    """Publish a status message to the user-facing stream.

    Call this tool to inform the user about the current step in the process.
    For example: "Searching knowledge base..." or "Expanding user query...".
    The message is sent instantly.
    """
    try:
        if message:
            await publish_message(
                msg_type=EventMessageType.DEBUG,
                text=message,
            )
    except LookupError:
        # This occurs if .get() is called when the context var was never set
        # for this request. We fail silently.
        pass
    return f"Status update '{message}' was successfully published."
