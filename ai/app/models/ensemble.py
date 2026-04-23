"""
Threat scoring ensemble: XGBoost + MLP (PyTorch).
Falls back to rule-based scoring if models not trained yet.
"""
import os
import pickle
import numpy as np
from pathlib import Path

MODEL_DIR = Path(__file__).parent / "saved"
XGB_PATH = MODEL_DIR / "xgb_model.pkl"
MLP_PATH = MODEL_DIR / "mlp_model.pt"


def _rule_based_score(features: list[float]) -> float:
    """Deterministic baseline before ML models are trained."""
    score = 0.0
    weights = {
        8: 15,   # high_risk_tld
        9: 20,   # brand_impersonation
        10: 15,  # phish_keywords
        29: 10,  # no_dnssec
        30: 8,   # mx_no_spf
        31: 8,   # mx_no_dmarc
        23: 12,  # fast_flux
        33: 10,  # high_entropy_sld
        35: 15,  # brand_in_subdomain
    }
    for idx, w in weights.items():
        score += features[idx] * w
    return min(score, 100.0)


def predict(features: list[float]) -> dict:
    """Returns score (0-100), verdict, and per-model scores."""
    vec = np.array(features, dtype=np.float32).reshape(1, -1)

    xgb_prob, mlp_prob = None, None

    if XGB_PATH.exists():
        import xgboost as xgb
        with open(XGB_PATH, "rb") as f:
            xgb_model = pickle.load(f)
        xgb_prob = float(xgb_model.predict_proba(vec)[0][1])

    if MLP_PATH.exists():
        import torch
        from app.models.mlp import MLP
        mlp = MLP(input_dim=40)
        mlp.load_state_dict(torch.load(MLP_PATH, map_location="cpu"))
        mlp.eval()
        with torch.no_grad():
            mlp_prob = float(torch.sigmoid(mlp(torch.tensor(vec))).item())

    if xgb_prob is not None and mlp_prob is not None:
        prob = 0.6 * xgb_prob + 0.4 * mlp_prob
        score = round(prob * 100)
        source = "ensemble"
    elif xgb_prob is not None:
        score = round(xgb_prob * 100)
        source = "xgboost"
    else:
        score = round(_rule_based_score(features))
        source = "rule_based"

    if score >= 70:
        verdict = "High Risk"
    elif score >= 40:
        verdict = "Suspicious"
    else:
        verdict = "Low Risk"

    return {"score": score, "verdict": verdict, "source": source}
