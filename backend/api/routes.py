import logging
from fastapi import APIRouter, UploadFile, File, Depends, BackgroundTasks, HTTPException, status

from core.security import validate_and_sanitize_upload
from services.storage import StorageService
from services.esrgan import ai_upscaler
from api.dependencies import valid_model_type

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["upscale"])

failed_jobs = set()

async def process_image_task(job_id: str, safe_filename: str, model_type: str):
    """
    Background task to process the uploaded image using the AI upscaler.
    """
    logger.info(f"🚀 Background task started for Job {job_id} [{model_type}]")
    try:
        success = await ai_upscaler.run_upscale(safe_filename=safe_filename, job_id=job_id, model_type=model_type)
        if not success:
            logger.error(f"❌ Background task failed for Job {job_id}")
            failed_jobs.add(job_id)
    except Exception as e:
        logger.error(f"❌ Exception in background task for Job {job_id}: {str(e)}")
        failed_jobs.add(job_id) 

@router.post(
    "/upscale", 
    status_code=status.HTTP_202_ACCEPTED,
    summary="Upload an image for upscaling",
    response_description="Returns the job ID for tracking the upscale process"
)
async def upload_image(
    background_tasks: BackgroundTasks, 
    file: UploadFile = File(...),
    model_type: str = Depends(valid_model_type)
):
    try:
        job_id, safe_filename = validate_and_sanitize_upload(file)
        await StorageService.save_upload(file, safe_filename)
    except ValueError as ve:
        logger.warning(f"Validation error on upload: {str(ve)}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        logger.error(f"Upload handling failed: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to process upload")
    
    background_tasks.add_task(process_image_task, job_id, safe_filename, model_type)
    
    return {"message": "Upload successful, processing started", "job_id": job_id}

@router.get(
    "/result/{job_id}",
    summary="Check upscaling result",
    response_description="Returns the status of the job and the URL if ready"
)
async def get_result(job_id: str):
    if not job_id or not job_id.isalnum():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid job ID")

    if job_id in failed_jobs:
        return {"status": "failed", "message": "AI processing failed or ran out of memory."}

    result_filename = f"{job_id}.png"
    
    try:
        exists = await StorageService.check_result_exists(result_filename)
        
        if exists:
            failed_jobs.discard(job_id)
            url = StorageService.get_result_url(result_filename)
            return {"status": "ready", "url": url}
        
        return {"status": "processing"}
    except Exception as e:
        logger.error(f"Error checking result for job {job_id}: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error retrieving job status")