import os
import logging
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router as api_router 

LOG_DIR = Path(os.path.dirname(__file__)) / "logs"
LOG_DIR.mkdir(parents=True, exist_ok=True) # Create if not exists else ignore

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler(LOG_DIR / "upscaler_backend.log", encoding="utf-8"),  
        logging.StreamHandler()                         
    ]
)

app = FastAPI(
    title="AI Image Upscaler API",
    description="Production-ready FastAPI backend for Real-ESRGAN",
    version="1.1.0"
)

allowed_origins_str = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000, http://localhost:5173")
origins = [origin.strip() for origin in allowed_origins_str.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],  
    allow_headers=["*"],  
)

@app.get("/", tags=["Health Check"])
async def root():
    return {
        "status": "online",
        "message": "AI Upscaler API is running",
        "docs": "/docs"
    }

app.include_router(api_router)