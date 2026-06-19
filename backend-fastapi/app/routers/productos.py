from fastapi import APIRouter, status

from app.schemas import ProductoPayload
from app.services import producto_service

router = APIRouter(prefix="/api/productos", tags=["productos"])


@router.get("")
def listar_productos():
    return producto_service.listar_productos()


@router.post("", status_code=status.HTTP_201_CREATED)
def crear_producto(payload: ProductoPayload):
    return producto_service.crear_producto(payload)


@router.put("/{producto_id}")
def actualizar_producto(producto_id: int, payload: ProductoPayload):
    return producto_service.actualizar_producto(producto_id, payload)


@router.delete("/{producto_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_producto(producto_id: int):
    producto_service.eliminar_producto(producto_id)
