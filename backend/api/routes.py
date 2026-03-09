from fastapi import APIRouter, UploadFile, File, Depends, BackgroundTasks, HTTPException
from fastapi.responses import FileResponse

from core.security import validate_and_sanitize_upload
from services.storage import StorageService
from services.esrgan import ai_upscaler
from api.dependencies import valid_model_type

router = APIRouter(prefix="/api", tags=["upscale"])

async def process_image_task(job_id: str, file_path: str, model_type: str):
    """Background task orchestrator."""
    print(f"🚀 Background task started for Job {job_id} [{model_type}]")
    success = await ai_upscaler.run_upscale(input_path=file_path, job_id=job_id, model_type=model_type)
    if not success:
        print(f"❌ Background task failed for Job {job_id}")

@router.post("/upscale")
async def upload_image(
    background_tasks: BackgroundTasks, 
    file: UploadFile = File(...),
    model_type: str = Depends(valid_model_type)
):
    # 1. Security Check & Sanitization
    job_id, safe_filename = validate_and_sanitize_upload(file)
    
    # 2. Secure Storage Save
    file_path = await StorageService.save_upload(file, safe_filename)
    
    # 3. Dispatch to GPU Queue
    background_tasks.add_task(process_image_task, job_id, file_path, model_type)
    
    return {"message": "Upload successful, processing started", "job_id": job_id}

@router.get("/result/{job_id}")
async def get_result(job_id: str):
    """Poll endpoint for the frontend to fetch the completed image."""
    result_path = StorageService.get_result_path(job_id)
    
    if result_path.exists():
        return FileResponse(result_path)
    
    raise HTTPException(status_code=404, detail="Result not found or still processing")