import re
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime

logger = logging.getLogger("govverify.statement_extractor")

# Regex pattern matchers for quantitative and conditional claims
AGE_PATTERN = re.compile(r'(?:age|aged|years|years old)\s*(?:must be|of|at least|minimum|above|below|between)?\s*(\d{1,2})\s*(?:years|years old|yrs)?', re.IGNORECASE)
INCOME_PATTERN = re.compile(r'(?:income|family income|annual income|ceiling)\s*(?:must be|below|under|less than|up to)?\s*(?:₹|rs\.?|inr)?\s*([\d,]+(?:\.\d+)?)\s*(?:lakh|lakhs|k)?', re.IGNORECASE)
DEADLINE_PATTERN = re.compile(r'(?:deadline|last date|due date|before|by)\s*(?:is|shall be)?\s*(\d{1,2}\s+[A-Za-z]+\s+\d{4}|\d{4}-\d{2}-\d{2})', re.IGNORECASE)
REQUIREMENT_PATTERN = re.compile(r'(?:required|must submit|documents? required|mandatory)\s*:?\s*([A-Za-z0-9\s,\-\(\)]+)', re.IGNORECASE)

def extract_statements_from_text(page_data: List[Dict[str, Any]], document_id: str) -> List[Dict[str, Any]]:
    """Converts page text items into structured statement claim objects."""
    statements = []
    now_iso = datetime.utcnow().isoformat()
    
    for page_item in page_data:
        page_num = page_item.get("pageNumber", 1)
        section = page_item.get("section", "General")
        raw_text = page_item.get("text", "")
        
        if not raw_text or raw_text.startswith("Error"):
            continue

        # Split text into sentence units
        sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', raw_text) if len(s.strip()) > 15]

        for sentence in sentences:
            stmt_obj = {
                "documentId": document_id,
                "pageNumber": page_num,
                "section": section,
                "statementText": sentence,
                "subject": "General Claim",
                "attribute": "Policy Regulation",
                "value": None,
                "unit": None,
                "condition": None,
                "createdAt": now_iso
            }

            # Condition Check
            if " if " in sentence.lower() or " provided " in sentence.lower() or " unless " in sentence.lower() or " subject to " in sentence.lower():
                cond_split = re.split(r'\b(if|provided|unless|subject to)\b', sentence, flags=re.IGNORECASE)
                if len(cond_split) >= 3:
                    stmt_obj["condition"] = cond_split[1] + " " + cond_split[2]

            # Rule match 1: Age
            age_match = AGE_PATTERN.search(sentence)
            if age_match:
                stmt_obj["subject"] = "Student"
                stmt_obj["attribute"] = "Minimum Age"
                stmt_obj["value"] = int(age_match.group(1))
                stmt_obj["unit"] = "years"
                statements.append(stmt_obj)
                continue

            # Rule match 2: Income
            income_match = INCOME_PATTERN.search(sentence)
            if income_match:
                val_str = income_match.group(1).replace(",", "")
                try:
                    num_val = float(val_str)
                    if "lakh" in sentence.lower():
                        num_val *= 100000
                except ValueError:
                    num_val = val_str

                stmt_obj["subject"] = "Family Income"
                stmt_obj["attribute"] = "Maximum Income Ceiling"
                stmt_obj["value"] = f"₹{num_val:,.0f}" if isinstance(num_val, (int, float)) else num_val
                stmt_obj["unit"] = "₹"
                statements.append(stmt_obj)
                continue

            # Rule match 3: Deadline Date
            date_match = DEADLINE_PATTERN.search(sentence)
            if date_match:
                stmt_obj["subject"] = "Application"
                stmt_obj["attribute"] = "Submission Deadline"
                stmt_obj["value"] = date_match.group(1)
                stmt_obj["unit"] = "date"
                statements.append(stmt_obj)
                continue

            # Rule match 4: Mandatory Document Requirements
            req_match = REQUIREMENT_PATTERN.search(sentence)
            if req_match:
                stmt_obj["subject"] = "Verification"
                stmt_obj["attribute"] = "Required Document"
                stmt_obj["value"] = req_match.group(1).strip()
                stmt_obj["unit"] = "requirement"
                statements.append(stmt_obj)
                continue

            # General statement fallback
            statements.append(stmt_obj)

    return statements
