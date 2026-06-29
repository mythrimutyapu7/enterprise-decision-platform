import os
import shutil
from backend.database.mongodb import database
from datetime import datetime
files_collection = database["incident_files"]

UPLOAD_FOLDER = "uploads"


async def upload_file(file):
    try:
        # Create uploads folder if it doesn't exist
        if not os.path.exists(UPLOAD_FOLDER):
            os.makedirs(UPLOAD_FOLDER)

        file_path = os.path.join(UPLOAD_FOLDER, file.filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        file_data = {
            "filename": file.filename,
            "file_path": file_path,
            "uploaded_at": datetime.utcnow()
        }

        result = await files_collection.insert_one(file_data)

        return {
            "success": True,
            "message": "File Uploaded Successfully",
            "id": str(result.inserted_id),
            "filename": file.filename
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }