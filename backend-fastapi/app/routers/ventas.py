from fastapi import APIRouter

from app.services import venta_service

router = APIRouter(prefix="/api/ventas", tags=["ventas"])


@router.get("")
def listar_ventas():
    return venta_service.listar_ventas()
