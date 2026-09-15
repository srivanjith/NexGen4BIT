import os
import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/api/ml", tags=["ml"])

class TrainRequest(BaseModel):
    max_samples: Optional[int] = None

@router.post("/train")
def train_model(req: TrainRequest = TrainRequest()):
    """Triggers ML model training on MongoDB dataset."""
    try:
        from app.ml.train_model import train_ml_models
        res = train_ml_models(max_samples=req.max_samples)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ML training failed: {str(e)}")

@router.get("/status")
def get_ml_status():
    """Returns status, metadata, and accuracy metrics of the trained ML model."""
    metadata_path = os.path.join(os.path.dirname(__file__), "..", "..", "ml", "models", "model_metadata.json")
    if os.path.exists(metadata_path):
        try:
            with open(metadata_path, "r") as f:
                data = json.load(f)
            return data
        except Exception:
            pass
            
    return {
        "status": "untrained",
        "lastTrainedAt": None,
        "sampleCount": 0,
        "vocabularySize": 0,
        "accuracy": 0.0,
        "accuracyPercentage": "0%"
    }
