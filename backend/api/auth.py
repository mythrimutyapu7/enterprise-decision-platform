from fastapi import APIRouter
from backend.schemas.user_schema import UserCreate, UserLogin
from backend.services.auth_service import register_user, login_user

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/register")
async def register(user: UserCreate):
    return await register_user(user)


@router.post("/login")
async def login(user: UserLogin):
    return await login_user(user)