from fastapi import APIRouter, Query

from app.services import inventario_service

router = APIRouter(prefix="/api/inventario", tags=["inventario"])


@router.get("/movimientos")
def listar_movimientos(productoId: int | None = Query(default=None)):
    return inventario_service.listar_movimientos(productoId)
