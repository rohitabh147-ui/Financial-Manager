# app/ml/train.py
import os
import random

import joblib
from sklearn.ensemble import RandomForestClassifier

from app.ml.features import build_features

MODEL_PATH = "models/goal_rf.joblib"


def make_example():
    income = random.uniform(1500, 8000)
    expenses_total = income * random.uniform(0.4, 0.95)
    loans = random.uniform(0, 500)
    savings = random.uniform(0, 10000)
    emergency = random.uniform(0, 5000)
    target = random.uniform(500, 20000)
    months = random.randint(3, 60)
    risk = random.choice(["low", "medium", "high"])

    surplus = income - expenses_total - loans
    required = max(target - savings, 0) / months

    # Achievable if the required saving fits within 70% of the surplus
    label = 1 if required <= surplus * 0.7 else 0
    # 5% label noise so the model doesn't just copy one rule
    if random.random() < 0.05:
        label = 1 - label

    features = build_features(income, expenses_total, loans, savings,
                              emergency, target, months, risk)
    return features, label


def train(n_samples=5000):
    random.seed(42)
    X, y = [], []
    for _ in range(n_samples):
        features, label = make_example()
        X.append(features)
        y.append(label)

    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X, y)

    os.makedirs("models", exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    print(f"Model trained on {n_samples} examples and saved to {MODEL_PATH}")


if __name__ == "__main__":
    train()