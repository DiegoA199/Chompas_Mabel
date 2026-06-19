from typing import Any

import mysql.connector

from app.core.config import db_config
from app.core.serialization import row_to_json


def connection():
    return mysql.connector.connect(**db_config())


def fetch_all(sql: str, params: tuple[Any, ...] = ()) -> list[dict[str, Any]]:
    conn = connection()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(sql, params)
        return [row_to_json(row) for row in cursor.fetchall()]
    finally:
        conn.close()


def fetch_one(sql: str, params: tuple[Any, ...] = ()) -> dict[str, Any] | None:
    rows = fetch_all(sql, params)
    return rows[0] if rows else None


def call_proc(name: str, params: tuple[Any, ...] = ()) -> list[dict[str, Any]]:
    conn = connection()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.callproc(name, params)
        rows: list[dict[str, Any]] = []
        for result in cursor.stored_results():
            rows.extend(row_to_json(row) for row in result.fetchall())
        return rows
    finally:
        conn.close()
