import os
import sys

current_dir = os.path.dirname(os.path.abspath(__file__))
backend_path = os.path.abspath(os.path.join(current_dir, '..'))
parent_path = os.path.abspath(os.path.join(current_dir, '..', '..'))

if os.path.exists(backend_path) and backend_path not in sys.path:
    sys.path.insert(0, backend_path)
if os.path.exists(parent_path) and parent_path not in sys.path:
    sys.path.insert(0, parent_path)
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

try:
    from app.main import app  # type: ignore # pyright: ignore [reportMissingImports]
except Exception as e:

    import traceback
    error_detail = traceback.format_exc()
    from fastapi import FastAPI
    app = FastAPI(title="GovVerify API Fallback")

    @app.get("/")
    @app.get("/api")
    def root():
        return {"status": "error", "fallback": True, "detail": str(e), "traceback": error_detail}

handler = app

