from pydantic import BaseModel, Field
from typing import List, Optional

class AnalysisResponse(BaseModel):
    id: str = Field(..., alias="_id")
    documentIds: List[str]
    status: str  # pending, processing, completed, failed
    totalStatements: int = 0
    matchedStatements: int = 0
    conflictsFound: int = 0
    possibleConflicts: int = 0
    startedAt: Optional[str] = None
    completedAt: Optional[str] = None

    class Config:
        populate_by_name = True
