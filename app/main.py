# app/main.py
import uuid
from datetime import datetime, timezone

from fastapi import Depends, FastAPI, HTTPException

from app.schemas import PlanRequest, PlanResponse
from app.ml.predictor import predict_success_probability
from app.finance_logic import build_paths, build_chart_data, recommend_path
from app.auth import get_current_user
from app.auth_routes import router as auth_router
from app.profile_routes import router as profile_router
from app.db import plans, init_db

app = FastAPI(title="Finance Manager API")
app.include_router(auth_router)
app.include_router(profile_router)
init_db()


@app.post("/plans/generate", response_model=PlanResponse)
def generate_plan(request: PlanRequest, user=Depends(get_current_user)):
    expenses_total = sum(request.expenses.values())
    surplus = request.income_monthly - expenses_total - request.loans_monthly
    required = max(request.goal.target_amount - request.current_savings, 0) / request.goal.months

    probability = predict_success_probability(
        income=request.income_monthly,
        expenses_total=expenses_total,
        loans=request.loans_monthly,
        savings=request.current_savings,
        emergency=request.emergency_fund,
        target=request.goal.target_amount,
        months=request.goal.months,
        risk_profile=request.risk_profile,
    )

    paths = build_paths(
        income=request.income_monthly,
        expenses=request.expenses,
        loans=request.loans_monthly,
        savings=request.current_savings,
        emergency=request.emergency_fund,
        target=request.goal.target_amount,
        months=request.goal.months,
        risk_profile=request.risk_profile,
        predict_fn=predict_success_probability,
    )

    chart = None
    if request.include_chart:
        chart = build_chart_data(request.expenses, request.loans_monthly)

    plan_id = uuid.uuid4().hex
    response = PlanResponse(
        plan_id=plan_id,
        surplus_monthly=surplus,
        required_monthly_saving=required,
        feasible=required <= surplus,
        goal_success_probability=probability,
        paths=paths,
        recommended_path=recommend_path(paths, request.risk_profile),
        chart_data=chart,
    )

    # Save the plan under the logged-in user
    plans.insert_one({
        "_id": plan_id,
        "user_id": user["id"],
        "goal_name": request.goal.name,
        "risk_profile": request.risk_profile,
        "plan": response.model_dump(),
        "created_at": datetime.now(timezone.utc),
    })
    return response


@app.get("/plans")
def list_plans(user=Depends(get_current_user)):
    """List the logged-in user's saved plans, newest first."""
    cursor = plans.find(
        {"user_id": user["id"]},
        {"plan": 0, "user_id": 0},
    ).sort("created_at", -1)

    result = []
    for doc in cursor:
        doc["id"] = doc.pop("_id")
        result.append(doc)
    return result


@app.get("/plans/{plan_id}", response_model=PlanResponse)
def get_plan(plan_id: str, user=Depends(get_current_user)):
    """Get one saved plan. Users can only open their own plans."""
    doc = plans.find_one({"_id": plan_id, "user_id": user["id"]})
    if doc is None:
        raise HTTPException(status_code=404, detail="Plan not found")
    return doc["plan"]