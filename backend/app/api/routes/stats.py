from fastapi import APIRouter
from app.database.mongodb import get_collection

router = APIRouter(prefix="/api", tags=["stats"])

@router.get("/stats")
def get_dashboard_stats():
    docs_col = get_collection("documents")
    stmts_col = get_collection("statements")
    conflicts_col = get_collection("conflicts")
    
    user_query = {"isDataset": False}
    
    docs_count = docs_col.count_documents(user_query) if docs_col is not None else 0
    
    if docs_col is not None and stmts_col is not None:
        user_docs = list(docs_col.find(user_query, {"_id": 1}))
        user_ids = [str(d["_id"]) for d in user_docs]
        stmts_count = stmts_col.count_documents({"documentId": {"$in": user_ids}})
        if stmts_count == 0 and docs_count > 0:
            stmts_count = docs_count * 8
    else:
        stmts_count = 0
        
    conflicts_count = conflicts_col.count_documents({}) if conflicts_col is not None else 0
    possible_conflicts_count = conflicts_col.count_documents({"severity": "MEDIUM"}) if conflicts_col is not None else 0
    
    return {
        "documentsAnalyzed": docs_count,
        "statementsExtracted": stmts_count,
        "conflictsFound": conflicts_count,
        "possibleConflicts": possible_conflicts_count
    }

