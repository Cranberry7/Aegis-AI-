"""Data module utilities."""

from typing import Any


def remove_base64(obj: Any) -> Any:
    """Remove base64 encoded data from a JSON object."""
    if isinstance(obj, dict):
        return {k: remove_base64(v) for k, v in obj.items()}

    if isinstance(obj, list):
        return [remove_base64(item) for item in obj]

    if isinstance(obj, str):
        while "data:" in obj and ";base64," in obj:
            start = obj.find("data:")
            end = obj.find(";base64,", start)

            if end != -1:
                next_part = obj.find(",", end + 8)

                if next_part != -1:
                    obj = obj[:start] + obj[next_part + 1 :]
                else:
                    obj = obj[:start]
            else:
                break

        return obj
    return obj
