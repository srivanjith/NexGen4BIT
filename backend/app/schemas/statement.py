from pydantic import BaseModel, Field
from typing import Optional, Any

class StatementResponse(BaseModel):
    id: str = Field(..., alias="_id")
    documentId: str
    pageNumber: int
    section: Optional[str] = "General"
    statementText: str
    subject: Optional[str] = None
    attribute: Optional[str] = None
    value: Optional[Any] = None
    condition: Optional[str] = None
    createdAt: str

    class Config:
        populate_by_name = True
