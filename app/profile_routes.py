# app/profile_routes.py
from datetime import datetime, timezone
from typing import Dict, Literal, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.auth import get_current_user
from app.db import financial_profiles

router = APIRouter(prefix="/profile", tags=["profile"])


class ProfileIn(BaseModel):
    age: Optional[int] = Field(None, ge=0, le=120)
    city: Optional[str] = None
    occupation: Optional[str] = None
    income_monthly: float = Field(0, ge=0)
    income_annual: Optional[float] = Field(None, ge=0)
    expenses: Dict[str, float] = {}
    loans_monthly: float = Field(0, ge=0)
    investment_monthly: float = Field(0, ge=0)
    current_savings: float = Field(0, ge=0)
    emergency_fund: float = Field(0, ge=0)
    goal_name: Optional[str] = None
    goal_target_amount: Optional[float] = Field(None, gt=0)
    goal_months: Optional[int] = Field(None, gt=0, le=600)
    risk_profile: Optional[Literal["low", "medium", "high"]] = None
    lifestyle: Optional[str] = None


@router.put("")
def save_profile(data: ProfileIn, user=Depends(get_current_user)):
    """Create or update the logged-in user's profile. One document per user."""
    doc = data.model_dump()
    doc["user_id"] = user["id"]
    doc["updated_at"] = datetime.now(timezone.utc)

    financial_profiles.update_one(
        {"user_id": user["id"]},
        {"$set": doc},
        upsert=True,
    )
    return {"message": "Profile saved"}


@router.get("")
def get_profile(user=Depends(get_current_user)):
    """Return the logged-in user's saved profile."""
    doc = financial_profiles.find_one(
        {"user_id": user["id"]},
        {"_id": 0, "user_id": 0},
    )
    if doc is None:
        raise HTTPException(status_code=404, detail="No profile saved yet")
    return doc