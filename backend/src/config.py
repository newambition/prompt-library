# backend/src/config.py
import os
from dotenv import load_dotenv
from pathlib import Path

# Determine the base directory of the backend project
backend_dir = Path(__file__).resolve().parent.parent
env_path = backend_dir / ".env"

load_dotenv(dotenv_path=env_path)

class Settings:
    # GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "") # Removed, no longer used by playground
    FERNET_KEY: str = os.getenv("FERNET_KEY", "") # Key for encrypting/decrypting user API keys
    
    # Auth0 settings
    AUTH0_DOMAIN: str = os.getenv("AUTH0_DOMAIN", "")
    AUTH0_API_AUDIENCE: str = os.getenv("AUTH0_API_AUDIENCE", "")

    # Ensure critical Auth0 settings are loaded
    if not AUTH0_DOMAIN:
        print("Warning: AUTH0_DOMAIN is not set in .env file.")
    if not AUTH0_API_AUDIENCE:
        print("Warning: AUTH0_API_AUDIENCE is not set in .env file.")
    
    if not FERNET_KEY:
        print("CRITICAL WARNING: FERNET_KEY is not set in .env file. API key encryption will fail.")

    # ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development") # Removed, no longer used by playground override


settings = Settings()
