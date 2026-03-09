import os
import cv2
import asyncio
import numpy as np
import torch
import gc
from PIL import Image
from pathlib import Path

from basicsr.archs.rrdbnet_arch import RRDBNet
from realesrgan import RealESRGANer

from core.config import MAX_IMAGE_DIMENSION
from core.model_registry import ModelRegistry

RESULT_DIR = Path("results")

class AIUpscaler:
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.use_half = True if self.device.type == "cuda" else False
        self._engines = {}
        print(f"🚀 Web AI Engine Initialized on: {self.device}")

    def _load_engine(self, model_type: str) -> RealESRGANer:
        arch_config = ModelRegistry.get_arch(model_type)
        path = ModelRegistry.get_path(model_type)
        
        model = RRDBNet(**arch_config)

        if not os.path.exists(path):
            raise FileNotFoundError(f"Model file missing: {path}")

        engine = RealESRGANer(
            scale=4,
            model_path=path,
            model=model,
            tile=0,
            tile_pad=10,
            pre_pad=0,
            half=self.use_half,
            device=self.device,
        )
        self._engines[model_type] = engine
        return engine

    def _get_engine(self, model_type: str) -> RealESRGANer:
        if model_type not in self._engines:
            self._load_engine(model_type)
        return self._engines[model_type]

    def _load_and_preprocess(self, input_path: str, job_id: str) -> np.ndarray:
        # Adapted to read directly from the local disk
        with Image.open(input_path) as pil_img:
            width, height = pil_img.size
            
            if width > MAX_IMAGE_DIMENSION or height > MAX_IMAGE_DIMENSION:
                print(f"⚠️ Job #{job_id} - Huge Image ({width}x{height}). Resizing...")
                pil_img.thumbnail((MAX_IMAGE_DIMENSION, MAX_IMAGE_DIMENSION), Image.Resampling.LANCZOS)
            
            if pil_img.mode != 'RGB':
                pil_img = pil_img.convert('RGB')
            
            img = np.array(pil_img)
            return cv2.cvtColor(img, cv2.COLOR_RGB2BGR)

    def _run_inference(self, img: np.ndarray, model_type: str, job_id: str) -> np.ndarray:
        height, width = img.shape[:2]
        tile_size = 192 if (height > 600 or width > 600) else 0

        upsampler = self._get_engine(model_type)
        upsampler.tile = tile_size
        
        upsampler.model.to(self.device)
        if self.use_half:
            upsampler.model.half()
        upsampler.half = self.use_half

        print(f" ⚒️ Job #{job_id} - Processing ({model_type}) [Size: {width}x{height}] [Tile: {tile_size}]...")
        
        output_img, _ = upsampler.enhance(img, outscale=4)
        return output_img

    def _cleanup_resources(self):
        if self.device.type == "cuda":
            torch.cuda.empty_cache()
            gc.collect()

    async def run_upscale(self, input_path: str, job_id: str, model_type: str = "general") -> bool:
        """
        Orchestrates the local upscaling pipeline asynchronously.
        Reads from uploads/, processes, and saves directly to results/.
        """
        try:
            self._cleanup_resources()

            # 1. Load and preprocess from local disk
            img_array = await asyncio.to_thread(self._load_and_preprocess, input_path, job_id)
            
            # 2. Run inference
            output_img = await asyncio.to_thread(self._run_inference, img_array, model_type, job_id)
            
            # 3. Save directly to results folder
            output_filename = f"{job_id}.png"
            output_path = RESULT_DIR / output_filename
            cv2.imwrite(str(output_path), output_img)
            
            print(f"✅ Job #{job_id} Success! Saved to {output_path}")
            return True

        except Exception as e:
            print(f"❌ Critical Error in AI Engine (Job #{job_id}): {e}")
            return False
        
        finally:
            self._cleanup_resources()

# Instantiate a global instance to be used by the FastAPI router
ai_upscaler = AIUpscaler()