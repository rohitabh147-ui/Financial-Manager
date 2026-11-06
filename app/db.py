# app/db.py
import os

from pymongo import ASCENDING, DESCENDING, MongoClient

MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.environ.get("MONGO_DB", "finance_manager")

client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
db = client[DB_NAME]

# The three collections (the MongoDB equivalent of tables)
users = db["users"]                          # Module 1: login accounts
financial_profiles = db["financial_profiles"]  # Module 2: user inputs and goal
plans = db["plans"]                          # Module 3: saved plans


def init_db():
    """Check the connection and create indexes."""
    try:
        client.admin.command("ping")
    except Exception as e:
        raise RuntimeError(
            "Cannot connect to MongoDB. Is the MongoDB service running?"
        ) from e

    users.create_index([("email", ASCENDING)], unique=True)
    financial_profiles.create_index([("user_id", ASCENDING)], unique=True)
    plans.create_index([("user_id", ASCENDING), ("created_at", DESCENDING)])