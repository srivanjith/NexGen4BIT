import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database.mongodb import connect_to_mongo
from app.api.routes.router import api_router

app = FastAPI(
    title="GovVerify API",
    description="Government Document Conflict Detection & Evidence Verification System Backend",
    version="1.0.0"
)

# CORS configuration
origins = [
    settings.FRONTEND_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads static folder if exists
os.makedirs(settings.UPLOADS_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOADS_DIR), name="uploads")

# Connect DB on startup
@app.on_event("startup")
def on_startup():
    connect_to_mongo()

# Include Routers
app.include_router(api_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
