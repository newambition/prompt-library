from sqlalchemy.orm import Session
from cryptography.fernet import Fernet
import datetime

from src.models import UserApiKeyDB
from src.config import settings

def _get_fernet_instance():
    if not settings.FERNET_KEY:
        raise ValueError("FERNET_KEY is not configured. Cannot perform encryption/decryption.")
    return Fernet(settings.FERNET_KEY.encode()) # Ensure key is bytes

def _mask_api_key(api_key: str) -> str:
    """Masks an API key, showing only the first few and last few characters."""
    if len(api_key) <= 8: # If key is too short, don't mask heavily or at all
        return api_key[:1] + "****" + api_key[-1:] if len(api_key) > 2 else "******"
    return f"{api_key[:4]}...{api_key[-4:]}"

def create_user_api_key(db: Session, user_id: str, llm_provider: str, api_key_plain: str) -> UserApiKeyDB:
    """
    Creates a new API key entry for a user, encrypting the key before storage.
    Returns the database object.
    """
    fernet = _get_fernet_instance()
    encrypted_key = fernet.encrypt(api_key_plain.encode())
    masked_key = _mask_api_key(api_key_plain)

    db_api_key = UserApiKeyDB(
        user_id=user_id,
        llm_provider=llm_provider.lower(), # Store provider as lowercase for consistency
        encrypted_api_key=encrypted_key,
        masked_api_key=masked_key,
        # created_at and updated_at are handled by server_default
    )
    db.add(db_api_key)
    db.commit()
    db.refresh(db_api_key)
    return db_api_key

def get_user_api_keys(db: Session, user_id: str) -> list[UserApiKeyDB]:
    """
    Retrieves all API key entries for a given user.
    The returned objects will contain the masked_api_key, not the encrypted one directly for list views.
    """
    return db.query(UserApiKeyDB).filter(UserApiKeyDB.user_id == user_id).all()

def get_decrypted_api_key(db: Session, user_id: str, llm_provider: str) -> str | None:
    """
    Retrieves and decrypts a specific API key for a user and provider.
    Returns the plain text API key or None if not found.
    """
    db_api_key = db.query(UserApiKeyDB).filter(
        UserApiKeyDB.user_id == user_id,
        UserApiKeyDB.llm_provider == llm_provider.lower()
    ).first()

    if db_api_key:
        fernet = _get_fernet_instance()
        decrypted_key = fernet.decrypt(db_api_key.encrypted_api_key).decode()
        return decrypted_key
    return None

def update_user_api_key(db: Session, user_id: str, llm_provider: str, new_api_key_plain: str) -> UserApiKeyDB | None:
    """
    Updates an existing API key for a user and provider.
    Encrypts the new key before storage.
    Returns the updated database object or None if not found.
    """
    db_api_key = db.query(UserApiKeyDB).filter(
        UserApiKeyDB.user_id == user_id,
        UserApiKeyDB.llm_provider == llm_provider.lower()
    ).first()

    if db_api_key:
        fernet = _get_fernet_instance()
        db_api_key.encrypted_api_key = fernet.encrypt(new_api_key_plain.encode())
        db_api_key.masked_api_key = _mask_api_key(new_api_key_plain)
        db_api_key.updated_at = datetime.datetime.now(datetime.timezone.utc) # Explicitly set timestamp
        db.commit()
        db.refresh(db_api_key)
        return db_api_key
    return None

def delete_user_api_key(db: Session, user_id: str, llm_provider_or_key_id: str | int) -> bool:
    """
    Deletes an API key for a user, identified by llm_provider (str) or the key's database ID (int).
    Returns True if deletion was successful, False otherwise.
    """
    query = db.query(UserApiKeyDB).filter(UserApiKeyDB.user_id == user_id)
    
    if isinstance(llm_provider_or_key_id, int):
        # If it's an integer, assume it's the ID
        db_api_key = query.filter(UserApiKeyDB.id == llm_provider_or_key_id).first()
    elif isinstance(llm_provider_or_key_id, str):
        # If it's a string, assume it's the llm_provider
        db_api_key = query.filter(UserApiKeyDB.llm_provider == llm_provider_or_key_id.lower()).first()
    else:
        return False # Invalid type for identifier

    if db_api_key:
        db.delete(db_api_key)
        db.commit()
        return True
    return False 