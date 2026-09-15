import os
import shutil
import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from bson import ObjectId

from app.config import settings
from app.database.mongodb import get_collection

from app.processors.document_processor import process_document
from app.processors.statement_extractor import extract_statements_from_text

router = APIRouter(prefix="/api/documents", tags=["documents"])

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB limit

def serialize_doc(doc):
    """Utility to convert ObjectId to string representation."""
    if doc is None:
        return None
    doc["_id"] = str(doc["_id"])
    return doc

from app.services.analysis_service import run_document_analysis_pipeline

@router.post("/upload")
@router.post("/upload/")
async def upload_document(
    file: UploadFile = File(...),
    documentType: str = Form("Government Order"),
    department: str = Form("General"),
    documentDate: Optional[str] = Form(None)
):
    clean_name = file.filename.strip() if file.filename else "document.pdf"
    file_ext = os.path.splitext(clean_name)[1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{file_ext}'. Allowed formats: PDF, DOCX, TXT."
        )

    # Ensure uploads directory exists
    os.makedirs(settings.UPLOADS_DIR, exist_ok=True)

    # Safe filename generation
    unique_filename = f"{uuid.uuid4().hex}_{clean_name.replace(' ', '_')}"
    file_path = os.path.join(settings.UPLOADS_DIR, unique_filename)

    # Save file and calculate size
    try:
        contents = await file.read()
        file_size = len(contents)
        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File size exceeds maximum allowed limit of 10MB."
            )
        
        with open(file_path, "wb") as f:
            f.write(contents)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save uploaded file: {str(e)}"
        )

    # Create document record
    now_iso = datetime.utcnow().isoformat()
    doc_data = {
        "title": clean_name,
        "fileName": clean_name,
        "documentType": documentType,
        "department": department,
        "documentDate": documentDate or datetime.utcnow().strftime("%Y-%m-%d"),
        "filePath": file_path,
        "fileSize": file_size,
        "pageCount": 1,
        "status": "uploaded",
        "isDataset": False,
        "createdAt": now_iso
    }

    collection = get_collection("documents")
    statements_collection = get_collection("statements")

    if collection is not None:
        result = collection.insert_one(doc_data)
        doc_id_str = str(result.inserted_id)
        doc_data["_id"] = doc_id_str

        # Process text pages and extract atomic statement claims into MongoDB
        try:
            pages = process_document(file_path, clean_name)
            page_count = len(pages) if pages else 1
            
            stmts = extract_statements_from_text(pages, doc_id_str)
            if statements_collection is not None and stmts:
                for s in stmts:
                    statements_collection.insert_one(s)

            collection.update_one(
                {"_id": result.inserted_id},
                {"$set": {"pageCount": page_count, "status": "analyzed"}}
            )
            doc_data["pageCount"] = page_count
            doc_data["status"] = "analyzed"
            doc_data["extractedStatementsCount"] = len(stmts)

            # Auto-run analysis across all documents in DB if >= 2 docs
            all_docs = list(collection.find({"isDataset": False}))
            if len(all_docs) >= 2:
                all_ids = [str(d["_id"]) for d in all_docs]
                run_document_analysis_pipeline(all_ids)

        except Exception as proc_err:
            print(f"Extraction warning on upload: {proc_err}")
    else:
        # DB fallback mode
        doc_data["_id"] = str(uuid.uuid4())
        doc_data["status"] = "uploaded (in-memory preview)"

    return doc_data

@router.get("")
def get_documents(
    isDataset: Optional[bool] = None,
    limit: Optional[int] = 100,
    search: Optional[str] = None
):
    collection = get_collection("documents")
    if collection is None:
        return []
    
    query = {}
    if isDataset is not None:
        query["isDataset"] = isDataset
    elif isDataset is None:
        # Default: Show user-uploaded & custom documents
        query["isDataset"] = False

    if search:
        search_query = [
            {"title": {"$regex": search, "$options": "i"}},
            {"department": {"$regex": search, "$options": "i"}},
            {"documentType": {"$regex": search, "$options": "i"}}
        ]
        if "$or" in query:
            query = {"$and": [{"$or": query["$or"]}, {"$or": search_query}]}
        else:
            query["$or"] = search_query

    docs = list(collection.find(query).sort("createdAt", -1).limit(limit if limit and limit > 0 else 100))
    
    # Fallback if no non-dataset user documents found
    if not docs and isDataset is None and not search:
        docs = list(collection.find().sort("createdAt", -1).limit(50))
        
    return [serialize_doc(doc) for doc in docs]



@router.get("/{doc_id}")
def get_document(doc_id: str):
    collection = get_collection("documents")
    if collection is None:
        raise HTTPException(status_code=404, detail="Database disconnected")
    
    try:
        doc = collection.find_one({"_id": ObjectId(doc_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Document ID format")
        
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    return serialize_doc(doc)

@router.get("/{doc_id}/text")
def get_document_text(doc_id: str):
    collection = get_collection("documents")
    if collection is None:
        raise HTTPException(status_code=404, detail="Database disconnected")

    try:
        doc = collection.find_one({"_id": ObjectId(doc_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Document ID format")

    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    file_path = doc.get("filePath")
    file_name = doc.get("fileName", "document.pdf")

    if file_path and os.path.exists(file_path):
        pages = process_document(file_path, file_name)
        return pages
    else:
        return [{
            "pageNumber": 1,
            "section": "General",
            "text": f"Document file not found on disk at {file_path}"
        }]

@router.get("/{doc_id}/statements")
def get_document_statements(doc_id: str):
    statements_col = get_collection("statements")
    if statements_col is None:
        return []

    stmts = list(statements_col.find({"documentId": doc_id}))
    return [serialize_doc(s) for s in stmts]

@router.delete("/{doc_id}")
def delete_document(doc_id: str):
    collection = get_collection("documents")
    if collection is None:
        raise HTTPException(status_code=500, detail="Database disconnected")

    try:
        obj_id = ObjectId(doc_id)
        doc = collection.find_one({"_id": obj_id})
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")
            
        # Delete file from filesystem if exists
        file_path = doc.get("filePath")
        if file_path and os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception:
                pass

        collection.delete_one({"_id": obj_id})
        return {"message": "Document deleted successfully", "id": doc_id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to delete document: {str(e)}")

@router.post("/seed")
def seed_demo_data():
    """Seeds sample scholarship documents and metadata into MongoDB for testing."""
    docs_collection = get_collection("documents")
    statements_collection = get_collection("statements")
    conflicts_collection = get_collection("conflicts")
    
    if docs_collection is None:
        raise HTTPException(status_code=500, detail="Database disconnected. Cannot seed demo data.")

    # Clear existing demo data if desired or append
    now = datetime.utcnow().isoformat()
    
    sample_docs = [
        {
            "title": "Government Order 2024 (Higher Education Scholarship)",
            "fileName": "government_order_2024.pdf",
            "documentType": "Government Order",
            "department": "Higher Education Department",
            "documentDate": "2024-06-15",
            "filePath": "uploads/government_order_2024.pdf",
            "fileSize": 1048576,
            "pageCount": 12,
            "status": "analyzed",
            "isDemo": True,
            "createdAt": now
        },
        {
            "title": "Government Policy 2025 (State Student Welfare)",
            "fileName": "government_policy_2025.pdf",
            "documentType": "Government Policy",
            "department": "Social Justice & Empowerment",
            "documentDate": "2025-01-10",
            "filePath": "uploads/government_policy_2025.pdf",
            "fileSize": 2097152,
            "pageCount": 24,
            "status": "analyzed",
            "isDemo": True,
            "createdAt": now
        },
        {
            "title": "Government Circular 2025 (Clarification Guidelines)",
            "fileName": "government_circular_2025.pdf",
            "documentType": "Government Circular",
            "department": "Higher Education Department",
            "documentDate": "2025-03-01",
            "filePath": "uploads/government_circular_2025.pdf",
            "fileSize": 512000,
            "pageCount": 5,
            "status": "analyzed",
            "isDemo": True,
            "createdAt": now
        }
    ]

    inserted_docs = []
    for d in sample_docs:
        # avoid duplicate demo docs
        existing = docs_collection.find_one({"fileName": d["fileName"]})
        if not existing:
            res = docs_collection.insert_one(d)
            d["_id"] = str(res.inserted_id)
            inserted_docs.append(d)
        else:
            inserted_docs.append(serialize_doc(existing))

    # Insert Demo Statements & Conflicts if requested
    if len(inserted_docs) >= 2:
        doc_a_id = inserted_docs[0]["_id"]
        doc_b_id = inserted_docs[1]["_id"]
        
        sample_statements = [
            {
                "documentId": doc_a_id,
                "pageNumber": 3,
                "section": "Eligibility Criteria - Age",
                "statementText": "Students must be 18 years or older to qualify for higher education grants.",
                "subject": "Student",
                "attribute": "Minimum Age",
                "value": 18,
                "condition": "Higher Education Grant",
                "isDemo": True,
                "createdAt": now
            },
            {
                "documentId": doc_b_id,
                "pageNumber": 7,
                "section": "Eligibility Requirements",
                "statementText": "Students must be 21 years or older to receive state scholarship funding.",
                "subject": "Student",
                "attribute": "Minimum Age",
                "value": 21,
                "condition": "State Scholarship Funding",
                "isDemo": True,
                "createdAt": now
            },
            {
                "documentId": doc_a_id,
                "pageNumber": 4,
                "section": "Income Thresholds",
                "statementText": "Annual family income must be below ₹2,50,000 for full fee reimbursement.",
                "subject": "Family Income",
                "attribute": "Maximum Income Ceiling",
                "value": "₹2,50,000",
                "condition": "Full Fee Reimbursement",
                "isDemo": True,
                "createdAt": now
            },
            {
                "documentId": doc_b_id,
                "pageNumber": 9,
                "section": "Financial Criteria",
                "statementText": "Annual family income must be below ₹3,00,000 for financial assistance.",
                "subject": "Family Income",
                "attribute": "Maximum Income Ceiling",
                "value": "₹3,00,000",
                "condition": "Financial Assistance",
                "isDemo": True,
                "createdAt": now
            }
        ]

        if statements_collection is not None:
            stmt_ids = []
            for stmt in sample_statements:
                ex = statements_collection.find_one({"statementText": stmt["statementText"]})
                if not ex:
                    res = statements_collection.insert_one(stmt)
                    stmt_ids.append(str(res.inserted_id))
                else:
                    stmt_ids.append(str(ex["_id"]))

            if len(stmt_ids) >= 4 and conflicts_collection is not None:
                sample_conflicts = [
                    {
                        "statementAId": stmt_ids[0],
                        "statementBId": stmt_ids[1],
                        "conflictType": "NUMERIC_CONFLICT",
                        "confidence": 0.94,
                        "severity": "HIGH",
                        "topic": "Minimum Student Age Requirement",
                        "docATitle": "Government Order 2024",
                        "docBTitle": "Government Policy 2025",
                        "stmtAText": "Students must be 18 years or older to qualify for higher education grants.",
                        "stmtBText": "Students must be 21 years or older to receive state scholarship funding.",
                        "reason": "Direct numeric contradiction in minimum age eligibility: Order 2024 specifies 18 years while Policy 2025 specifies 21 years.",
                        "isDemo": True,
                        "createdAt": now
                    },
                    {
                        "statementAId": stmt_ids[2],
                        "statementBId": stmt_ids[3],
                        "conflictType": "NUMERIC_CONFLICT",
                        "confidence": 0.89,
                        "severity": "MEDIUM",
                        "topic": "Family Income Ceiling Threshold",
                        "docATitle": "Government Order 2024",
                        "docBTitle": "Government Policy 2025",
                        "stmtAText": "Annual family income must be below ₹2,50,000 for full fee reimbursement.",
                        "stmtBText": "Annual family income must be below ₹3,00,000 for financial assistance.",
                        "reason": "Income limit mismatch between Order 2024 (₹2,50,000) and Policy 2025 (₹3,00,000).",
                        "isDemo": True,
                        "createdAt": now
                    }
                ]
                for c in sample_conflicts:
                    ex_c = conflicts_collection.find_one({"topic": c["topic"]})
                    if not ex_c:
                        conflicts_collection.insert_one(c)

    return {
        "message": "Demo data seeded successfully!",
        "documentsCount": len(inserted_docs)
    }

@router.post("/import-dataset")
def import_dataset(max_records: Optional[int] = None):
    """Imports the Indian Laws & Acts CSV dataset (10,612 documents) into MongoDB."""
    try:
        from app.scripts.import_dataset import run_import
        res = run_import(max_records=max_records)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dataset import failed: {str(e)}")

