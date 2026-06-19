from fastapi import HTTPException

from app.core.database import fetch_one
from app.schemas import LoginRequest


def login(request: LoginRequest) -> dict:
    usuario = fetch_one(
        """
        SELECT id, nombre, correo, rol
        FROM usuarios
        WHERE LOWER(correo) = LOWER(%s) AND password = %s AND estado = TRUE
        """,
        (request.email.strip(), request.password),
    )
    if not usuario:
        raise HTTPException(status_code=401, detail="Credenciales invalidas")
    return {
        "token": "demo-token-fastapi",
        "usuarioId": usuario["id"],
        "usuario": usuario["nombre"],
        "rol": usuario["rol"],
    }
