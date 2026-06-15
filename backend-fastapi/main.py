import os
from datetime import date, datetime, timedelta
from decimal import Decimal
from typing import Any

import mysql.connector
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field


app = FastAPI(title="Chompas Mabel API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200", "http://127.0.0.1:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def db_config() -> dict[str, Any]:
    return {
        "host": os.getenv("MYSQL_HOST", "localhost"),
        "port": int(os.getenv("MYSQL_PORT", "3306")),
        "database": os.getenv("MYSQL_DATABASE", "chompas_mabel_db"),
        "user": os.getenv("MYSQL_USER", "root"),
        "password": os.getenv("MYSQL_PASSWORD", "root"),
    }


def connection():
    return mysql.connector.connect(**db_config())


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


def clean(value: str | None) -> str | None:
    if value is None:
        return None
    value = value.strip()
    return value or None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ProductoPayload(BaseModel):
    codigo: str = Field(min_length=1, max_length=30)
    nombre: str = Field(min_length=3, max_length=140)
    descripcion: str | None = Field(default=None, max_length=255)
    categoriaId: int | None = None
    categoria: str = Field(min_length=3, max_length=100)
    talla: str = Field(min_length=1, max_length=50)
    color: str = Field(min_length=1, max_length=50)
    precio: Decimal = Field(ge=0)
    stock: int = Field(ge=0)


class ClientePayload(BaseModel):
    nombres: str = Field(min_length=3, max_length=120)
    apellidos: str | None = Field(default=None, max_length=120)
    telefono: str | None = Field(default=None, max_length=30)
    direccion: str | None = Field(default=None, max_length=180)
    correo: EmailStr


class DetallePedidoPayload(BaseModel):
    productoId: int
    cantidad: int = Field(gt=0)


class PedidoPayload(BaseModel):
    numero: str | None = Field(default=None, max_length=40)
    clienteId: int
    usuarioId: int
    metodoPago: str | None = Field(default=None, max_length=50)
    fechaEntrega: date | None = None
    estado: str = "CONFIRMADO"
    montoPagado: Decimal | None = Field(default=None, ge=0)
    fechaVencimientoCredito: date | None = None
    detalles: list[DetallePedidoPayload]


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


def pedido_response(row: dict[str, Any]) -> dict[str, Any]:
    detalles = call_proc("sp_listar_detalles_pedido", (row["id"],))
    row["detalles"] = detalles
    row["creditoVencido"] = bool(row.get("creditoVencido"))
    row["diasVencido"] = int(row.get("diasVencido") or 0)
    return row


@app.get("/api/health")
def health():
    return {"status": "ok", "backend": "fastapi"}


@app.post("/api/auth/login")
def login(request: LoginRequest):
    usuario = fetch_one(
        """
        SELECT id, nombre, correo, rol
        FROM usuarios
        WHERE LOWER(correo) = LOWER(%s) AND password = %s AND estado = TRUE
        """,
        (request.email.strip(), request.password),
    )
    if not usuario:
        raise HTTPException(status_code=401, detail="Credenciales invalidas")
    return {
        "token": "demo-token-fastapi",
        "usuarioId": usuario["id"],
        "usuario": usuario["nombre"],
        "rol": usuario["rol"],
    }


@app.get("/api/productos")
def listar_productos():
    return call_proc("sp_listar_productos")


@app.post("/api/productos", status_code=201)
def crear_producto(payload: ProductoPayload):
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


@app.put("/api/productos/{producto_id}")
def actualizar_producto(producto_id: int, payload: ProductoPayload):
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


@app.delete("/api/productos/{producto_id}", status_code=204)
def eliminar_producto(producto_id: int):
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


@app.get("/api/clientes")
def listar_clientes():
    return call_proc("sp_listar_clientes")


@app.post("/api/clientes", status_code=201)
def crear_cliente(payload: ClientePayload):
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


@app.get("/api/pedidos")
def listar_pedidos():
    return [pedido_response(row) for row in call_proc("sp_listar_pedidos")]


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


@app.post("/api/pedidos", status_code=201)
def crear_pedido(payload: PedidoPayload):
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


@app.patch("/api/pedidos/{pedido_id}/credito/pagar")
def marcar_credito_pagado(pedido_id: int):
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


@app.get("/api/ventas")
def listar_ventas():
    return call_proc("sp_listar_ventas")


@app.get("/api/inventario/movimientos")
def listar_movimientos(productoId: int | None = Query(default=None)):
    return call_proc("sp_listar_movimientos_inventario", (productoId,))


@app.get("/api/reportes/resumen")
def resumen_reportes():
    rows = call_proc("sp_resumen_reportes")
    return rows[0] if rows else {}
