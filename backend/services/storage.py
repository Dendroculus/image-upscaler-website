import aiofiles
from pathlib import Path
from fastapi import UploadFile, HTTPException
from core.config import MAX_FILE_SIZE_BYTES

UPLOAD_DIR = Path("uploads")
RESULT_DIR = Path("results")

UPLOAD_DIR.mkdir(exist_ok=True)
RESULT_DIR.mkdir(exist_ok=True)

class StorageService:
    @staticmethod
    async def save_upload(file: UploadFile, safe_filename: str) -> str:
        """Saves an uploaded file to the local disk in chunks to prevent memory overload."""
        file_path = UPLOAD_DIR / safe_filename
        size = 0
        
        try:
            async with aiofiles.open(file_path, 'wb') as out_file:
                while chunk := await file.read(1024 * 1024):  # 1MB chunks
                    size += len(chunk)
                    if size > MAX_FILE_SIZE_BYTES:
                        raise HTTPException(status_code=413, detail="File exceeds the 8MB limit.")
                    await out_file.write(chunk)
            
            return str(file_path)
            
        except Exception as e:
            if file_path.exists():
                file_path.unlink()
            raise e

    @staticmethod
    def get_result_path(job_id: str) -> Path:
        """Returns the path to the completed high-res image."""
        return RESULT_DIR / f"{job_id}.png"