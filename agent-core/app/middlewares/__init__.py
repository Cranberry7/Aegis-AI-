"""Middlewares for the fastAPI application."""

from http import HTTPStatus
from typing import Any

from fastapi import Request
from fastapi.exceptions import RequestValidationError
from starlette.responses import Response

from app.common.constants import ERROR_MESSAGES
from app.common.enums import StatusType
from app.common.models import ResMessage
from app.common.types import APIReq, APIRes, UserRecord
from app.modules.agent_backend import agent_backend
from app.utils import format_response
from app.utils.context import get_context, set_context
from app.utils.exceptions import (
    CoreError,
    UnauthorizedError,
    ValidationError,
)
from app.utils.logger import logger

ALLOWED_PATHS = ["/agent-core/docs/", "/agent-core/docs", "/openapi.json"]


async def validation_error_handler(request: APIReq, exc: RequestValidationError):
    """Handle validation errors for API requests."""
    raise ValidationError(exc.errors()) from exc


async def error_handler(request: APIReq, call_next: Any) -> Any | APIRes:
    """Asynchronous error handler middleware for handling exceptions in requests."""
    try:
        return await call_next(request)
    except CoreError as err:
        logger.exception(err)
        return format_response(
            data=ResMessage(data={"message": err.message, "path": request.url.path}),
            status_code=err.status_code,
            success_status=StatusType.FAILURE,
        )
    except Exception as err:
        logger.exception(err)
        return format_response(
            data=ResMessage(data={"message": str(err), "path": request.url.path}),
            status_code=HTTPStatus.INTERNAL_SERVER_ERROR,
            success_status=StatusType.FAILURE,
        )


async def validate_jwt_token(request: Request, call_next: Any) -> Response:
    """Middleware that validates JWT by calling the backend /auth endpoint."""
    try:
        if request.method == "OPTIONS" or request.url.path in ALLOWED_PATHS:
            return await call_next(request)
        token = request.cookies.get("token") or ""

        if not token:
            raise UnauthorizedError(ERROR_MESSAGES.MISSING_TOKEN)

        if token == get_context("token"):
            return await call_next(request)

        response = agent_backend.authenticate_token(token=token)

        if response.status_code != HTTPStatus.OK:
            raise UnauthorizedError(ERROR_MESSAGES.INVALID_TOKEN)

        payload = response.json()
        user_data = payload.get("data")

        if not user_data:
            raise UnauthorizedError(ERROR_MESSAGES.NO_USER_DATA)

        try:
            user_record = UserRecord(**user_data)
        except ValidationError as ve:
            logger.error(f"UserRecord validation failed: {ve}")
            raise UnauthorizedError(ERROR_MESSAGES.USER_SCHEMA_INVALID) from ve

        if not user_record.id or not user_record.role.code:
            raise UnauthorizedError(ERROR_MESSAGES.INCOMPLETE_USER_INFO)
        if not user_record.account.id:
            raise UnauthorizedError(ERROR_MESSAGES.INCOMPLETE_ACCOUNT_INFO)

        set_context("token", token)
        set_context("user_id", user_record.id)

    except Exception as e:
        logger.error(f"Token validation failed: {e}")
        return format_response(
            status_code=HTTPStatus.UNAUTHORIZED,
            data=ResMessage(data={"detail": f"Token validation failed: {e!s}"}),
            success_status=StatusType.FAILURE,
        )

    return await call_next(request)
