import logging
from typing import List, Dict, Any, Optional
from datetime import datetime

logger = logging.getLogger("govverify.conflict_engine")

def evaluate_statement_pair(
    stmt_a: Dict[str, Any],
    stmt_b: Dict[str, Any],
    similarity_score: float,
    doc_a_title: str = "Document A",
    doc_b_title: str = "Document B"
) -> Optional[Dict[str, Any]]:
    """Evaluates two matched statements to classify conflict category, severity, and reason."""
    
    val_a = stmt_a.get("value")
    val_b = stmt_b.get("value")
    attr_a = stmt_a.get("attribute")
    attr_b = stmt_b.get("attribute")
    sub_a = stmt_a.get("subject")
    sub_b = stmt_b.get("subject")
    text_a = stmt_a.get("statementText", "")
    text_b = stmt_b.get("statementText", "")
    cond_a = stmt_a.get("condition")
    cond_b = stmt_b.get("condition")

    # Guard: Identical or missing statement texts represent consistency/agreement, not a conflict
    if not text_a or not text_b or text_a.strip().lower() == text_b.strip().lower():
        return None

    # Check 1: Conditional Exception Clause
    if cond_a or cond_b:
        condition_text = cond_a or cond_b
        return {
            "conflictType": "CONDITIONAL_DIFFERENCE",
            "severity": "LOW",
            "confidence": 0.85,
            "topic": f"Conditional Exception ({sub_a or 'Policy Rule'})",
            "docATitle": doc_a_title,
            "docBTitle": doc_b_title,
            "stmtAText": text_a,
            "stmtBText": text_b,
            "reason": f"Statement includes a conditional exception clause ({condition_text}) rather than a direct contradiction.",
            "isException": True
        }

    # Check 2: Same Attribute with Different Values (Numeric / Eligibility Conflict)
    if (attr_a and attr_b and attr_a == attr_b) or (sub_a and sub_b and sub_a == sub_b and sub_a != "General Claim"):
        if val_a and val_b and str(val_a).strip() != str(val_b).strip():
            
            # Sub-check: Age / Eligibility
            if attr_a == "Minimum Age" or "age" in str(sub_a).lower():
                return {
                    "conflictType": "ELIGIBILITY_CONFLICT",
                    "severity": "HIGH",
                    "confidence": 0.94,
                    "topic": f"Minimum Eligibility Age Requirement",
                    "docATitle": doc_a_title,
                    "docBTitle": doc_b_title,
                    "stmtAText": text_a,
                    "stmtBText": text_b,
                    "reason": f"Direct contradiction in minimum age eligibility requirement ({doc_a_title}: {val_a} years vs {doc_b_title}: {val_b} years).",
                    "isException": False
                }

            # Sub-check: Income Ceiling
            if attr_a == "Maximum Income Ceiling" or "income" in str(sub_a).lower():
                return {
                    "conflictType": "NUMERIC_CONFLICT",
                    "severity": "MEDIUM",
                    "confidence": 0.89,
                    "topic": f"Maximum Income Threshold Ceiling",
                    "docATitle": doc_a_title,
                    "docBTitle": doc_b_title,
                    "stmtAText": text_a,
                    "stmtBText": text_b,
                    "reason": f"Quantitative income ceiling mismatch ({doc_a_title}: {val_a} vs {doc_b_title}: {val_b}).",
                    "isException": False
                }

            # Sub-check: Submission Deadline Date
            if attr_a == "Submission Deadline" or "date" in str(sub_a).lower() or "deadline" in str(sub_a).lower():
                return {
                    "conflictType": "POLICY_CHANGE",
                    "severity": "MEDIUM",
                    "confidence": 0.82,
                    "topic": f"Application Deadline Shift",
                    "docATitle": doc_a_title,
                    "docBTitle": doc_b_title,
                    "stmtAText": text_a,
                    "stmtBText": text_b,
                    "reason": f"Deadline date differs between revisions ({doc_a_title}: {val_a} vs {doc_b_title}: {val_b}).",
                    "isException": False
                }

            # Generic Numeric Mismatch
            return {
                "conflictType": "NUMERIC_CONFLICT",
                "severity": "HIGH",
                "confidence": 0.90,
                "topic": f"{attr_a or sub_a or 'Numeric Value'} Discrepancy",
                "docATitle": doc_a_title,
                "docBTitle": doc_b_title,
                "stmtAText": text_a,
                "stmtBText": text_b,
                "reason": f"Conflicting values detected for attribute '{attr_a}': {val_a} vs {val_b}.",
                "isException": False
            }

    # Check 3: Semantic Antonym / Contradiction heuristical NLI
    negation_terms = ["not", "no", "prohibited", "banned", "cannot", "exempt", "mandatory", "optional"]
    text_a_words = set(text_a.lower().split())
    text_b_words = set(text_b.lower().split())

    if (any(w in text_a_words for w in negation_terms) and not any(w in text_b_words for w in negation_terms)) or \
       (any(w in text_b_words for w in negation_terms) and not any(w in text_a_words for w in negation_terms)):
        return {
            "conflictType": "DIRECT_CONFLICT",
            "severity": "HIGH",
            "confidence": 0.88,
            "topic": f"Direct Policy Contradiction",
            "docATitle": doc_a_title,
            "docBTitle": doc_b_title,
            "stmtAText": text_a,
            "stmtBText": text_b,
            "reason": f"Direct contradiction in requirement enforcement between {doc_a_title} and {doc_b_title}.",
            "isException": False
        }

    # Check 4: Requirement Difference
    if attr_a == "Required Document" or attr_b == "Required Document":
        if text_a.lower() != text_b.lower():
            return {
                "conflictType": "REQUIREMENT_CONFLICT",
                "severity": "MEDIUM",
                "confidence": 0.80,
                "topic": f"Verification Document Requirements",
                "docATitle": doc_a_title,
                "docBTitle": doc_b_title,
                "stmtAText": text_a,
                "stmtBText": text_b,
                "isException": False
            }

    # Check 5: Semantic Topic Similarity Discrepancy
    if similarity_score >= 0.50 and text_a.lower().strip() != text_b.lower().strip():
        return {
            "conflictType": "POLICY_CHANGE",
            "severity": "MEDIUM" if similarity_score >= 0.65 else "LOW",
            "confidence": round(similarity_score, 2),
            "topic": f"Clause Discrepancy ({sub_a or 'Policy Provision'})",
            "docATitle": doc_a_title,
            "docBTitle": doc_b_title,
            "stmtAText": text_a,
            "stmtBText": text_b,
            "reason": f"Semantic topic similarity ({int(similarity_score * 100)}%) detected between clauses, but exact wording or policy specifications differ between {doc_a_title} and {doc_b_title}.",
            "isException": False
        }

    return None

def analyze_document_conflict_pairs(
    matched_pairs: List[Dict[str, Any]],
    doc_titles_map: Dict[str, str]
) -> List[Dict[str, Any]]:
    """Runs rule engine and NLI comparison on matched semantic statement pairs."""
    detected_conflicts = []
    now_iso = datetime.utcnow().isoformat()

    for pair in matched_pairs:
        stmt_a = pair["stmtA"]
        stmt_b = pair["stmtB"]
        score = pair["similarityScore"]

        doc_a_title = doc_titles_map.get(stmt_a.get("documentId"), "Document A")
        doc_b_title = doc_titles_map.get(stmt_b.get("documentId"), "Document B")

        eval_res = evaluate_statement_pair(stmt_a, stmt_b, score, doc_a_title, doc_b_title)
        
        if eval_res:
            eval_res["statementAId"] = str(stmt_a.get("_id", ""))
            eval_res["statementBId"] = str(stmt_b.get("_id", ""))
            eval_res["docAId"] = stmt_a.get("documentId")
            eval_res["docBId"] = stmt_b.get("documentId")
            eval_res["pageA"] = stmt_a.get("pageNumber", 1)
            eval_res["pageB"] = stmt_b.get("pageNumber", 1)
            eval_res["sectionA"] = stmt_a.get("section", "General")
            eval_res["sectionB"] = stmt_b.get("section", "General")
            eval_res["createdAt"] = now_iso
            detected_conflicts.append(eval_res)

    return detected_conflicts
