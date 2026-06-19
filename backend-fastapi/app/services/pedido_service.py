from datetime import date, timedelta
from decimal import Decimal
from typing import Any

import mysql.connector
from fastapi import HTTPException

from app.core.database import call_proc, connection, fetch_one
from app.core.serialization import clean
from app.schemas import PedidoPayload


def listar_pedidos() -> list[dict[str, Any]]:
    return [pedido_response(row) for row in call_proc("sp_listar_pedidos")]


def pedido_response(row: dict[str, Any]) -> dict[str, Any]:
    detalles = call_proc("sp_listar_detalles_pedido", (row["id"],))
    row["detalles"] = detalles
    row["creditoVencido"] = bool(row.get("creditoVencido"))
    row["diasVencido"] = int(row.get("diasVencido") or 0)
    return row


def generar_numero(conn) -> str:
    cursor = conn.cursor()
    prefix = "PED-" + date.today().strftime("%Y%m%d") + "-"
    cursor.execute("SELECT COUNT(*) FROM pedidos")
    count = int(cursor.fetchone()[0]) + 1
    while True:
        numero = prefix + f"{count:04d}"
        cursor.execute("SELECT COUNT(*) FROM pedidos WHERE numero=%s", (numero,))
        if int(cursor.fetchone()[0]) == 0:
            return numero
        count += 1


def estado_credito(metodo_pago: str | None, total: Decimal, monto_pagado: Decimal, vencimiento: date | None) -> str:
    if (metodo_pago or "").lower() != "credito":
        return "SIN_CREDITO"
    saldo = total - monto_pagado
    if saldo <= 0:
        return "PAGADO"
    if vencimiento and vencimiento < date.today():
        return "VENCIDO"
    return "PENDIENTE"


def crear_pedido(payload: PedidoPayload) -> dict[str, Any]:
    if not payload.detalles:
        raise HTTPException(status_code=400, detail="El pedido debe tener al menos un detalle")

    conn = connection()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id FROM clientes WHERE id=%s", (payload.clienteId,))
        if not cursor.fetchone():
            raise HTTPException(status_code=400, detail="Cliente no encontrado")
        cursor.execute("SELECT id FROM usuarios WHERE id=%s", (payload.usuarioId,))
        if not cursor.fetchone():
            raise HTTPException(status_code=400, detail="Usuario no encontrado")

        numero = clean(payload.numero) or generar_numero(conn)
        fecha_entrega = payload.fechaEntrega or (date.today() + timedelta(days=2))
        total = Decimal("0.00")

        cursor.execute(
            """
            INSERT INTO pedidos (numero, id_cliente, id_usuario, fecha_pedido, fecha_entrega, total,
                                 estado, metodo_pago, monto_pagado, saldo_pendiente, estado_credito)
            VALUES (%s, %s, %s, NOW(), %s, 0, %s, %s, 0, 0, 'SIN_CREDITO')
            """,
            (numero, payload.clienteId, payload.usuarioId, fecha_entrega, payload.estado, clean(payload.metodoPago)),
        )
        pedido_id = int(cursor.lastrowid)

        for detalle in payload.detalles:
            cursor.execute("SELECT id, nombre, precio, stock FROM productos WHERE id=%s FOR UPDATE", (detalle.productoId,))
            producto = cursor.fetchone()
            if not producto:
                raise HTTPException(status_code=400, detail="Producto no encontrado")
            if int(producto["stock"]) < detalle.cantidad:
                raise HTTPException(status_code=400, detail="Stock insuficiente para " + producto["nombre"])

            precio = Decimal(producto["precio"])
            subtotal = precio * Decimal(detalle.cantidad)
            total += subtotal
            nuevo_stock = int(producto["stock"]) - detalle.cantidad
            nuevo_estado = "STOCK_BAJO" if nuevo_stock <= 10 else "ACTIVO"

            cursor.execute(
                """
                INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad, precio_unitario, subtotal)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (pedido_id, detalle.productoId, detalle.cantidad, precio, subtotal),
            )
            cursor.execute(
                "UPDATE productos SET stock=%s, estado=%s WHERE id=%s",
                (nuevo_stock, nuevo_estado, detalle.productoId),
            )
            cursor.execute(
                """
                INSERT INTO inventario_movimientos (id_producto, tipo_movimiento, cantidad, observacion)
                VALUES (%s, 'SALIDA', %s, %s)
                """,
                (detalle.productoId, detalle.cantidad, "Salida por pedido " + numero),
            )

        monto_pagado = payload.montoPagado if (payload.metodoPago or "").lower() == "credito" else total
        monto_pagado = monto_pagado or Decimal("0.00")
        if monto_pagado > total:
            raise HTTPException(status_code=400, detail="El monto pagado no puede superar el total")
        saldo = total - monto_pagado
        vencimiento = payload.fechaVencimientoCredito if (payload.metodoPago or "").lower() == "credito" else None
        if (payload.metodoPago or "").lower() == "credito" and vencimiento is None:
            vencimiento = date.today() + timedelta(days=15)
        credito = estado_credito(payload.metodoPago, total, monto_pagado, vencimiento)

        cursor.execute(
            """
            UPDATE pedidos
            SET total=%s, monto_pagado=%s, saldo_pendiente=%s,
                fecha_vencimiento_credito=%s, estado_credito=%s
            WHERE id=%s
            """,
            (total, monto_pagado, saldo, vencimiento, credito, pedido_id),
        )

        if payload.estado in {"CONFIRMADO", "EN_PROCESO", "ENTREGADO", "VENDIDO"}:
            cursor.execute(
                """
                INSERT INTO ventas (id_pedido, fecha_venta, monto_total, tipo_comprobante)
                VALUES (%s, NOW(), %s, %s)
                """,
                (pedido_id, total, "BOLETA_CREDITO" if (payload.metodoPago or "").lower() == "credito" else "BOLETA"),
            )

        conn.commit()
        pedido = fetch_one("SELECT id FROM pedidos WHERE id=%s", (pedido_id,))
        return next(row for row in listar_pedidos() if row["id"] == pedido["id"])
    except HTTPException:
        conn.rollback()
        raise
    except mysql.connector.Error as exc:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    finally:
        conn.close()


def marcar_credito_pagado(pedido_id: int) -> dict[str, Any]:
    conn = connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            UPDATE pedidos
            SET monto_pagado=total, saldo_pendiente=0, estado_credito='PAGADO'
            WHERE id=%s AND estado_credito <> 'SIN_CREDITO'
            """,
            (pedido_id,),
        )
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Credito no encontrado")
        conn.commit()
        return next(row for row in listar_pedidos() if row["id"] == pedido_id)
    except HTTPException:
        conn.rollback()
        raise
    finally:
        conn.close()
