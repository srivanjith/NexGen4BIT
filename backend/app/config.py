import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # MongoDB Connection
    MONGODB_URI: str = "mongodb+srv://femina6666fe_db_user:tgDJ8z4WSgFnA0FY@cluster0.7bvb5zk.mongodb.net/?appName=Cluster0&tlsAllowInvalidCertificates=true"
    DATABASE_NAME: str = "govverify"

    # CORS & Security
    FRONTEND_URL: str = "http://localhost:5173"
    SECRET_KEY: str = "govverify_dev_secret_key_2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # File Upload Settings
    UPLOADS_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "uploads"))
    MAX_FILE_SIZE_MB: int = 10

    # AI / ML Settings
    MODEL_NAME: str = "all-MiniLM-L6-v2"
    SIMILARITY_THRESHOLD: float = 0.50

    # Optional External Integrations
    OPENAI_API_KEY: str = ""

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
