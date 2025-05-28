# backend/src/main.py
from fastapi import FastAPI, HTTPException, status, Body, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict # Added Dict
from sqlalchemy.orm import Session

from src import schemas, crud, models
from src.database import get_db
from src.config import settings
from src.llm_services import get_llm_response # New import
from src.auth_utils import verify_token # Import the new dependency

# Import the new router
from src.routers import user_settings_router

app = FastAPI(
    title="Prompt Library API",
    description="API for managing prompts, versions, notes, tags, and testing with LLMs.",
    version="0.5.0", # Incremented version
)

origins = [
    "http://localhost", "http://localhost:3000", "http://localhost:5173",
]
app.add_middleware(
    CORSMiddleware, allow_origins=origins, allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"],
)

@app.get("/", tags=["Root"])
async def read_root():
    return {"message": "Welcome to the Prompt Library API!"}

# Include the user settings router
app.include_router(user_settings_router)

# -- Prompt Endpoints --
@app.get("/prompts", response_model=schemas.PromptListResponse, tags=["Prompts"])
async def read_prompts(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db),
    current_user: Dict = Depends(verify_token)
):
    user_id = current_user.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User ID not found in token")
    
    db_prompts = crud.get_prompts(db, user_id=user_id, skip=skip, limit=limit)
    schema_prompts = [crud._map_prompt_db_to_schema(p) for p in db_prompts]
    return schemas.PromptListResponse(prompts=schema_prompts)

@app.post("/prompts", response_model=schemas.Prompt, status_code=status.HTTP_201_CREATED, tags=["Prompts"])
async def create_prompt(
    prompt: schemas.PromptCreate, db: Session = Depends(get_db),
    current_user: Dict = Depends(verify_token)
):
    user_id = current_user.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User ID not found in token")
    
    db_prompt = crud.create_db_prompt(db=db, prompt_data=prompt, user_id=user_id)
    return crud._map_prompt_db_to_schema(db_prompt)

@app.get("/prompts/{prompt_id}", response_model=schemas.Prompt, tags=["Prompts"])
async def read_prompt(
    prompt_id: str, db: Session = Depends(get_db),
    current_user: Dict = Depends(verify_token)
):
    user_id = current_user.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User ID not found in token")
    
    db_prompt = crud.get_prompt_by_prompt_id(db, prompt_id=prompt_id, user_id=user_id)
    if db_prompt is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prompt not found")
    return crud._map_prompt_db_to_schema(db_prompt)

@app.delete("/prompts/{prompt_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Prompts"])
async def delete_prompt(
    prompt_id: str, db: Session = Depends(get_db),
    current_user: Dict = Depends(verify_token)
):
    user_id = current_user.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User ID not found in token")
    
    success = crud.delete_db_prompt(db, prompt_id=prompt_id, user_id=user_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prompt not found")

@app.put("/prompts/{prompt_id}", response_model=schemas.Prompt, tags=["Prompts"])
async def update_prompt(
    prompt_id: str, prompt_update: schemas.PromptUpdate, db: Session = Depends(get_db),
    current_user: Dict = Depends(verify_token)
):
    user_id = current_user.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User ID not found in token")
    
    db_prompt = crud.update_db_prompt(db, prompt_id=prompt_id, user_id=user_id, update_data=prompt_update)
    if db_prompt is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prompt not found")
    return crud._map_prompt_db_to_schema(db_prompt)

# -- Version Endpoints --
@app.post("/prompts/{prompt_id}/versions", response_model=schemas.Version, status_code=status.HTTP_201_CREATED, tags=["Versions"])
async def create_version(
    prompt_id: str, version: schemas.VersionCreate, db: Session = Depends(get_db),
    current_user: Dict = Depends(verify_token)
):
    user_id = current_user.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User ID not found in token")
    
    db_version = crud.create_db_version(db=db, prompt_id=prompt_id, user_id=user_id, version_data=version)
    if db_version is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prompt not found")
    
    return schemas.Version(
        id=db_version.id,
        version_id=db_version.version_id_str,
        text=db_version.text,
        notes=db_version.notes,
        date=db_version.created_at.isoformat() if db_version.created_at else crud.get_current_date_str(),
        llm_provider=db_version.llm_provider,
        model_id_used=db_version.model_id_used
    )

@app.put("/prompts/{prompt_id}/versions/{version_id}/notes", response_model=schemas.Version, tags=["Versions"])
async def update_version_notes(
    prompt_id: str, version_id: str, note_update: schemas.NoteUpdate, db: Session = Depends(get_db),
    current_user: Dict = Depends(verify_token)
):
    user_id = current_user.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User ID not found in token")
    
    db_version = crud.update_db_version_notes(db, prompt_id=prompt_id, user_id=user_id, version_id_str=version_id, notes=note_update.notes)
    if db_version is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prompt or version not found")
    
    return schemas.Version(
        id=db_version.id,
        version_id=db_version.version_id_str,
        text=db_version.text,
        notes=db_version.notes,
        date=db_version.created_at.isoformat() if db_version.created_at else crud.get_current_date_str(),
        llm_provider=db_version.llm_provider,
        model_id_used=db_version.model_id_used
    )

# -- Tag Endpoints --
@app.post("/prompts/{prompt_id}/tags", response_model=schemas.Prompt, tags=["Tags"])
async def add_tag(
    prompt_id: str, tag: schemas.SingleTagAdd, db: Session = Depends(get_db),
    current_user: Dict = Depends(verify_token)
):
    user_id = current_user.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User ID not found in token")
    
    db_prompt = crud.add_db_tag(db, prompt_id=prompt_id, user_id=user_id, tag_create_data=tag)
    if db_prompt is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prompt not found")
    return crud._map_prompt_db_to_schema(db_prompt)

@app.delete("/prompts/{prompt_id}/tags/{tag_name}", response_model=schemas.Prompt, tags=["Tags"])
async def remove_tag(
    prompt_id: str, tag_name: str, db: Session = Depends(get_db),
    current_user: Dict = Depends(verify_token)
):
    user_id = current_user.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User ID not found in token")
    
    db_prompt = crud.remove_db_tag(db, prompt_id=prompt_id, user_id=user_id, tag_name=tag_name)
    if db_prompt is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prompt not found")
    return crud._map_prompt_db_to_schema(db_prompt)

# --- Playground Endpoint ---
@app.post("/playground/test", response_model=schemas.PlaygroundResponse, tags=["Playground"])
async def test_prompt_in_playground(
    request: schemas.PlaygroundRequest,
    db: Session = Depends(get_db), # Added db session dependency
    current_user: Dict = Depends(verify_token) # Protect endpoint
):
    user_id = current_user.get('sub')
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials or user ID missing."
        )

    llm_provider_from_request = request.llm_provider.lower() # Normalize to lowercase

    # If not using dev override, fetch user's key
    decrypted_key = crud.get_decrypted_api_key(db=db, user_id=user_id, llm_provider=llm_provider_from_request)
    if not decrypted_key:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"API key for provider '{llm_provider_from_request}' not found for your account. Please add it in settings."
        )
    api_key_to_use = decrypted_key

    if not api_key_to_use: # Should be caught by above, but as a safeguard
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"API key for provider '{llm_provider_from_request}' could not be determined."
        )

    # Call the new get_llm_response function
    generated_text, error_message = await get_llm_response(
        provider_name=llm_provider_from_request,
        api_key=api_key_to_use,
        model_id=request.model_id, # Pass the new model_id from the request
        prompt_text=request.prompt_text
    )

    if error_message:
        # Standardized error prefixes from llm_services can be checked here if needed
        # For now, return the error message as is, or map to specific HTTP status codes
        if error_message.startswith("API_KEY_NOT_CONFIGURED"):
            # This case should be caught by the decrypted_key check earlier, but as a safeguard
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"API key for '{llm_provider_from_request}' not found or invalid.")
        elif error_message.startswith("MODEL_NOT_FOUND"):
            model_name_from_error = error_message.split(":",1)[1] if ":" in error_message else request.model_id
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Model '{model_name_from_error}' not found for provider '{llm_provider_from_request}'.")
        elif error_message.startswith("PROMPT_BLOCKED"):
            block_reason = error_message.split(":",1)[1] if ":" in error_message else "Unknown reason"
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Prompt blocked by provider '{llm_provider_from_request}'. Reason: {block_reason}")
        elif error_message.startswith("UNSUPPORTED_PROVIDER"):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Provider '{llm_provider_from_request}' is not supported.")
        elif error_message.startswith("NOT_IMPLEMENTED"):
            raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail=f"Support for '{llm_provider_from_request}' (model: '{request.model_id}') is not yet implemented.")
        
        # For generic GEMINI_API_ERROR, OPENAI_API_ERROR, etc., or other unhandled errors
        # Return a 503 or a more generic 500, possibly logging the detailed error_message server-side
        # For now, returning the error message which might be too revealing.
        # A better approach would be to log error_message and return a generic server error.
        print(f"LLM service error for {llm_provider_from_request} / {request.model_id}: {error_message}")
        return schemas.PlaygroundResponse(output_text=None, error=f"Error with LLM provider '{llm_provider_from_request}': {error_message}")
    
    return schemas.PlaygroundResponse(output_text=generated_text, error=None)

