# app/finance_logic.py

RISK_ORDER = {"low": 0, "medium": 1, "high": 2}


def _risk_from_pct(pct, prob=None):
    """Combine surplus usage and success probability into one risk level."""
    if pct is None:
        return {"level": "high", "score": 1.0,
                "notes": "No monthly surplus to fund this path"}

    pct_score = min(pct / 100, 1.0)
    if prob is None:
        score = pct_score
        notes = f"Uses {pct}% of surplus"
    else:
        # Half from surplus usage, half from chance of failure
        score = round((pct_score + (1 - prob)) / 2, 2)
        notes = f"Uses {pct}% of surplus, model success chance {round(prob * 100)}%"

    if score < 0.4:
        level = "low"
    elif score < 0.6:
        level = "medium"
    else:
        level = "high"
    return {"level": level, "score": score, "notes": notes}


def build_paths(income, expenses, loans, savings, emergency, target, months,
                risk_profile, predict_fn=None):
    """Return several strategies for reaching the goal, each with its own
    success probability from the model (if predict_fn is given)."""
    expenses_total = sum(expenses.values())
    surplus = income - expenses_total - loans
    needed = max(target - savings, 0)

    def get_prob(exp_total, m):
        if predict_fn is None:
            return None
        return predict_fn(
            income=income,
            expenses_total=exp_total,
            loans=loans,
            savings=savings,
            emergency=emergency,
            target=target,
            months=m,
            risk_profile=risk_profile,
        )

    paths = []

    # Path A: save steadily over the full timeline
    monthly_a = needed / months
    pct_a = round(monthly_a / surplus * 100, 1) if surplus > 0 else None
    prob_a = get_prob(expenses_total, months)
    paths.append({
        "path_id": "A",
        "strategy": f"Save steadily over {months} months",
        "monthly_saving": round(monthly_a, 2),
        "months": months,
        "assumptions": ["Income and expenses stay the same"],
        "success_probability": prob_a,
        "risk": _risk_from_pct(pct_a, prob_a),
    })

    # Path B: cut the largest discretionary expense by 30%, save over a shorter period
    discretionary = {k: v for k, v in expenses.items() if k in ("other", "food", "entertainment")}
    if discretionary:
        cut_key = max(discretionary, key=discretionary.get)
        cut = discretionary[cut_key] * 0.30
        new_surplus = surplus + cut
        months_b = max(1, round(months * 0.75))
        monthly_b = needed / months_b
        pct_b = round(monthly_b / new_surplus * 100, 1) if new_surplus > 0 else None
        prob_b = get_prob(expenses_total - cut, months_b)
        paths.append({
            "path_id": "B",
            "strategy": f"Cut '{cut_key}' by 30% and save over {months_b} months",
            "monthly_saving": round(monthly_b, 2),
            "months": months_b,
            "assumptions": [f"'{cut_key}' spending drops by 30%"],
            "success_probability": prob_b,
            "risk": _risk_from_pct(pct_b, prob_b),
        })

    # Path C: extend the timeline by 50% for a lower monthly saving
    months_c = int(months * 1.5)
    monthly_c = needed / months_c
    pct_c = round(monthly_c / surplus * 100, 1) if surplus > 0 else None
    prob_c = get_prob(expenses_total, months_c)
    paths.append({
        "path_id": "C",
        "strategy": f"Extend the timeline to {months_c} months",
        "monthly_saving": round(monthly_c, 2),
        "months": months_c,
        "assumptions": ["Goal can wait longer"],
        "success_probability": prob_c,
        "risk": _risk_from_pct(pct_c, prob_c),
    })

    return paths


def build_chart_data(expenses, loans):
    """Return labels and values for the monthly expenditure pie chart."""
    labels = list(expenses.keys())
    values = list(expenses.values())
    if loans > 0:
        labels.append("loans")
        values.append(loans)
    return {"labels": labels, "values": values}


def recommend_path(paths, risk_profile):
    """Pick the path with the highest success chance among acceptable risk levels.
    Ties are broken by the lower risk score."""
    if not paths:
        return None
    allowed = RISK_ORDER[risk_profile]
    acceptable = [p for p in paths if RISK_ORDER[p["risk"]["level"]] <= allowed]
    if not acceptable:
        acceptable = paths

    def rank(p):
        prob = p.get("success_probability") or 0
        return (-prob, p["risk"]["score"])

    return min(acceptable, key=rank)["path_id"]