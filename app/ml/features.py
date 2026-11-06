# app/ml/features.py

RISK_MAP = {"low": 0, "medium": 1, "high": 2}


def build_features(income, expenses_total, loans, savings,
                   emergency, target, months, risk_profile):
    """Turn user numbers into the list of numbers the model expects.
    The order of this list must never change."""
    return [
        income,
        expenses_total,
        loans,
        savings,
        emergency,
        target,
        months,
        RISK_MAP[risk_profile],
    ]