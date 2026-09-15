import os
import sys
import time
import json
import logging
from datetime import datetime
from typing import Dict, Any

import numpy as np

# Ensure app module can be imported
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from app.config import settings
from app.database.mongodb import get_collection, connect_to_mongo
from pymongo import MongoClient

logger = logging.getLogger("govverify.train_model")

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
os.makedirs(MODEL_DIR, exist_ok=True)

def train_ml_models(max_samples: int = None) -> Dict[str, Any]:
    """Trains TF-IDF Vectorizer & Legal Document Classifier models on MongoDB dataset."""
    start_time = time.time()
    now_iso = datetime.utcnow().isoformat()
    logger.info("Starting ML model training on MongoDB dataset...")

    # Load scikit-learn & joblib
    try:
        import joblib
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.linear_model import LogisticRegression
        from sklearn.model_selection import train_test_split
        from sklearn.metrics import accuracy_score
    except ImportError as e:
        logger.error(f"Required ML packages not installed: {e}")
        return {"status": "error", "message": f"ML packages missing: {str(e)}"}

    # Fetch dataset documents from MongoDB
    docs_col = get_collection("documents")
    if docs_col is None:
        client = MongoClient(settings.MONGODB_URI, serverSelectionTimeoutMS=5000)
        db = client[settings.DATABASE_NAME]
        docs_col = db["documents"]

    query = {}
    total_in_db = docs_col.count_documents(query)
    logger.info(f"Found {total_in_db:,} total documents in MongoDB.")

    if total_in_db == 0:
        return {"status": "error", "message": "No documents found in database to train on. Please import dataset first."}

    limit = max_samples if max_samples and max_samples < total_in_db else total_in_db
    logger.info(f"Fetching {limit:,} document samples for model training...")

    cursor = docs_col.find(query, {"title": 1, "documentType": 1, "department": 1}).limit(limit)
    documents = list(cursor)

    texts = []
    labels = []
    for d in documents:
        t = str(d.get("title", "")).strip()
        dtype = str(d.get("documentType", "Government Order")).strip()
        dept = str(d.get("department", "")).strip()
        if t:
            full_feature_text = f"{t} {dept} {dtype}"
            texts.append(full_feature_text)
            labels.append(dtype)

    if len(texts) < 10:
        return {"status": "error", "message": "Not enough document text samples to train ML model."}

    logger.info(f"Training TF-IDF Vectorizer on {len(texts):,} legal text samples...")
    
    # Step 1: Fit TF-IDF Vectorizer
    vectorizer = TfidfVectorizer(stop_words='english', ngram_range=(1, 2), max_features=10000)
    X = vectorizer.fit_transform(texts)
    vocab_size = len(vectorizer.vocabulary_)
    logger.info(f"TF-IDF Vectorizer fitted! Vocabulary size: {vocab_size:,} features.")

    # Step 2: Train Document Type Classifier
    X_train, X_test, y_train, y_test = train_test_split(X, labels, test_size=0.2, random_state=42)
    
    classifier = LogisticRegression(max_iter=500, random_state=42)
    classifier.fit(X_train, y_train)
    
    y_pred = classifier.predict(X_test)
    accuracy = float(accuracy_score(y_test, y_pred))
    logger.info(f"Document Classifier model trained! Accuracy score: {accuracy:.4f}")

    # Save model artifacts
    vectorizer_path = os.path.join(MODEL_DIR, "tfidf_vectorizer.joblib")
    classifier_path = os.path.join(MODEL_DIR, "doc_classifier.joblib")
    metadata_path = os.path.join(MODEL_DIR, "model_metadata.json")

    joblib.dump(vectorizer, vectorizer_path)
    joblib.dump(classifier, classifier_path)

    elapsed_sec = round(time.time() - start_time, 2)
    metadata = {
        "status": "trained",
        "lastTrainedAt": now_iso,
        "sampleCount": len(texts),
        "vocabularySize": vocab_size,
        "accuracy": round(accuracy, 4),
        "accuracyPercentage": f"{round(accuracy * 100, 2)}%",
        "trainingDurationSeconds": elapsed_sec,
        "classes": list(set(labels)),
        "modelDirectory": MODEL_DIR
    }

    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2)

    # Update metadata in MongoDB analyses or settings collection
    settings_col = get_collection("system_settings")
    if settings_col is not None:
        settings_col.update_one({"key": "ml_model_metadata"}, {"$set": metadata}, upsert=True)

    logger.info(f"Model artifacts successfully saved to {MODEL_DIR}. Training finished in {elapsed_sec}s!")
    return metadata

if __name__ == "__main__":
    res = train_ml_models()
    print(json.dumps(res, indent=2))
