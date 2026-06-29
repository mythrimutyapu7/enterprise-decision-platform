from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database.mongodb import database
from backend.api.auth import router as auth_router
from backend.api.incidents import router as incident_router
from backend.api.upload import router as upload_router
from backend.api.analysis import router as analysis_router
from backend.api.recommendations import router as recommendation_router
from backend.api.memory_api import router as memory_router
from backend.services.memory_service import seed_memory


app = FastAPI(
    title="Enterprise Decision Platform API",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    # allow all origins during local development to avoid CORS issues
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    # Seed high-fidelity baseline cases from JSON into MongoDB
    await seed_memory()

app.include_router(auth_router)
app.include_router(incident_router)
app.include_router(upload_router)
app.include_router(analysis_router)
app.include_router(recommendation_router)
app.include_router(memory_router)

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