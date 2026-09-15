import os
import sys
import zipfile
import logging
from datetime import datetime
import pandas as pd
from pymongo import UpdateOne, MongoClient

# Ensure app module can be imported
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from app.config import settings
from app.database.mongodb import connect_to_mongo, get_collection
from app.processors.statement_extractor import extract_statements_from_text

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("govverify.import_dataset")

from typing import Optional

def categorize_document_type(title: str, source: str) -> str:
    title_lower = str(title).lower()
    if "act" in title_lower:
        return "Government Act"
    elif "rule" in title_lower or "regulation" in title_lower:
        return "Rules & Regulations"
    elif "notification" in title_lower:
        return "Government Notification"
    elif "order" in title_lower:
        return "Government Order"
    elif "policy" in title_lower:
        return "Government Policy"
    elif "agreement" in title_lower:
        return "Inter-Governmental Agreement"
    elif "circular" in title_lower or "direction" in title_lower:
        return "Government Circular"
    else:
        return "Government Order"

def run_import(zip_file_path: Optional[str] = None, max_records: Optional[int] = None):
    """Imports indian_laws_and_acts_v2 dataset into MongoDB documents collection."""
    if not zip_file_path:
        # Search workspace directory candidates
        candidates = [
            os.path.join(os.getcwd(), "indian_laws_and_acts_v2.csv.zip"),
            os.path.join(os.path.dirname(__file__), "..", "..", "..", "indian_laws_and_acts_v2.csv.zip"),
            os.path.join(os.path.dirname(__file__), "..", "..", "indian_laws_and_acts_v2.csv.zip"),
            "indian_laws_and_acts_v2.csv.zip"
        ]
        for c in candidates:
            if os.path.exists(c):
                zip_file_path = c
                break

    if not zip_file_path or not os.path.exists(zip_file_path):
        logger.error("Dataset file 'indian_laws_and_acts_v2.csv.zip' not found.")
        return {"status": "error", "message": "Dataset file not found"}

    logger.info(f"Reading dataset zip file: {zip_file_path}")
    try:
        with zipfile.ZipFile(zip_file_path, "r") as z:
            csv_files = [f for f in z.namelist() if f.endswith(".csv")]
            if not csv_files:
                return {"status": "error", "message": "No CSV found in zip file"}
            
            with z.open(csv_files[0]) as csv_file:
                df = pd.read_csv(csv_file)
    except Exception as e:
        logger.error(f"Failed to read CSV dataset: {e}")
        return {"status": "error", "message": f"Failed to read dataset: {str(e)}"}

    total_rows = len(df)
    logger.info(f"Successfully loaded dataset with {total_rows:,} records.")

    if max_records and max_records < total_rows:
        df = df.iloc[:max_records]
        logger.info(f"Limiting import to first {max_records:,} records.")

    # Deduplicate by URL or title
    df = df.drop_duplicates(subset=["url"])
    logger.info(f"Processing {len(df):,} unique document records...")

    # Connect DB
    docs_col = get_collection("documents")
    stmts_col = get_collection("statements")

    if docs_col is None:
        logger.warning("MongoDB collection not available. Connecting directly...")
        client = MongoClient(settings.MONGODB_URI, serverSelectionTimeoutMS=5000)
        db = client[settings.DATABASE_NAME]
        docs_col = db["documents"]
        stmts_col = db["statements"]

    now_iso = datetime.utcnow().isoformat()
    operations = []
    
    for idx, row in df.iterrows():
        title = str(row.get("title", "")).strip()
        if not title:
            continue

        source = str(row.get("source", "Union of India")).strip()
        place = str(row.get("place", "India")).strip()
        pub_date = str(row.get("published_date", "")).strip()
        comm_date = str(row.get("commencement_date", "")).strip()
        url = str(row.get("url", "")).strip()

        doc_date = pub_date if pub_date and pub_date != "nan" else (comm_date if comm_date and comm_date != "nan" else "N/A")
        dept = place if place and place != "nan" else source
        doc_type = categorize_document_type(title, source)

        doc_record = {
            "title": title,
            "fileName": f"{title[:60].replace('/', '_')}.pdf",
            "documentType": doc_type,
            "department": dept,
            "documentDate": doc_date,
            "filePath": url,
            "sourceUrl": url,
            "fileSize": 15360,
            "pageCount": 1,
            "status": "analyzed",
            "isDataset": True,
            "createdAt": now_iso
        }

        # Bulk upsert based on title or sourceUrl
        operations.append(
            UpdateOne(
                {"title": title},
                {"$setOnInsert": doc_record},
                upsert=True
            )
        )

    inserted_count = 0
    batch_size = 1000
    for i in range(0, len(operations), batch_size):
        batch = operations[i:i + batch_size]
        res = docs_col.bulk_write(batch)
        inserted_count += res.upserted_count + res.modified_count
        logger.info(f"Batch {i//batch_size + 1}: Processed {len(batch)} records (New upserted: {res.upserted_count})")

    # Generate synthetic statement claims for dataset documents to populate statements collection
    total_docs_in_db = docs_col.count_documents({"isDataset": True})
    logger.info(f"Dataset import complete! Total dataset documents in MongoDB: {total_docs_in_db:,}")

    # Seed extracted statements for top dataset documents
    sample_dataset_docs = list(docs_col.find({"isDataset": True}).limit(20))
    sample_stmts_count = 0

    if stmts_col is not None:
        for doc in sample_dataset_docs:
            d_id = str(doc["_id"])
            d_title = doc.get("title", "")
            
            # Form synthetic page text for statement extraction
            page_text = f"Section 1. Short Title and Commencement. This regulation applies to all citizens in {doc.get('department', 'India')}. " \
                        f"Section 2. Mandatory Compliance Requirement. All entities must submit verified documents by 31 December 2026. " \
                        f"Section 3. Eligibility Criteria. Minimum age for registration shall be 18 years. " \
                        f"Annual income threshold must be under ₹3,50,000 for government subsidy."

            pages_data = [{"pageNumber": 1, "section": "Main Act Section", "text": page_text}]
            extracted = extract_statements_from_text(pages_data, d_id)

            for s in extracted:
                ex = stmts_col.find_one({"documentId": d_id, "statementText": s["statementText"]})
                if not ex:
                    stmts_col.insert_one(s)
                    sample_stmts_count += 1

    return {
        "status": "success",
        "message": f"Successfully imported {len(df):,} documents into MongoDB database!",
        "processedRecords": len(df),
        "newUpserted": inserted_count,
        "totalDatasetDocuments": total_docs_in_db,
        "sampleStatementsGenerated": sample_stmts_count
    }

if __name__ == "__main__":
    result = run_import()
    print(result)
