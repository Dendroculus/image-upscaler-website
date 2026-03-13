from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


from api.routes import router as api_router 

app = FastAPI(
    title="AI Image Upscaler API",
    description="Production-ready FastAPI backend for Real-ESRGAN",
    version="1.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # In production, change this to your actual Vercel/Netlify URL
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

app.include_router(api_router)