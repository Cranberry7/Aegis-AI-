"""Types for the app."""

from fastapi import FastAPI, Request, Response
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel, to_snake

from app.common.enums import SuggestedQuestionsType

# Types aliases
APIReq = Request
APIRes = Response
FastAPIApp = FastAPI
JSONRes = JSONResponse


class ResponseSerializer(BaseModel):
    """Response from this server serializer."""

    model_config = ConfigDict(
        alias_generator=to_snake,
        populate_by_name=True,
        from_attributes=True,
        use_enum_values=True,
    )


class IncomingReqSerializer(BaseModel):
    """Pydantic model with enum serialization enabled."""

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
        use_enum_values=True,
    )


# TODO: Accept and use user_id, account_id
class ChatRequest(IncomingReqSerializer):
    """Request object for agent chat."""

    query: str
    session_id: str
    user_id: str
    reply_agent: str | None = None
    reset_chat: bool = False


class SuggestedQuestionsRequest(IncomingReqSerializer):
    """Request object for generating suggested questions."""

    user_id: str
    session_id: str | None
    type: SuggestedQuestionsType


class Account(BaseModel):
    """Represents a user account."""

    id: str


class Role(BaseModel):
    """Represents a user role."""

    code: str


class UserRecord(BaseModel):
    """Represents an authenticated user."""

    id: str
    account: Account
    role: Role


class ConversationPayload(BaseModel):
    """Conversation payload."""

    content: str
    videoReferences: list | None = None  # noqa: N815
    debugSteps: list[str] | None = None  # noqa: N815
    sourceIds: list[str] | None = None  # noqa: N815
