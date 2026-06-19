from fastapi import APIRouter, status

from app.schemas import PedidoPayload
from app.services import pedido_service

router = APIRouter(prefix="/api/pedidos", tags=["pedidos"])


@router.get("")
def listar_pedidos():
    return pedido_service.listar_pedidos()


@router.post("", status_code=status.HTTP_201_CREATED)
def crear_pedido(payload: PedidoPayload):
    return pedido_service.crear_pedido(payload)


@router.patch("/{pedido_id}/credito/pagar")
def marcar_credito_pagado(pedido_id: int):
    return pedido_service.marcar_credito_pagado(pedido_id)
