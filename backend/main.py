from fastapi import FastAPI
from database.mongodb import database

app = FastAPI(
    title="Enterprise Decision Platform API",
    version="1.0.0"
)


@app.get("/")
async def root():
    return {
        "message": "Backend Running Successfully"
    }


@app.get("/health")
async def health():
    try:
        await database.command("ping")
        return {
            "status": "MongoDB Connected Successfully"
        }
    except Exception as e:
        return {
            "status": "Connection Failed",
            "error": str(e)
        }