from typing import Any

from app.core.database import call_proc


def listar_ventas() -> list[dict[str, Any]]:
    return call_proc("sp_listar_ventas")
