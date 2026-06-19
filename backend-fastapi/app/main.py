import os
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.routers import auth, clientes, inventario, pedidos, productos, reportes, ventas

app = FastAPI(title="Chompas Mabel API", version="1.0.0")

default_origins = "http://localhost:4200,http://127.0.0.1:4200"
cors_origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", default_origins).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"status": "ok", "backend": "fastapi"}


app.include_router(auth.router)
app.include_router(productos.router)
app.include_router(clientes.router)
app.include_router(pedidos.router)
app.include_router(ventas.router)
app.include_router(inventario.router)
app.include_router(reportes.router)


frontend_dist = Path(os.getenv("FRONTEND_DIST", "/app/static")).resolve()
if frontend_dist.exists():
    assets_dir = frontend_dist / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")


    @app.get("/{full_path:path}", include_in_schema=False)
    def serve_frontend(full_path: str):
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="Endpoint no encontrado")

        requested_file = (frontend_dist / full_path).resolve()
        if requested_file.is_file() and requested_file.is_relative_to(frontend_dist):
            return FileResponse(requested_file)

        index_file = frontend_dist / "index.html"
        if index_file.exists():
            return FileResponse(index_file)

        raise HTTPException(status_code=404, detail="Frontend no encontrado")
