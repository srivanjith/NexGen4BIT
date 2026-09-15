from pydantic import BaseModel, Field
from typing import Optional

class ConflictResponse(BaseModel):
    id: str = Field(..., alias="_id")
    statementAId: str
    statementBId: str
    conflictType: str  # NUMERIC_CONFLICT, DATE_CONFLICT, CONDITIONAL_DIFFERENCE, POLICY_CHANGE, DIRECT_CONFLICT
    confidence: float
    severity: str  # HIGH, MEDIUM, LOW
    reason: str
    createdAt: str

    class Config:
        populate_by_name = True
