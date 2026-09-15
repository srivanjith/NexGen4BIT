from fastapi import APIRouter
from app.database.mongodb import check_db_health

router = APIRouter()

@router.get("/")
def read_root():
    return {"status": "ok"}

@router.get("/api/health")
def get_health():
    is_db_connected, db_msg = check_db_health()
    return {
        "status": "healthy" if is_db_connected else "degraded",
        "database": "connected" if is_db_connected else f"disconnected ({db_msg})",
        "backend": "online"
    }
