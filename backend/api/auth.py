from fastapi import APIRouter, Depends
from backend.schemas.user_schema import UserCreate, UserLogin
from backend.services.auth_service import register_user, login_user, update_user_profile
from backend.api.dependencies import get_current_user
from pydantic import BaseModel

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


class ProfileUpdate(BaseModel):
    name: str


@router.put("/profile")
async def update_profile(payload: ProfileUpdate, user=Depends(get_current_user)):
    return await update_user_profile(user["sub"], payload.name)