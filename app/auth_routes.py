# app/auth_routes.py
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from pymongo.errors import DuplicateKeyError

from app.auth import create_token, get_current_user, hash_password, verify_password
from app.db import users

router = APIRouter(prefix="/auth", tags=["auth"])


class RegisterRequest(BaseModel):
    email: str = Field(..., examples=["ali@example.com"])
    password: str = Field(..., min_length=6, max_length=72)


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


@router.post("/register", status_code=201)
def register(data: RegisterRequest):
    email = data.email.lower().strip()
    try:
        result = users.insert_one({
            "email": email,
            "password_hash": hash_password(data.password),
            "created_at": datetime.now(timezone.utc),
        })
    except DuplicateKeyError:
        raise HTTPException(status_code=400, detail="Email already registered")
    return {"id": str(result.inserted_id), "email": email}


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest):
    email = data.email.lower().strip()
    user = users.find_one({"email": email})
    if user is None or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Wrong email or password")
    return TokenResponse(access_token=create_token(str(user["_id"]), email))


@router.get("/me")
def me(user=Depends(get_current_user)):
    return user