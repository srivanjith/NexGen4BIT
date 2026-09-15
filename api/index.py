import os
import sys
from fastapi import FastAPI

current_dir = os.path.dirname(os.path.abspath(__file__))
backend_path = os.path.abspath(os.path.join(current_dir, '..', 'backend'))
parent_path = os.path.abspath(os.path.join(current_dir, '..'))

if os.path.exists(backend_path) and backend_path not in sys.path:
    sys.path.insert(0, backend_path)
if parent_path not in sys.path:
    sys.path.insert(0, parent_path)
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

try:
    from app.main import app  # type: ignore # pyright: ignore [reportMissingImports]
except Exception as e:

    import traceback
    error_detail = traceback.format_exc()
    class VercelPathFixMiddleware:
        def __init__(self, app):
            self.app = app

        async def __call__(self, scope, receive, send):
            if scope.get("type") == "http":
                path = scope.get("path", "")
                query_string = scope.get("query_string", b"").decode("latin1")

                if "__path__=" in query_string:
                    import urllib.parse
                    qs_dict = urllib.parse.parse_qs(query_string)
                    if "__path__" in qs_dict and qs_dict["__path__"]:
                        extracted = qs_dict["__path__"][0]
                        if extracted:
                            path = extracted

                if path.startswith("/api/index.py"):
                    path = path[len("/api/index.py"):]
                elif path.startswith("/api/index"):
                    path = path[len("/api/index"):]

                if not path or not path.startswith("/"):
                    path = "/" + path.lstrip("/")

                scope["path"] = path
            await self.app(scope, receive, send)

    app = FastAPI(title="GovVerify API Fallback")
    app.add_middleware(VercelPathFixMiddleware)

    @app.get("/")
    @app.get("/api")
    @app.get("/health")
    @app.get("/api/health")
    def root():
        return {
            "status": "degraded",
            "database": "disconnected",
            "backend": "online",
            "fallback": True,
            "detail": str(e),
            "traceback": error_detail
        }

handler = app

