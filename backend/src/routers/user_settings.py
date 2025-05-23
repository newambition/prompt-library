# backend/src/routers/user_settings.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Union

from src import schemas
from src.crud import crud_api_keys # Assuming __init__.py in crud allows this
from src.database import get_db
from src.auth_utils import verify_token # For securing endpoints

router = APIRouter(
    prefix="/user/api-keys",
    tags=["User API Keys"],
)

@router.post("", response_model=schemas.UserApiKey, status_code=status.HTTP_201_CREATED)
async def create_user_api_key_endpoint(
    api_key_data: schemas.UserApiKeyCreate,
    db: Session = Depends(get_db),
    current_user: Dict = Depends(verify_token)
):
    user_id = current_user.get("sub")
    if not user_id:
        # This case should ideally be caught by verify_token if 'sub' is mandatory
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User ID (sub) not found in token")

    try:
        db_api_key = crud_api_keys.create_user_api_key(
            db=db,
            user_id=user_id,
            llm_provider=api_key_data.llm_provider,
            api_key_plain=api_key_data.api_key_plain
        )
        # The db_api_key is a UserApiKeyDB model instance.
        # Pydantic's from_attributes (formerly orm_mode) in schemas.UserApiKey will handle conversion.
        return db_api_key
    except ValueError as ve: # Catch missing FERNET_KEY from crud
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(ve))
    except Exception as e:
        # Catch potential unique constraint violation from the database (e.g., IntegrityError)
        # Specific exception type might vary by DB (e.g., sqlalchemy.exc.IntegrityError)
        # For a generic catch here, then refine if specific DB errors need distinct handling.
        # A more specific catch for IntegrityError would be better if you import it from sqlalchemy.exc
        if "UNIQUE constraint failed" in str(e) or "duplicate key value violates unique constraint" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"An API key for user '{user_id}' and provider '{api_key_data.llm_provider}' already exists."
            )
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to create API key: {str(e)}")

@router.get("", response_model=List[schemas.UserApiKey])
async def list_user_api_keys_endpoint(
    db: Session = Depends(get_db),
    current_user: Dict = Depends(verify_token)
):
    user_id = current_user.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User ID (sub) not found in token")

    db_api_keys = crud_api_keys.get_user_api_keys(db=db, user_id=user_id)
    # Pydantic will automatically convert the list of UserApiKeyDB model instances
    # to a list of UserApiKey schema instances.
    return db_api_keys

@router.put("/{llm_provider}", response_model=schemas.UserApiKey)
async def update_user_api_key_endpoint(
    llm_provider: str,
    api_key_update_data: schemas.UserApiKeyUpdate,
    db: Session = Depends(get_db),
    current_user: Dict = Depends(verify_token)
):
    user_id = current_user.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User ID (sub) not found in token")

    try:
        updated_db_api_key = crud_api_keys.update_user_api_key(
            db=db,
            user_id=user_id,
            llm_provider=llm_provider, # llm_provider from path
            new_api_key_plain=api_key_update_data.new_api_key_plain
        )
        if updated_db_api_key is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"API key for provider '{llm_provider}' not found for this user."
            )
        return updated_db_api_key
    except ValueError as ve: # Catch missing FERNET_KEY
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(ve))
    except Exception as e:
        # Generic catch for other unexpected errors
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to update API key: {str(e)}")

@router.delete("/{key_identifier}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_api_key_endpoint(
    key_identifier: str, # Will be string from path, try to convert to int if possible
    db: Session = Depends(get_db),
    current_user: Dict = Depends(verify_token)
):
    user_id = current_user.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User ID (sub) not found in token")

    identifier_to_use: Union[str, int]
    try:
        identifier_to_use = int(key_identifier)
    except ValueError:
        identifier_to_use = key_identifier # It's not an int, so treat as string (llm_provider)

    try:
        deleted_successfully = crud_api_keys.delete_user_api_key(
            db=db,
            user_id=user_id,
            llm_provider_or_key_id=identifier_to_use
        )
        if not deleted_successfully:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"API key with identifier '{key_identifier}' not found for this user or could not be deleted."
            )
        # No content to return for 204
        return
    except ValueError as ve: # Catch missing FERNET_KEY from underlying CRUD (if any operation needs it)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to delete API key: {str(e)}")

# Other endpoints will follow 