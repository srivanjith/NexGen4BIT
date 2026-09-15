import logging
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from app.config import settings

logger = logging.getLogger("govverify.database")

class Database:
    client: MongoClient = None
    db = None

db_instance = Database()

def get_database():
    """Returns the current MongoDB database handle."""
    if db_instance.db is None:
        connect_to_mongo()
    return db_instance.db

def connect_to_mongo():
    """Initializes the MongoDB client."""
    try:
        db_instance.client = MongoClient(
            settings.MONGODB_URI,
            serverSelectionTimeoutMS=2000
        )
        db_instance.db = db_instance.client[settings.DATABASE_NAME]
        logger.info(f"Connected to MongoDB at {settings.MONGODB_URI}, Database: {settings.DATABASE_NAME}")
    except Exception as e:
        logger.warning(f"Could not initialize MongoDB client: {str(e)}")
        db_instance.client = None
        db_instance.db = None

def check_db_health():
    """Checks if MongoDB connection is active and healthy."""
    if db_instance.client is None:
        try:
            connect_to_mongo()
        except Exception:
            return False, "Not initialized"

    try:
        if db_instance.client is not None:
            # Send a ping command to confirm server is reachable
            db_instance.client.admin.command('ping')
            return True, "connected"
    except (ConnectionFailure, ServerSelectionTimeoutError) as e:
        return False, f"disconnected ({str(e)})"
    except Exception as e:
        return False, f"error: {str(e)}"
    
    return False, "disconnected"

def get_collection(collection_name: str):
    """Utility to safely retrieve a collection or None if DB not connected."""
    db = get_database()
    if db is not None:
        return db[collection_name]
    return None
