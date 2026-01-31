"""Custom Exception definitions."""

from http import HTTPStatus

from fastapi import HTTPException

from app.common.constants import ERROR_MESSAGES


class CoreError(Exception):
    """Core Application Exception."""

    def __init__(
        self,
        message: str | list | dict = ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        status_code: int = HTTPStatus.INTERNAL_SERVER_ERROR,
    ) -> None:
        """CoreError Constructor."""
        self.status_code = status_code
        self.message: str | list | dict = message
        super().__init__(str(message))


class InputError(CoreError):
    """Input Data Exception."""

    def __init__(
        self,
        message: str | list | dict = ERROR_MESSAGES.INPUT_UPLOAD_FAILED,
        status_code: int = HTTPStatus.INTERNAL_SERVER_ERROR,
    ) -> None:
        """InputError Constructor."""
        super().__init__(message, status_code)


class TrainingError(CoreError):
    """Training Exception."""

    def __init__(
        self,
        message: str | list | dict = ERROR_MESSAGES.TRAINING_FAILED,
        status_code: int = HTTPStatus.INTERNAL_SERVER_ERROR,
    ) -> None:
        """TrainingError Constructor."""
        super().__init__(message, status_code)


class ValidationError(CoreError):
    """Request Validation Exception."""

    def __init__(
        self,
        message: str | list | dict = ERROR_MESSAGES.REQUEST_VALIDATION_FAILED,
        status_code: int = HTTPStatus.UNPROCESSABLE_ENTITY,
    ) -> None:
        """ValidationError Constructor."""
        super().__init__(message, status_code)


class UnauthorizedError(HTTPException):
    """Unauthorized access exception (403)."""

    def __init__(self, message: str = ERROR_MESSAGES.UNAUTHORIZED_ACCESS) -> None:
        """UnauthorizedError Constructor."""
        super().__init__(status_code=HTTPStatus.FORBIDDEN, detail=message)
