import uuid
import logging
from typing import Tuple
from fastapi import HTTPException, UploadFile, status
from PIL import Image, UnidentifiedImageError

# Setup logger for security events
logger = logging.getLogger(__name__)

ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"]

# Security Limits
MAX_FILE_SIZE_MB = 10
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

MAX_MEGAPIXELS = 3 
MAX_PIXELS = MAX_MEGAPIXELS * 1_000_000 

def validate_and_sanitize_upload(file: UploadFile) -> Tuple[str, str]:
    """
    Validates the file type, size, and resolution (Megapixels), 
    and generates a secure, randomized filename.
    """
    # 1. Validate MIME type
    if file.content_type not in ALLOWED_MIME_TYPES:
        logger.warning(f"Security: Rejected invalid MIME type: {file.content_type}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Invalid file type. Only JPG, PNG, and WEBP are allowed."
        )
    
    # 2. Validate File Size (MB)
    if file.size and file.size > MAX_FILE_SIZE_BYTES:
        logger.warning(f"Security: Rejected large file: {file.size} bytes")
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Maximum allowed file size is {MAX_FILE_SIZE_MB}MB."
        )

    # 3. Validate Resolution (Megapixels) to protect GPU VRAM
    try:
        # Open the image to check dimensions without fully loading it into memory
        with Image.open(file.file) as img:
            width, height = img.size
            total_pixels = width * height
            
            if total_pixels > MAX_PIXELS:
                logger.warning(f"Security: Rejected high-resolution image: {width}x{height} ({total_pixels} pixels)")
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail=f"Image resolution too high. Maximum allowed is {MAX_MEGAPIXELS} Megapixels."
                )
    except UnidentifiedImageError:
        logger.warning("Security: Uploaded file is not a valid image.")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is corrupted or not a valid image."
        )
    finally:
        file.file.seek(0)
    
    ext = file.content_type.split("/")[1]
    if ext == "jpeg":
        ext = "jpg"
        
    job_id = uuid.uuid4().hex
    safe_filename = f"{job_id}.{ext}"
    
    return job_id, safe_filename