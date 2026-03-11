import os
from dotenv import load_dotenv
from fastapi import UploadFile, HTTPException
from azure.storage.blob.aio import BlobServiceClient
from core.config import MAX_FILE_SIZE_BYTES

load_dotenv()
AZURE_CONNECTION_STRING = os.getenv("AZURE_CONNECTION_STRING")

class StorageService:
    @staticmethod
    async def save_upload(file: UploadFile, safe_filename: str) -> str:
        """Uploads the raw image directly to the private Azure 'uploads' container."""
        if not AZURE_CONNECTION_STRING:
            raise HTTPException(status_code=500, detail="Cloud storage is not configured.")
        
        file_data = await file.read()
        if len(file_data) > MAX_FILE_SIZE_BYTES:
            raise HTTPException(status_code=413, detail="File exceeds limit.")
            
        async with BlobServiceClient.from_connection_string(AZURE_CONNECTION_STRING) as client:
            blob_client = client.get_blob_client(container="uploads", blob=safe_filename)
            await blob_client.upload_blob(file_data, overwrite=True)
            return safe_filename

    @staticmethod
    async def get_upload_bytes(safe_filename: str) -> bytes:
        """Downloads the raw image from the private uploads container for the AI to process."""
        async with BlobServiceClient.from_connection_string(AZURE_CONNECTION_STRING) as client:
            blob_client = client.get_blob_client(container="uploads", blob=safe_filename)
            stream = await blob_client.download_blob()
            return await stream.readall()

    @staticmethod
    async def save_result(image_bytes: bytes, result_filename: str) -> str:
        """Uploads the AI-processed bytes to the public Azure 'results' container."""
        async with BlobServiceClient.from_connection_string(AZURE_CONNECTION_STRING) as client:
            blob_client = client.get_blob_client(container="results", blob=result_filename)
            await blob_client.upload_blob(image_bytes, overwrite=True)
            return blob_client.url

    @staticmethod
    async def check_result_exists(result_filename: str) -> bool:
        """Checks if the AI has finished uploading the result to Azure."""
        async with BlobServiceClient.from_connection_string(AZURE_CONNECTION_STRING) as client:
            blob_client = client.get_blob_client(container="results", blob=result_filename)
            return await blob_client.exists()

    @staticmethod
    def get_result_url(result_filename: str) -> str:
        """Generates the public Azure URL for the frontend."""
        parts = {k: v for k, v in (item.split("=", 1) for item in AZURE_CONNECTION_STRING.split(";") if "=" in item)}
        account_name = parts.get("AccountName")
        return f"https://{account_name}.blob.core.windows.net/results/{result_filename}"