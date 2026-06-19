from typing import Any

import mysql.connector
from fastapi import HTTPException

from app.core.database import call_proc, connection, fetch_one
from app.core.serialization import clean
from app.schemas import ClientePayload


def listar_clientes() -> list[dict[str, Any]]:
    return call_proc("sp_listar_clientes")


def cliente_response(cliente_id: int) -> dict[str, Any]:
    cliente = fetch_one(
        """
        SELECT id, nombres, apellidos, telefono, direccion, correo,
               TRIM(CONCAT(nombres, ' ', COALESCE(apellidos, ''))) AS nombre_completo
        FROM clientes
        WHERE id = %s
        """,
        (cliente_id,),
    )
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return cliente


def crear_cliente(payload: ClientePayload) -> dict[str, Any]:
    conn = connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO clientes (nombres, apellidos, telefono, direccion, correo)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (
                payload.nombres.strip(),
                clean(payload.apellidos),
                clean(payload.telefono),
                clean(payload.direccion),
                payload.correo.strip(),
            ),
        )
        cliente_id = int(cursor.lastrowid)
        conn.commit()
        return cliente_response(cliente_id)
    except mysql.connector.Error as exc:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    finally:
        conn.close()
