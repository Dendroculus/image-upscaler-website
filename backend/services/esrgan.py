import os
import asyncio
import aiohttp
import tempfile
import replicate
from services.storage import StorageService

class AIUpscaler:
    def __init__(self):
        """
        Initializes the AIUpscaler for Replicate cloud processing.
        No local GPU or heavy models required.
        """
        print("🚀 Web AI Engine Initialized (Replicate Cloud Mode)")

    async def run_upscale(self, safe_filename: str, job_id: str, model_type: str = "general") -> bool:
        """
        Pipeline: 
        1. Downloads the raw image from your private Azure 'uploads' container.
        2. Sends it to Replicate's high-end GPUs for processing.
        3. Downloads the resulting 4K image from Replicate's temporary storage.
        4. Uploads the final result to your public Azure 'results' container.
        """
        temp_input_path = None
        try:
            # 1. Download raw image from Private Azure Container
            print(f"📥 Job #{job_id} - Downloading raw image from Azure...")
            raw_bytes = await StorageService.get_upload_bytes(safe_filename)

            # Create a temporary file to send to the Replicate API
            ext = safe_filename.split('.')[-1]
            with tempfile.NamedTemporaryFile(delete=False, suffix=f".{ext}") as temp_input:
                temp_input.write(raw_bytes)
                temp_input_path = temp_input.name

            # 2. Process via Replicate Cloud
            print(f" ⚒️ Job #{job_id} - Processing on Replicate GPUs...")
            
            # The official Real-ESRGAN model on Replicate
            model_str = "nightmareai/real-esrgan:42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b"
            
            def call_replicate():
                with open(temp_input_path, "rb") as img_file:
                    # Pass the file directly to the API
                    return replicate.run(
                        model_str,
                        input={
                            "image": img_file, 
                            "scale": 4, 
                            "face_enhance": False
                        }
                    )

            # Run the blocking API call in a background thread
            output = await asyncio.to_thread(call_replicate)

            # The Replicate API may return a FileOutput object, a list, or a string.
            # Handle all cases and ensure we have a plain URL string.
            if isinstance(output, list):
                output_url = str(output[0])
            else:
                output_url = str(output)

            # 3. Download the result image from Replicate's servers
            print(f"☁️ Job #{job_id} - Downloading result from Replicate...")
            async with aiohttp.ClientSession() as session:
                async with session.get(output_url) as resp:
                    if resp.status != 200:
                        raise ValueError(f"Failed to download result: Status {resp.status}")
                    result_bytes = await resp.read()

            # 4. Upload the final bytes to your Public Azure Container
            result_filename = f"{job_id}.png"
            print(f"☁️ Job #{job_id} - Uploading final 4K result to Azure...")
            await StorageService.save_result(result_bytes, result_filename)
            
            print(f"✅ Job #{job_id} Success! Cloud pipeline complete.")
            return True

        except Exception as e:
            print(f"❌ Critical Error in AI Engine (Job #{job_id}): {e}")
            return False
            
        finally:
            # Clean up the local temp file to keep your machine clean
            if temp_input_path and os.path.exists(temp_input_path):
                try:
                    os.remove(temp_input_path)
                except Exception:
                    pass

ai_upscaler = AIUpscaler()