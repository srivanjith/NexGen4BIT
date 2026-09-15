from fastapi import APIRouter, HTTPException
from typing import Optional, List
from bson import ObjectId
from app.database.mongodb import get_collection

router = APIRouter(prefix="/api/conflicts", tags=["conflicts"])

def serialize_mongo(doc):
    if doc is None:
        return None
    doc["_id"] = str(doc["_id"])
    doc_a = doc.get("docATitle") or doc.get("documentAName") or "Document A"
    doc_b = doc.get("docBTitle") or doc.get("documentBName") or "Document B"
    stmt_a = doc.get("stmtAText") or doc.get("statementAText") or ""
    stmt_b = doc.get("stmtBText") or doc.get("statementBText") or ""
    
    doc["docATitle"] = doc_a
    doc["documentAName"] = doc_a
    doc["docBTitle"] = doc_b
    doc["documentBName"] = doc_b
    doc["stmtAText"] = stmt_a
    doc["statementAText"] = stmt_a
    doc["stmtBText"] = stmt_b
    doc["statementBText"] = stmt_b
    return doc

@router.get("")
def get_conflicts(
    severity: Optional[str] = None,
    conflictType: Optional[str] = None,
    userOnly: Optional[bool] = False
):
    col = get_collection("conflicts")
    docs_col = get_collection("documents")
    if col is None:
        return []

    query = {}
    if severity and severity != "All":
        query["severity"] = severity
    if conflictType and conflictType != "All":
        query["conflictType"] = conflictType

    if userOnly and docs_col is not None:
        user_docs = list(docs_col.find({"isDataset": {"$ne": True}}))
        user_doc_ids = [str(d["_id"]) for d in user_docs]
        query["$or"] = [
            {"docAId": {"$in": user_doc_ids}},
            {"docBId": {"$in": user_doc_ids}},
            {"isDataset": False}
        ]

    try:
        conflicts = list(col.find(query).sort("createdAt", -1))
        return [serialize_mongo(c) for c in conflicts]
    except Exception as err:
        print(f"Error fetching conflicts: {err}")
        return []

@router.get("/{conflict_id}")
def get_conflict(conflict_id: str):
    col = get_collection("conflicts")
    if col is None:
        raise HTTPException(status_code=404, detail="Database disconnected")
        
    try:
        c = col.find_one({"_id": ObjectId(conflict_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Conflict ID format")

    if not c:
        raise HTTPException(status_code=404, detail="Conflict not found")

    return serialize_mongo(c)
