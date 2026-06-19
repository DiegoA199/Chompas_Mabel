from fastapi import APIRouter

from app.schemas import LoginRequest
from app.services import auth_service

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login")
def login(request: LoginRequest):
    return auth_service.login(request)
