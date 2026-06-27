from fastapi import APIRouter, UploadFile, File
from backend.services.upload_service import upload_file

router = APIRouter(
    prefix="/incidents",
    tags=["File Upload"]
)


@router.post("/upload")
async def upload(file: UploadFile = File(...)):
    return await upload_file(file)