import os
import asyncio
import aiohttp
import tempfile
import logging
import replicate
import aiofiles
from PIL import Image
from services.storage import StorageService
from typing import Optional

logger = logging.getLogger(__name__)

class AIUpscaler:
    """
    Handles the core AI image upscaling pipeline using Replicate's cloud GPUs.
    """

    def __init__(self):
        logger.info("🚀 Web AI Engine Initialized (Replicate Cloud Mode)")

    async def run_upscale(self, safe_filename: str, job_id: str) -> bool:
        """
        Orchestrates the upscaling workflow.
        """
        temp_input_path = None
        try:
            # 1. Download & Optimize the image locally
            temp_input_path = await self._prepare_local_image(safe_filename, job_id)

            # 2. Send to Replicate AI for processing
            output_url = await self._process_with_ai(temp_input_path, job_id)

            # 3. Download the finished 4K image from Replicate
            result_bytes = await self._download_ai_result(output_url, job_id)

            # 4. Upload the final result to Azure Storage
            result_filename = f"{job_id}.png"
            logger.info(f"☁️ Job #{job_id} - Uploading final result to Azure...")
            await StorageService.save_result(result_bytes, result_filename)
            
            logger.info(f"✅ Job #{job_id} Success! Cloud pipeline complete.")
            return True

        except Exception as e:
            logger.error(f"❌ Critical Error in AI Engine (Job #{job_id}): {e}")
            return False
            
        finally:
            self._cleanup_temp_file(temp_input_path)


    async def _prepare_local_image(self, safe_filename: str, job_id: str) -> str:
        """Downloads from Azure, saves to /tmp, and optimizes resolution if needed."""
        logger.info(f"📥 Job #{job_id} - Downloading raw image from Azure...")
        raw_bytes = await StorageService.get_upload_bytes(safe_filename)

        ext = safe_filename.split('.')[-1]
        temp_dir = tempfile.gettempdir()
        temp_input_path = os.path.join(temp_dir, f"{job_id}.{ext}")

        async with aiofiles.open(temp_input_path, 'wb') as temp_input:
            await temp_input.write(raw_bytes)

        # Run PIL operations in a background thread to prevent blocking
        await asyncio.to_thread(self._optimize_image_sync, temp_input_path, job_id)
        
        return temp_input_path

    def _optimize_image_sync(self, file_path: str, job_id: str):
        """Synchronous CPU-bound task to resize large images before AI processing."""
        with Image.open(file_path) as img:
            width, height = img.size
            total_pixels = width * height
            
            if total_pixels > 1_000_000:
                logger.info(f"📐 Job #{job_id} - High resolution ({width}x{height}). Optimizing to 1MP...")
                ratio = (1_000_000 / total_pixels) ** 0.5
                new_width = int(width * ratio)
                new_height = int(height * ratio)
                
                resized_img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
                if resized_img.mode in ("RGBA", "P"):
                    resized_img = resized_img.convert("RGB")
                resized_img.save(file_path)
            else:
                logger.info(f"📐 Job #{job_id} - Standard resolution. Sending directly to AI.")

    async def _process_with_ai(self, file_path: str, job_id: str) -> str:
        """Sends the local file to Replicate's API and returns the resulting URL."""
        logger.info(f" ⚒️ Job #{job_id} - Processing on Replicate GPUs (Scale: 4x)...")
        model_str = "nightmareai/real-esrgan:42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b"
        
        def call_replicate():
            with open(file_path, "rb") as img_file:
                return replicate.run(
                    model_str,
                    input={"image": img_file, "scale": 4, "face_enhance": False}
                )

        output = await asyncio.to_thread(call_replicate)
        
        # Handle Replicate's variable output formats
        return str(output[0]) if isinstance(output, list) else str(output)

    async def _download_ai_result(self, url: str, job_id: str) -> bytes:
        """Downloads the completed image payload from Replicate's temporary CDN."""
        logger.info(f"☁️ Job #{job_id} - Downloading result from Replicate...")
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as resp:
                if resp.status != 200:
                    raise ValueError(f"Failed to download result: Status {resp.status}")
                return await resp.read()

    def _cleanup_temp_file(self, file_path: Optional[str]):
        """Silently deletes the local temporary file to free up Vercel memory."""
        if file_path and os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception:
                pass

ai_upscaler = AIUpscaler()