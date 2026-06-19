from datetime import date, datetime
from decimal import Decimal
from typing import Any


def camel(name: str) -> str:
    parts = name.split("_")
    return parts[0] + "".join(part.capitalize() for part in parts[1:])


def json_value(value: Any) -> Any:
    if isinstance(value, Decimal):
        return float(value)
    if isinstance(value, (date, datetime)):
        return value.isoformat()
    if isinstance(value, bytes):
        return value.decode("utf-8")
    return value


def row_to_json(row: dict[str, Any]) -> dict[str, Any]:
    return {camel(key): json_value(value) for key, value in row.items()}


def clean(value: str | None) -> str | None:
    if value is None:
        return None
    value = value.strip()
    return value or None
