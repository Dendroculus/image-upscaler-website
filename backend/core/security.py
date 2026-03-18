import uuid
import logging
from typing import Tuple
from fastapi import HTTPException, UploadFile, status
from PIL import Image, UnidentifiedImageError
from core.config import MAX_FILE_SIZE_MB, MAX_FILE_SIZE_BYTES, MAX_MEGAPIXELS, MAX_PIXELS

logger = logging.getLogger(__name__)

ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"]

def _validate_mime_and_size(file: UploadFile) -> None:
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Invalid file type. Only JPG, PNG, and WEBP are allowed."
        )
    
    if file.size and file.size > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Maximum allowed file size is {MAX_FILE_SIZE_MB}MB."
        )

def _validate_image_resolution(file: UploadFile) -> None:
    try:
        with Image.open(file.file) as img:
            width, height = img.size
            total_pixels = width * height
            
            if total_pixels > MAX_PIXELS:
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail=f"Image resolution too high. Maximum allowed is {MAX_MEGAPIXELS} Megapixels."
                )
    except UnidentifiedImageError:
        logger.warning("Security: Blocked fake or corrupted image.")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Are you trying to attack the web? Well that's unfortunate 😝"
        )
    finally:
        file.file.seek(0)

def _generate_secure_filename(content_type: str) -> Tuple[str, str]:
    ext = content_type.split("/")[1]
    if ext == "jpeg":
        ext = "jpg"
        
    job_id = uuid.uuid4().hex
    safe_filename = f"{job_id}.{ext}"
    return job_id, safe_filename

def validate_and_sanitize_upload(file: UploadFile) -> Tuple[str, str]:
    _validate_mime_and_size(file)
    _validate_image_resolution(file)
    return _generate_secure_filename(file.content_type)