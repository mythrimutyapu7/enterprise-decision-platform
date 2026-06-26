import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

uri = os.getenv("MONGODB_URI")

try:
    client = MongoClient(uri)
    client.admin.command("ping")
    print("✅ Connected Successfully")
except Exception as e:
    print("❌ Connection Failed")
    print(e)