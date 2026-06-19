from datetime import date
from decimal import Decimal

from pydantic import BaseModel, EmailStr, Field


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
