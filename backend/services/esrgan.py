import os
import asyncio
import aiohttp
import tempfile
import logging
import replicate
from PIL import Image
from services.storage import StorageService

logger = logging.getLogger(__name__)

class AIUpscaler:
    """
    Handles the core AI image upscaling pipeline using Replicate's cloud GPUs.
    """

    def __init__(self):
        logger.info("🚀 Web AI Engine Initialized (Replicate Cloud Mode)")

    async def run_upscale(self, safe_filename: str, job_id: str, model_type: str = "general") -> bool:
        """
        Executes the upscaling workflow:
        1. Downloads the source image from Azure storage.
        2. Pre-optimizes the image if it exceeds 1 Megapixel to prevent GPU out-of-memory crashes.
        3. Dispatches the processing job to Replicate's API.
        4. Retrieves the upscaled image and uploads it back to Azure.
        """
        temp_input_path = None
        try:
            logger.info(f"📥 Job #{job_id} - Downloading raw image from Azure...")
            raw_bytes = await StorageService.get_upload_bytes(safe_filename)

            ext = safe_filename.split('.')[-1]
            with tempfile.NamedTemporaryFile(delete=False, suffix=f".{ext}") as temp_input:
                temp_input.write(raw_bytes)
                temp_input_path = temp_input.name

            with Image.open(temp_input_path) as img:
                width, height = img.size
                total_pixels = width * height
                
                if total_pixels > 1_000_000:
                    logger.info(f"📐 Job #{job_id} - High resolution ({width}x{height}). Optimizing to 1MP before AI...")
                    ratio = (1_000_000 / total_pixels) ** 0.5
                    new_width = int(width * ratio)
                    new_height = int(height * ratio)
                    
                    resized_img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
                    if resized_img.mode in ("RGBA", "P"):
                        resized_img = resized_img.convert("RGB")
                    resized_img.save(temp_input_path)
                else:
                    logger.info(f"📐 Job #{job_id} - Standard resolution. Sending directly to AI.")

            logger.info(f" ⚒️ Job #{job_id} - Processing on Replicate GPUs (Scale: 4x)...")
            model_str = "nightmareai/real-esrgan:42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b"
            
            def call_replicate():
                with open(temp_input_path, "rb") as img_file:
                    return replicate.run(
                        model_str,
                        input={
                            "image": img_file, 
                            "scale": 4, 
                            "face_enhance": False
                        }
                    )

            output = await asyncio.to_thread(call_replicate)

            if isinstance(output, list):
                output_url = str(output[0])
            else:
                output_url = str(output)

            logger.info(f"☁️ Job #{job_id} - Downloading result from Replicate...")
            async with aiohttp.ClientSession() as session:
                async with session.get(output_url) as resp:
                    if resp.status != 200:
                        raise ValueError(f"Failed to download result: Status {resp.status}")
                    result_bytes = await resp.read()

            result_filename = f"{job_id}.png"
            logger.info(f"☁️ Job #{job_id} - Uploading final result to Azure...")
            await StorageService.save_result(result_bytes, result_filename)
            
            logger.info(f"✅ Job #{job_id} Success! Cloud pipeline complete.")
            return True

        except Exception as e:
            logger.error(f"❌ Critical Error in AI Engine (Job #{job_id}): {e}")
            return False
            
        finally:
            if temp_input_path and os.path.exists(temp_input_path):
                try:
                    os.remove(temp_input_path)
                except Exception:
                    pass

ai_upscaler = AIUpscaler()