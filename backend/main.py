import uuid
import aiofiles
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# Initialize the FastAPI application
app = FastAPI(
    title="AI Image Upscaler API",
    description="Backend for Real-ESRGAN image processing",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Your Vite React URL
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

# Ensure our upload and result directories exist
UPLOAD_DIR = Path("uploads")
RESULT_DIR = Path("results")
UPLOAD_DIR.mkdir(exist_ok=True)
RESULT_DIR.mkdir(exist_ok=True)

ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]
MAX_SIZE = 5 * 1024 * 1024 # 5MB Limit

@app.get("/")
async def root():
    return {"status": "success", "message": "FastAPI backend is running!"}

@app.post("/api/upscale")
async def upload_image(file: UploadFile = File(...)):
    # 1. Validate File Type (Security: Prevent malicious scripts)
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Invalid file type. Only JPG, PNG, WEBP allowed.")
    
    # 2. Secure Naming (Security: Prevent Path Traversal by ignoring user's filename)
    ext = file.content_type.split("/")[1]
    job_id = uuid.uuid4().hex
    safe_filename = f"{job_id}.{ext}"
    file_path = UPLOAD_DIR / safe_filename
    
    # 3. Save File Securely in Chunks (Security: Prevent extremely large file OOM attacks)
    size = 0
    async with aiofiles.open(file_path, 'wb') as out_file:
        while chunk := await file.read(1024 * 1024): # Read in 1MB chunks
            size += len(chunk)
            if size > MAX_SIZE:
                file_path.unlink(missing_ok=True) # Delete the partial file
                raise HTTPException(status_code=413, detail="File too large. Maximum size is 5MB.")
            await out_file.write(chunk)
    
    # In the future, this is where we will trigger Real-ESRGAN.
    # For now, we just return the job_id to prove the upload worked.
    return {"message": "Upload successful", "job_id": job_id}