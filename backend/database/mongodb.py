import json
import os
from copy import deepcopy
from pathlib import Path

from bson import ObjectId
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import PyMongoError, ServerSelectionTimeoutError

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME")
FALLBACK_DB_PATH = Path(__file__).resolve().parents[1] / ".fallback_db.json"


class _InsertOneResult:
    def __init__(self, inserted_id):
        self.inserted_id = inserted_id


class _DeleteOneResult:
    def __init__(self, deleted_count: int):
        self.deleted_count = deleted_count


class _UpdateOneResult:
    def __init__(self, modified_count: int):
        self.modified_count = modified_count


class _AsyncCursor:
    def __init__(self, documents):
        self._documents = documents
        self._index = 0

    def __aiter__(self):
        return self

    async def __anext__(self):
        if self._index >= len(self._documents):
            raise StopAsyncIteration

        document = deepcopy(self._documents[self._index])
        self._index += 1
        return document


class _FallbackStore:
    def __init__(self, path: Path):
        self._path = path
        self._data = self._load()

    def _load(self):
        if not self._path.exists():
            return {}

        try:
            with self._path.open("r", encoding="utf-8") as handle:
                data = json.load(handle)
            return data if isinstance(data, dict) else {}
        except Exception:
            return {}

    def save(self):
        self._path.parent.mkdir(parents=True, exist_ok=True)
        temp_path = self._path.with_suffix(".tmp")
        with temp_path.open("w", encoding="utf-8") as handle:
            json.dump(self._data, handle, ensure_ascii=True, indent=2, default=str)
        temp_path.replace(self._path)

    def documents(self, collection_name: str):
        return self._data.setdefault(collection_name, [])


def _value_matches(left, right):
    if isinstance(left, ObjectId) or isinstance(right, ObjectId):
        return str(left) == str(right)
    return left == right


def _matches(document, query):
    for key, value in (query or {}).items():
        if key not in document or not _value_matches(document[key], value):
            return False
    return True


class _FallbackCollection:
    def __init__(self, store: _FallbackStore, collection_name: str):
        self._store = store
        self._collection_name = collection_name

    def _documents(self):
        return self._store.documents(self._collection_name)

    async def find_one(self, query):
        for document in self._documents():
            if _matches(document, query):
                return deepcopy(document)
        return None

    async def insert_one(self, document):
        stored_document = deepcopy(document)
        stored_document.setdefault("_id", str(ObjectId()))
        self._documents().append(stored_document)
        self._store.save()
        return _InsertOneResult(stored_document["_id"])

    def find(self, query=None):
        matched_documents = [deepcopy(document) for document in self._documents() if _matches(document, query or {})]
        return _AsyncCursor(matched_documents)

    async def delete_one(self, query):
        documents = self._documents()
        for index, document in enumerate(documents):
            if _matches(document, query):
                del documents[index]
                self._store.save()
                return _DeleteOneResult(1)
        return _DeleteOneResult(0)

    async def update_one(self, query, update):
        for document in self._documents():
            if _matches(document, query):
                for field, value in update.get("$set", {}).items():
                    document[field] = value
                self._store.save()
                return _UpdateOneResult(1)
        return _UpdateOneResult(0)

    async def load_all_documents(self):
        return [deepcopy(document) for document in self._documents()]


class _CursorProxy:
    def __init__(self, real_cursor, fallback_collection: _FallbackCollection):
        self._real_cursor = real_cursor
        self._fallback_collection = fallback_collection
        self._documents = None
        self._index = 0

    async def _load_documents(self):
        if self._documents is not None:
            return

        try:
            self._documents = await self._real_cursor.to_list(length=None)
        except Exception:
            self._documents = await self._fallback_collection.load_all_documents()

    def __aiter__(self):
        return self

    async def __anext__(self):
        await self._load_documents()
        if self._index >= len(self._documents):
            raise StopAsyncIteration

        document = deepcopy(self._documents[self._index])
        self._index += 1
        return document


class _FallbackDatabase:
    def __init__(self):
        self._store = _FallbackStore(FALLBACK_DB_PATH)
        self._collections = {}

    def __getitem__(self, collection_name):
        if collection_name not in self._collections:
            self._collections[collection_name] = _FallbackCollection(self._store, collection_name)
        return self._collections[collection_name]

    async def command(self, *_args, **_kwargs):
        return {"ok": 1, "mode": "fallback"}


class _CollectionProxy:
    def __init__(self, real_collection, fallback_collection):
        self._real_collection = real_collection
        self._fallback_collection = fallback_collection

    async def find_one(self, query):
        try:
            return await self._real_collection.find_one(query)
        except (PyMongoError, ServerSelectionTimeoutError, Exception):
            return await self._fallback_collection.find_one(query)

    async def insert_one(self, document):
        try:
            return await self._real_collection.insert_one(document)
        except (PyMongoError, ServerSelectionTimeoutError, Exception):
            return await self._fallback_collection.insert_one(document)

    def find(self, query=None):
        try:
            return _CursorProxy(self._real_collection.find(query or {}), self._fallback_collection)
        except (PyMongoError, ServerSelectionTimeoutError, Exception):
            return self._fallback_collection.find(query)

    async def delete_one(self, query):
        try:
            return await self._real_collection.delete_one(query)
        except (PyMongoError, ServerSelectionTimeoutError, Exception):
            return await self._fallback_collection.delete_one(query)

    async def update_one(self, query, update):
        try:
            return await self._real_collection.update_one(query, update)
        except (PyMongoError, ServerSelectionTimeoutError, Exception):
            return await self._fallback_collection.update_one(query, update)


class _DatabaseProxy:
    def __init__(self, real_database, fallback_database):
        self._real_database = real_database
        self._fallback_database = fallback_database

    def __getitem__(self, collection_name):
        return _CollectionProxy(
            self._real_database[collection_name],
            self._fallback_database[collection_name],
        )

    async def command(self, *args, **kwargs):
        try:
            return await self._real_database.command(*args, **kwargs)
        except (PyMongoError, ServerSelectionTimeoutError, Exception):
            return await self._fallback_database.command(*args, **kwargs)


client = AsyncIOMotorClient(MONGODB_URI, serverSelectionTimeoutMS=2500)
real_database = client[DATABASE_NAME]
fallback_database = _FallbackDatabase()

database = _DatabaseProxy(real_database, fallback_database)