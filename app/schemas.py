# app/schemas.py
from typing import Dict, List, Literal, Optional
from pydantic import BaseModel, Field


class Goal(BaseModel):
    name: str = Field(..., examples=["Buy a laptop"])
    target_amount: float = Field(..., gt=0)
    months: int = Field(..., gt=0, le=600)


class PlanRequest(BaseModel):
    user_id: str
    income_monthly: float = Field(..., ge=0)
    expenses: Dict[str, float] = Field(..., examples=[{"rent": 1200, "food": 400}])
    loans_monthly: float = Field(0, ge=0)
    current_savings: float = Field(0, ge=0)
    emergency_fund: float = Field(0, ge=0)
    goal: Goal
    risk_profile: Literal["low", "medium", "high"]
    include_chart: bool = False


class Risk(BaseModel):
    level: Literal["low", "medium", "high"]
    score: float = Field(..., ge=0, le=1)
    notes: str


class FinancialPath(BaseModel):
    path_id: str
    strategy: str
    monthly_saving: float
    months: int
    assumptions: List[str]
    risk: Risk
    success_probability: Optional[float] = None

class ChartData(BaseModel):
    labels: List[str]
    values: List[float]


class PlanResponse(BaseModel):
    plan_id: str
    surplus_monthly: float
    required_monthly_saving: float
    feasible: bool
    goal_success_probability: Optional[float] = None
    paths: List[FinancialPath] = []
    recommended_path: Optional[str] = None
    chart_data: Optional[ChartData] = None