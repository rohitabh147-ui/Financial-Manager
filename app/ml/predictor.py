# app/ml/predictor.py
import os

import joblib

from app.ml.features import build_features

MODEL_PATH = "models/goal_rf.joblib"
_model = None


def load_model():
    """Load the trained model once and reuse it."""
    global _model
    if _model is None and os.path.exists(MODEL_PATH):
        _model = joblib.load(MODEL_PATH)
    return _model


def predict_success_probability(income, expenses_total, loans, savings,
                                emergency, target, months, risk_profile):
    model = load_model()
    if model is None:
        return None  # model not trained yet
    features = [build_features(income, expenses_total, loans, savings,
                               emergency, target, months, risk_profile)]
    return round(float(model.predict_proba(features)[0][1]), 3)