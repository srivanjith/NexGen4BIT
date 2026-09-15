from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class DocumentCreate(BaseModel):
    title: str
    fileName: str
    documentType: str = "Government Order"
    department: str = "General"
    documentDate: Optional[str] = None
    pageCount: int = 1

class DocumentResponse(BaseModel):
    id: str = Field(..., alias="_id")
    title: str
    fileName: str
    documentType: str
    department: str
    documentDate: Optional[str] = None
    filePath: str
    fileSize: int
    pageCount: int
    status: str
    createdAt: str

    class Config:
        populate_by_name = True
