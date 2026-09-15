import logging
from typing import List, Dict, Any, Tuple

logger = logging.getLogger("govverify.embeddings")

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False

def compute_similarity_matrix(texts_a: List[str], texts_b: List[str]):
    """Computes TF-IDF cosine similarity matrix with automatic Jaccard fallback for serverless functions."""
    if not texts_a or not texts_b:
        return [[0.0] * len(texts_b) for _ in range(len(texts_a))]

    try:
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.metrics.pairwise import cosine_similarity
        all_texts = texts_a + texts_b
        vectorizer = TfidfVectorizer(stop_words='english', ngram_range=(1, 2))
        tfidf_matrix = vectorizer.fit_transform(all_texts)

        matrix_a = tfidf_matrix[:len(texts_a)]
        matrix_b = tfidf_matrix[len(texts_a):]

        return cosine_similarity(matrix_a, matrix_b)
    except Exception as e:
        logger.warning(f"TF-IDF similarity fallback triggered: {e}")
        matrix = []
        for ta in texts_a:
            row = []
            sa = set(ta.lower().split())
            for tb in texts_b:
                sb = set(tb.lower().split())
                score = len(sa & sb) / float(len(sa | sb)) if (sa | sb) else 0.0
                row.append(score)
            matrix.append(row)
        return matrix

def match_semantic_statements(
    statements_doc_a: List[Dict[str, Any]],
    statements_doc_b: List[Dict[str, Any]],
    threshold: float = 0.50
) -> List[Dict[str, Any]]:
    """Pairs statements from two documents discussing the same topic."""
    matched_pairs = []

    if not statements_doc_a or not statements_doc_b:
        return matched_pairs

    texts_a = [s.get("statementText", "") for s in statements_doc_a]
    texts_b = [s.get("statementText", "") for s in statements_doc_b]

    sim_matrix = compute_similarity_matrix(texts_a, texts_b)

    for i, stmt_a in enumerate(statements_doc_a):
        for j, stmt_b in enumerate(statements_doc_b):
            score = float(sim_matrix[i][j]) if isinstance(sim_matrix, list) else float(sim_matrix[i, j])

            # Also boost score if both share same attribute or subject
            sub_a = stmt_a.get("subject")
            sub_b = stmt_b.get("subject")
            attr_a = stmt_a.get("attribute")
            attr_b = stmt_b.get("attribute")

            if sub_a and sub_b and sub_a == sub_b and sub_a != "General Claim":
                score = max(score, 0.85)

            if attr_a and attr_b and attr_a == attr_b and attr_a != "Policy Regulation":
                score = max(score, 0.88)

            if score >= threshold:
                matched_pairs.append({
                    "stmtA": stmt_a,
                    "stmtB": stmt_b,
                    "similarityScore": round(score, 2)
                })

    return matched_pairs
