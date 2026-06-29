import os

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME")

if not MONGODB_URI:
    raise ValueError("MONGODB_URI not found in .env")

if not DATABASE_NAME:
    raise ValueError("DATABASE_NAME not found in .env")

client = AsyncIOMotorClient(MONGODB_URI)

database = client[DATABASE_NAME]