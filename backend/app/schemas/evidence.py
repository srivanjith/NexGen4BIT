from pydantic import BaseModel, Field
from typing import Optional

class EvidenceResponse(BaseModel):
    id: str = Field(..., alias="_id")
    conflictId: str
    documentId: str
    pageNumber: int
    section: Optional[str] = "General"
    sourceText: str
    createdAt: str

    class Config:
        populate_by_name = True
