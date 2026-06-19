from fastapi import APIRouter, status

from app.schemas import ClientePayload
from app.services import cliente_service

router = APIRouter(prefix="/api/clientes", tags=["clientes"])


@router.get("")
def listar_clientes():
    return cliente_service.listar_clientes()


@router.post("", status_code=status.HTTP_201_CREATED)
def crear_cliente(payload: ClientePayload):
    return cliente_service.crear_cliente(payload)
