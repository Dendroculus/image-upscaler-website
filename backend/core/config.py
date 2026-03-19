import json
import os

def load_config():
    """
    Configuration loader that reads settings from a JSON file. This allows for easy adjustments to parameters like maximum file size, megapixels, and image dimensions without modifying the codebase. The configuration file is expected to be located in the parent directory of this script and named "app_config.json". If the file is missing or contains invalid JSON, a RuntimeError will be raised with an appropriate message.
    """
    
    config_path = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "..", "app_config.json")
    )

    try:
        with open(config_path, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        raise RuntimeError(f"Config file not found: {config_path}")
    except json.JSONDecodeError:
        raise RuntimeError("Invalid JSON in config file")


CONFIG = load_config()

MAX_FILE_SIZE_MB = CONFIG["MAX_FILE_SIZE_MB"]
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

MAX_MEGAPIXELS = CONFIG["MAX_MEGAPIXELS"]
MAX_PIXELS = MAX_MEGAPIXELS * 1_000_000

MAX_IMAGE_DIMENSION = CONFIG["MAX_IMAGE_DIMENSION"]

ALLOWED_EXTENSIONS = CONFIG.get("ALLOWED_EXTENSIONS", [])
ALLOWED_MIME_TYPES = [f"image/{ext}" for ext in ALLOWED_EXTENSIONS if ext != "jpg"] 