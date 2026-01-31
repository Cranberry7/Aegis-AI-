"""Custom JSON parsing logic and utils."""

from enum import Enum
from json import JSONEncoder, dumps, load, loads
from typing import Any, TextIO

from pydantic import HttpUrl

from app.utils.logger import logger


class CustomEncoder(JSONEncoder):
    """Custom JSON encoder."""

    def default(self, obj: Any) -> Any:
        """Override default method to handle other data types."""
        if isinstance(obj, Enum):
            return obj.value

        if isinstance(obj, HttpUrl):
            return str(obj)

        if isinstance(obj, bytes):
            try:
                return obj.decode("utf-8")
            except UnicodeDecodeError as err:
                logger.exception(f"Error while encoding to JSON object: {err}")
                return repr(obj)

        return super().default(obj)


def json_dumps(obj: dict | list, indent: int | None = None, **kwargs) -> str:
    """Serialize object to json formatted str."""
    return dumps(obj, indent=indent, cls=CustomEncoder, **kwargs)


def json_loads(string: str | bytes) -> dict | list:
    """Serialize json formatted str to object."""
    if isinstance(string, bytes):
        string = string.decode("utf-8")

    return loads(string)


def json_load(file_buffer: TextIO) -> dict | list:
    """Deserialize json file buffer to object."""
    return load(file_buffer)
