from fastapi import APIRouter, UploadFile, File, Depends, BackgroundTasks, HTTPException

from core.security import validate_and_sanitize_upload
from services.storage import StorageService
from services.esrgan import ai_upscaler
from api.dependencies import valid_model_type

router = APIRouter(prefix="/api", tags=["upscale"])

async def process_image_task(job_id: str, safe_filename: str, model_type: str):
    print(f"🚀 Background task started for Job {job_id} [{model_type}]")
    # We now pass the Azure filename instead of a local file path
    success = await ai_upscaler.run_upscale(safe_filename=safe_filename, job_id=job_id, model_type=model_type)
    if not success:
        print(f"❌ Background task failed for Job {job_id}")

@router.post("/upscale")
async def upload_image(
    background_tasks: BackgroundTasks, 
    file: UploadFile = File(...),
    model_type: str = Depends(valid_model_type)
):
    job_id, safe_filename = validate_and_sanitize_upload(file)
    
    await StorageService.save_upload(file, safe_filename)
    
    background_tasks.add_task(process_image_task, job_id, safe_filename, model_type)
    
    return {"message": "Upload successful, processing started", "job_id": job_id}

@router.get("/result/{job_id}")
async def get_result(job_id: str):
    """Poll endpoint. Returns the Azure URL once finished."""
    result_filename = f"{job_id}.png"
    
    # Check Azure to see if the AI finished uploading it
    exists = await StorageService.check_result_exists(result_filename)
    
    if exists:
        url = StorageService.get_result_url(result_filename)
        # Return simple JSON instead of a Redirect
        return {"status": "ready", "url": url}
    
    raise HTTPException(status_code=404, detail="Result not found or still processing")