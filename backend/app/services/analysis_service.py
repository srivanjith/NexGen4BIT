import logging
from datetime import datetime
from typing import List, Dict, Any
from bson import ObjectId

from app.database.mongodb import get_collection
from app.processors.document_processor import process_document
from app.processors.statement_extractor import extract_statements_from_text
from app.ml.embeddings import match_semantic_statements
from app.ml.conflict_engine import analyze_document_conflict_pairs

logger = logging.getLogger("govverify.analysis_service")

def serialize_mongo(doc):
    if doc is None:
        return None
    doc["_id"] = str(doc["_id"])
    return doc

def run_document_analysis_pipeline(document_ids: List[str]) -> Dict[str, Any]:
    """Runs the full end-to-end AI document intelligence analysis pipeline."""
    started_at = datetime.utcnow().isoformat()

    docs_col = get_collection("documents")
    stmts_col = get_collection("statements")
    conflicts_col = get_collection("conflicts")
    evidence_col = get_collection("evidence")
    analyses_col = get_collection("analyses")

    # Retrieve target documents
    docs = []
    doc_titles_map = {}
    
    if docs_col is not None:
        for d_id in document_ids:
            d = None
            try:
                d = docs_col.find_one({"_id": ObjectId(d_id)})
            except Exception:
                pass
            if not d:
                d = docs_col.find_one({"_id": str(d_id)})
            if d:
                serialized = serialize_mongo(d)
                docs.append(serialized)
                doc_titles_map[str(serialized["_id"])] = serialized.get("title", f"Document {d_id}")

    if len(docs) < 2:
        # Check if demo seed docs exist as fallback
        if docs_col is not None:
            demo_docs = list(docs_col.find({"isDemo": True}).limit(3))
            if len(demo_docs) >= 2:
                docs = [serialize_mongo(d) for d in demo_docs]
                for d in docs:
                    doc_titles_map[d["_id"]] = d.get("title")

    # Step 1 & 2: Extract text and statements for each document
    doc_statements_map = {}
    all_extracted_statements = []

    for doc in docs:
        d_id = doc["_id"]
        file_path = doc.get("filePath", "")
        file_name = doc.get("fileName", "document.pdf")

        # Process document pages
        pages = process_document(file_path, file_name)
        
        # Update page count in MongoDB
        if docs_col is not None and len(pages) > 0:
            try:
                docs_col.update_one({"_id": ObjectId(d_id)}, {"$set": {"pageCount": len(pages), "status": "analyzed"}})
            except Exception:
                pass

        # Extract statements
        stmts = extract_statements_from_text(pages, d_id)
        doc_statements_map[d_id] = stmts

        # Save statements to DB
        if stmts_col is not None:
            for s in stmts:
                ex = stmts_col.find_one({"statementText": s["statementText"], "documentId": d_id})
                if not ex:
                    res = stmts_col.insert_one(s)
                    s["_id"] = str(res.inserted_id)
                else:
                    s["_id"] = str(ex["_id"])

        all_extracted_statements.extend(stmts)

    # Step 3, 4, 5: Pairwise Semantic Matching & Conflict Detection
    doc_ids_list = list(doc_statements_map.keys())
    all_matched_pairs = []
    detected_conflicts = []

    for i in range(len(doc_ids_list)):
        for j in range(i + 1, len(doc_ids_list)):
            id_a = doc_ids_list[i]
            id_b = doc_ids_list[j]
            stmts_a = doc_statements_map[id_a]
            stmts_b = doc_statements_map[id_b]

            matched = match_semantic_statements(stmts_a, stmts_b, threshold=0.50)
            all_matched_pairs.extend(matched)

            conflicts = analyze_document_conflict_pairs(matched, doc_titles_map)
            detected_conflicts.extend(conflicts)

    # Step 6: Save Conflicts and Evidence Records
    saved_conflicts = []
    high_count = 0
    possible_count = 0
    conditional_count = 0

    if conflicts_col is not None:
        for c in detected_conflicts:
            # Check existing
            ex = conflicts_col.find_one({
                "statementAId": c["statementAId"],
                "statementBId": c["statementBId"]
            })
            if not ex:
                res = conflicts_col.insert_one(c)
                c["_id"] = str(res.inserted_id)
            else:
                c["_id"] = str(ex["_id"])

            saved_conflicts.append(c)

            if c.get("severity") == "HIGH":
                high_count += 1
            elif c.get("severity") == "MEDIUM":
                possible_count += 1

            if c.get("conflictType") == "CONDITIONAL_DIFFERENCE":
                conditional_count += 1

            # Save Evidence Records
            if evidence_col is not None:
                ev_a = {
                    "conflictId": c["_id"],
                    "documentId": c["docAId"],
                    "pageNumber": c.get("pageA", 1),
                    "section": c.get("sectionA", "General"),
                    "sourceText": c.get("stmtAText", ""),
                    "createdAt": started_at
                }
                ev_b = {
                    "conflictId": c["_id"],
                    "documentId": c["docBId"],
                    "pageNumber": c.get("pageB", 1),
                    "section": c.get("sectionB", "General"),
                    "sourceText": c.get("stmtBText", ""),
                    "createdAt": started_at
                }
                evidence_col.insert_one(ev_a)
                evidence_col.insert_one(ev_b)

    completed_at = datetime.utcnow().isoformat()
    analysis_record = {
        "documentIds": [d["_id"] for d in docs],
        "status": "completed",
        "totalStatements": len(all_extracted_statements),
        "matchedStatements": len(all_matched_pairs),
        "conflictsFound": len(detected_conflicts),
        "possibleConflicts": possible_count,
        "conditionalDifferences": conditional_count,
        "consistentStatements": max(0, len(all_matched_pairs) - len(detected_conflicts)),
        "startedAt": started_at,
        "completedAt": completed_at
    }

    if analyses_col is not None:
        res_a = analyses_col.insert_one(analysis_record)
        analysis_record["_id"] = str(res_a.inserted_id)
    else:
        analysis_record["_id"] = "dev_analysis_1"

    return analysis_record
