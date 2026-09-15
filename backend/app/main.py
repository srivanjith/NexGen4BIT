import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database.mongodb import connect_to_mongo
from app.api.routes.router import api_router

from app.api.routes.health import get_health

class VercelPathFixMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope.get("type") == "http":
            path = scope.get("path", "")
            query_string = scope.get("query_string", b"").decode("latin1")

            if "path=" in query_string:
                import urllib.parse
                qs = urllib.parse.parse_qs(query_string)
                if "path" in qs and qs["path"]:
                    path = qs["path"][0]

            if path.startswith("/api/index.py"):
                path = path[len("/api/index.py"):]
            elif path.startswith("/api/index"):
                path = path[len("/api/index"):]

            if not path or not path.startswith("/"):
                path = "/" + path.lstrip("/")

            scope["path"] = path
        await self.app(scope, receive, send)

app = FastAPI(
    title="GovVerify API",
    description="Government Document Conflict Detection & Evidence Verification System Backend",
    version="1.0.0"
)

app.add_middleware(VercelPathFixMiddleware)

from typing import Optional
from fastapi import UploadFile, File, Form

@app.get("/")
def root():
    return {"status": "ok", "message": "GovVerify Backend API"}

@app.get("/api")
def api_root():
    return {"status": "ok", "message": "GovVerify Backend API Root"}

@app.get("/health")
@app.get("/api/health")
def health_check():
    return get_health()

@app.post("/")
@app.post("/documents/upload")
@app.post("/documents/upload/")
@app.post("/api/documents/upload")
@app.post("/api/documents/upload/")
async def direct_upload_document(
    file: UploadFile = File(...),
    documentType: str = Form("Government Order"),
    department: str = Form("General"),
    documentDate: Optional[str] = Form(None)
):
    from app.api.routes.documents import upload_document
    return await upload_document(file, documentType, department, documentDate)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https://.*\.vercel\.app|http://localhost:\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads static folder if exists
try:
    os.makedirs(settings.UPLOADS_DIR, exist_ok=True)
    if os.path.exists(settings.UPLOADS_DIR):
        app.mount("/uploads", StaticFiles(directory=settings.UPLOADS_DIR), name="uploads")
except Exception:
    pass

# Connect DB on startup
@app.on_event("startup")
def on_startup():
    connect_to_mongo()

# Include Routers
app.include_router(api_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
