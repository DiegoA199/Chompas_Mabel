from typing import Any

import mysql.connector
from fastapi import HTTPException

from app.core.database import call_proc, connection, fetch_one
from app.core.serialization import clean
from app.schemas import ProductoPayload


def listar_productos() -> list[dict[str, Any]]:
    return call_proc("sp_listar_productos")


def producto_by_id(producto_id: int) -> dict[str, Any]:
    producto = fetch_one(
        """
        SELECT p.id, p.codigo, p.nombre, p.descripcion, p.id_categoria AS categoria_id,
               c.nombre AS categoria, p.talla, p.color, p.precio, p.stock, p.estado
        FROM productos p
        INNER JOIN categorias c ON c.id = p.id_categoria
        WHERE p.id = %s
        """,
        (producto_id,),
    )
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return producto


def resolve_categoria(conn, payload: ProductoPayload) -> int:
    cursor = conn.cursor(dictionary=True)
    if payload.categoriaId:
        cursor.execute("SELECT id FROM categorias WHERE id = %s", (payload.categoriaId,))
        row = cursor.fetchone()
        if row:
            return int(row["id"])
    cursor.execute("SELECT id FROM categorias WHERE LOWER(nombre) = LOWER(%s)", (payload.categoria,))
    row = cursor.fetchone()
    if row:
        return int(row["id"])
    cursor.execute(
        "INSERT INTO categorias (nombre, descripcion) VALUES (%s, %s)",
        (payload.categoria.strip(), "Categoria creada desde FastAPI"),
    )
    return int(cursor.lastrowid)


def crear_producto(payload: ProductoPayload) -> dict[str, Any]:
    conn = connection()
    try:
        categoria_id = resolve_categoria(conn, payload)
        cursor = conn.cursor()
        estado = "STOCK_BAJO" if payload.stock <= 10 else "ACTIVO"
        cursor.execute(
            """
            INSERT INTO productos (codigo, nombre, descripcion, id_categoria, talla, color, precio, stock, estado)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                payload.codigo.strip(),
                payload.nombre.strip(),
                clean(payload.descripcion),
                categoria_id,
                payload.talla.strip(),
                payload.color.strip(),
                payload.precio,
                payload.stock,
                estado,
            ),
        )
        producto_id = int(cursor.lastrowid)
        if payload.stock > 0:
            cursor.execute(
                """
                INSERT INTO inventario_movimientos (id_producto, tipo_movimiento, cantidad, observacion)
                VALUES (%s, 'ENTRADA', %s, 'Registro inicial desde FastAPI')
                """,
                (producto_id, payload.stock),
            )
        conn.commit()
        return producto_by_id(producto_id)
    except mysql.connector.Error as exc:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    finally:
        conn.close()


def actualizar_producto(producto_id: int, payload: ProductoPayload) -> dict[str, Any]:
    conn = connection()
    try:
        categoria_id = resolve_categoria(conn, payload)
        estado = "STOCK_BAJO" if payload.stock <= 10 else "ACTIVO"
        cursor = conn.cursor()
        cursor.execute(
            """
            UPDATE productos
            SET codigo=%s, nombre=%s, descripcion=%s, id_categoria=%s, talla=%s,
                color=%s, precio=%s, stock=%s, estado=%s
            WHERE id=%s
            """,
            (
                payload.codigo.strip(),
                payload.nombre.strip(),
                clean(payload.descripcion),
                categoria_id,
                payload.talla.strip(),
                payload.color.strip(),
                payload.precio,
                payload.stock,
                estado,
                producto_id,
            ),
        )
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        conn.commit()
        return producto_by_id(producto_id)
    except mysql.connector.Error as exc:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    finally:
        conn.close()


def eliminar_producto(producto_id: int) -> None:
    conn = connection()
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM productos WHERE id=%s", (producto_id,))
        conn.commit()
    except mysql.connector.Error as exc:
        conn.rollback()
        raise HTTPException(status_code=400, detail="No se puede eliminar producto con pedidos asociados") from exc
    finally:
        conn.close()
