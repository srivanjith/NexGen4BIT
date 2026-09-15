from bson import ObjectId
from app.database.mongodb import get_collection
from fastapi import APIRouter, HTTPException
from typing import List, Optional

router = APIRouter(prefix="/api/evidence", tags=["evidence"])

def serialize_mongo(doc):
    if doc is None:
        return None
    doc["_id"] = str(doc["_id"])
    return doc

@router.get("")
def get_all_evidence(userOnly: Optional[bool] = False):
    conflicts_col = get_collection("conflicts")
    docs_col = get_collection("documents")
    
    if conflicts_col is None:
        return []

    query = {}
    if userOnly and docs_col is not None:
        user_docs = list(docs_col.find({"isDataset": {"$ne": True}}))
        user_doc_ids = [str(d["_id"]) for d in user_docs]
        query["$or"] = [
            {"docAId": {"$in": user_doc_ids}},
            {"docBId": {"$in": user_doc_ids}},
            {"isDataset": False}
        ]

    conflicts = list(conflicts_col.find(query).sort("createdAt", -1))
    enriched_evidence = []
    
    for c in conflicts:
        c_obj = serialize_mongo(c)
        topic = c_obj.get("topic") or c_obj.get("conflictType", "Document Discrepancy")
        doc_a_title = c_obj.get("docATitle") or c_obj.get("documentAName") or "Document A"
        doc_b_title = c_obj.get("docBTitle") or c_obj.get("documentBName") or "Document B"
        stmt_a_text = c_obj.get("stmtAText") or c_obj.get("statementAText") or ""
        stmt_b_text = c_obj.get("stmtBText") or c_obj.get("statementBText") or ""
        reason = c_obj.get("reason") or "Direct contradiction or requirement shift detected during statement analysis."

        c_obj["topic"] = topic
        c_obj["docATitle"] = doc_a_title
        c_obj["docBTitle"] = doc_b_title
        c_obj["stmtAText"] = stmt_a_text
        c_obj["stmtBText"] = stmt_b_text
        c_obj["reason"] = reason

        enriched_evidence.append(c_obj)

    return enriched_evidence

@router.get("/{conflict_id}")
def get_evidence_for_conflict(conflict_id: str):
    col = get_collection("evidence")
    conflicts_col = get_collection("conflicts")
    
    if conflicts_col is not None:
        try:
            c = conflicts_col.find_one({"_id": ObjectId(conflict_id)})
            if c:
                return [serialize_mongo(c)]
        except Exception:
            pass

    if col is not None:
        items = list(col.find({"conflictId": conflict_id}))
        return [serialize_mongo(item) for item in items]

    return []


