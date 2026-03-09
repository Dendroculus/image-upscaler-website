import uuid
from typing import Tuple
from fastapi import HTTPException, UploadFile

ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"]


def validate_and_sanitize_upload(file: UploadFile) -> Tuple[str, str]:
    """
    Validates the file type and generates a secure, randomized filename.
    Returns a tuple of (job_id, safe_filename).
    """
    # 1. Validate MIME type
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid file type: {file.content_type}. Only JPG, PNG, and WEBP are allowed."
        )
    
    # 2. Extract extension safely (don't trust the user's filename)
    ext = file.content_type.split("/")[1]
    if ext == "jpeg":
        ext = "jpg"
        
    # 3. Generate secure UUID for path traversal prevention
    job_id = uuid.uuid4().hex
    safe_filename = f"{job_id}.{ext}"
    
    return job_id, safe_filename