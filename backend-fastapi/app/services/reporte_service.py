from typing import Any

from app.core.database import call_proc


def resumen_reportes() -> dict[str, Any]:
    rows = call_proc("sp_resumen_reportes")
    return rows[0] if rows else {}
