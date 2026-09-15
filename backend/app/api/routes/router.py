from fastapi import APIRouter
from app.api.routes import health, documents, stats, analysis, conflicts, evidence, reports, ml

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(documents.router)
api_router.include_router(stats.router)
api_router.include_router(analysis.router)
api_router.include_router(conflicts.router)
api_router.include_router(evidence.router)
api_router.include_router(reports.router)
api_router.include_router(ml.router)

