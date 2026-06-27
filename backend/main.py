from fastapi import FastAPI
from database.mongodb import database
from api.auth import router as auth_router
from api.incidents import router as incident_router
from api.upload import router as upload_router
from api.analysis import router as analysis_router
from api.recommendations import router as recommendation_router


app = FastAPI(
    title="Enterprise Decision Platform API",
    version="1.0.0"
)

app.include_router(auth_router)
app.include_router(incident_router)
app.include_router(upload_router)
app.include_router(analysis_router)
app.include_router(recommendation_router)

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