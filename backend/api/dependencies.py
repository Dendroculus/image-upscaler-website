from fastapi import Form, HTTPException
from core.model_registry import ModelRegistry

def valid_model_type(model_type: str = Form("general")) -> str:
    """
    Dependency to ensure the user requested a valid model type 
    before the request ever reaches the route.
    """
    valid_models = ModelRegistry.list_models()
    if model_type not in valid_models:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid model type. Choose from: {', '.join(valid_models)}"
        )
    return model_type