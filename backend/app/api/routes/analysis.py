from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from app.services.analysis_service import run_document_analysis_pipeline, serialize_mongo
from app.database.mongodb import get_collection

router = APIRouter(prefix="/api/analysis", tags=["analysis"])

class StartAnalysisRequest(BaseModel):
    documentIds: List[str]

@router.post("/start")
def start_analysis(req: StartAnalysisRequest):
    try:
        res = run_document_analysis_pipeline(req.documentIds)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis pipeline execution failed: {str(e)}")

@router.get("")
def get_analyses():
    col = get_collection("analyses")
    if col is None:
        return []
    items = list(col.find().sort("startedAt", -1))
    return [serialize_mongo(item) for item in items]

@router.get("/{analysis_id}")
def get_analysis(analysis_id: str):
    col = get_collection("analyses")
    if col is None:
        raise HTTPException(status_code=404, detail="Database disconnected")
    try:
        from bson import ObjectId
        item = col.find_one({"_id": ObjectId(analysis_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Analysis ID")
        
    if not item:
        raise HTTPException(status_code=404, detail="Analysis session not found")
        
    return serialize_mongo(item)
