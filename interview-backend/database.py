from pymongo import MongoClient
import logging
from pymongo.database import Database
from contextlib import contextmanager
from config import get_settings
import os

_client = None
_db = None

def get_mongodb_client():
    global _client, _db

    if _client is None:
        mongodb_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")
        _client = MongoClient(mongodb_uri)
        db_name = os.getenv("MONGODB_DB_NAME", "ai_interviewer")
        _db = _client[db_name]

        # Create indexes used by the application
        _db.interview_sessions.create_index("id", unique=True)
        _db.interview_answers.create_index("id", unique=True)
        _db.interview_answers.create_index([("session_id", 1), ("question_id", 1)])

        # Perform a lightweight ping to verify connection and give a clear startup message
        logger = logging.getLogger("backend.database")
        try:
            _client.admin.command("ping")
            logger.info(f"MongoDB connected successfully -> URI: {mongodb_uri}  DB: {db_name}")
        except Exception as e:
            logger.warning(f"MongoDB ping failed during startup: {e}")

    return _db

@contextmanager
def get_db():
    db = get_mongodb_client()
    try:
        yield db
    finally:
        pass

def close_db():
    global _client, _db
    if _client:
        _client.close()
        _client = None
        _db = None
