from typing import Any

from app.core.database import call_proc


def listar_movimientos(producto_id: int | None = None) -> list[dict[str, Any]]:
    return call_proc("sp_listar_movimientos_inventario", (producto_id,))
