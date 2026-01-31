"""Global context variables."""

from contextvars import ContextVar
from typing import Any, Literal

ContextType = str | list | None

# Use ContextVars to safely store request-specific state in a concurrent environment.
# They are isolated per asynchronous task (i.e., per request).
_user_id_var: ContextVar[str] = ContextVar("user_id")
_session_id_var: ContextVar[str] = ContextVar("session_id")
_agent_message_id_var: ContextVar[str] = ContextVar("agent_message_id")
_token_var: ContextVar[str | None] = ContextVar("token", default=None)
_debug_steps_var: ContextVar[list[str] | None] = ContextVar("debug_steps", default=None)
_video_references_var: ContextVar[list | None] = ContextVar(
    "video_references", default=None
)
_source_ids_var: ContextVar[list[str] | None] = ContextVar("source_ids", default=None)

# Dynamic mapping of context keys to their ContextVar objects
_CONTEXT_VARS: dict[str, ContextVar] = {
    "user_id": _user_id_var,
    "session_id": _session_id_var,
    "agent_message_id": _agent_message_id_var,
    "token": _token_var,
    "debug_steps": _debug_steps_var,
    "video_references": _video_references_var,
    "source_ids": _source_ids_var,
}

# Type for valid context keys
ContextKey = Literal[
    "user_id",
    "session_id",
    "agent_message_id",
    "token",
    "debug_steps",
    "video_references",
    "source_ids",
]


def get_all_context():
    """Get the context for the current request."""
    result = {}
    for key, context_var in _CONTEXT_VARS.items():
        try:
            value = context_var.get()
            result[key] = value
        except LookupError:
            # Skip keys that aren't set
            continue
    return result


def get_context(key: ContextKey) -> Any:
    """Get value for a specific context key."""
    if key not in _CONTEXT_VARS:
        raise ValueError(f"Unknown context key: {key}")

    try:
        return _CONTEXT_VARS[key].get()
    except LookupError:
        return None


def set_context(key: ContextKey, value: Any) -> None:
    """Set value for a specific context key."""
    if key not in _CONTEXT_VARS:
        raise ValueError(f"Unknown context key: {key}")

    _CONTEXT_VARS[key].set(value)
