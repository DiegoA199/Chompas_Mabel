from fastapi import APIRouter

from app.services import reporte_service

router = APIRouter(prefix="/api/reportes", tags=["reportes"])


@router.get("/resumen")
def resumen_reportes():
    return reporte_service.resumen_reportes()
