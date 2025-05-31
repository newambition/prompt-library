# backend/src/main.py
from fastapi import FastAPI, HTTPException, status, Body, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict
from sqlalchemy.orm import Session

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from src import schemas, crud, models
from src.database import get_db
from src.config import settings
from src.llm_services import get_llm_response # New import
from src.auth_utils import verify_token, get_current_active_user # Import the new dependency
from src import tier_utils  # Import tier enforcement utilities
# from src.crud import crud_users

# Import the routers
from src.routers import user_settings_router, stripe_billing_router

# Rate Limiting Setup
# Note: For a production setup, rate limit strings (e.g., "100/minute")
# should ideally be configurable via environment variables or a config file (e.g., in src.config.settings).
# Hardcoding them here for simplicity as per subtask instructions.
limiter = Limiter(key_func=get_remote_address, default_limits=["100/minute"])

app = FastAPI(
    title="Prompt Library API",
    description="API for managing prompts, versions, notes, tags, and testing with LLMs.",
    version="0.6.0", # Incremented version for monetization features
)

origins = [
    "http://localhost", "http://localhost:3000", "http://localhost:5173",
]
app.add_middleware(
    CORSMiddleware, allow_origins=origins, allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"],
)

# Apply global rate limiter to the app and add exception handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


@app.get("/", tags=["Root"])
@limiter.limit("100/minute") # Apply general limit, though covered by default
async def read_root(request: Request): # Added request parameter
    return {"message": "Welcome to the Prompt Library API!"}

# Include routers
app.include_router(user_settings_router)
app.include_router(stripe_billing_router)

# -- User Tier Info Endpoint --
@app.get("/user/tier-info", response_model=schemas.UserTierInfo, tags=["User"])
@limiter.limit("60/minute") # Example specific limit for this route
async def get_user_tier_info(
    request: Request, # Added request parameter
    db: Session = Depends(get_db),
    current_db_user: models.User = Depends(get_current_active_user)
):
    """Get user's tier information and limits."""
    return tier_utils.check_user_tier_info(db, current_db_user.user_id)

# -- User Preferences Endpoint --
@app.get("/user/profile", response_model=schemas.User, tags=["User"])
@limiter.limit("60/minute")
async def get_user_profile(
    request: Request, # Added request parameter
    current_db_user: models.User = Depends(get_current_active_user)
):
    """Get the user's profile data including tier and preferences."""
    return current_db_user

@app.put("/user/paywall-modal-seen", status_code=status.HTTP_204_NO_CONTENT, tags=["User"])
@limiter.limit("30/minute")
async def mark_paywall_modal_seen(
    request: Request, # Added request parameter
    db: Session = Depends(get_db),
    current_db_user: models.User = Depends(get_current_active_user)
):
    """Mark that the user has seen the paywall/tier selection modal."""
    from src.crud import crud_users # Import here as it's specifically used for this update
    # Update the user's has_seen_paywall_modal flag
    success = crud_users.update_user_paywall_modal_seen(db, current_db_user.user_id, True)
    if not success:
        # If get_current_active_user succeeded, the user exists.
        # Failure here implies an issue with the update operation itself (e.g., DB error).
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update user preference in database.")
    
    # Return 204 No Content on success

# -- Prompt Endpoints --
# These will be covered by the default_limits of "100/minute"
@app.get("/prompts", response_model=schemas.PromptListResponse, tags=["Prompts"])
async def read_prompts(
    request: Request, # Added request parameter
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db),
    current_db_user: models.User = Depends(get_current_active_user)
):
    db_prompts = crud.get_prompts(db, user_id=current_db_user.user_id, skip=skip, limit=limit)
    schema_prompts = [crud._map_prompt_db_to_schema(p) for p in db_prompts]
    return schemas.PromptListResponse(prompts=schema_prompts)

@app.post("/prompts", response_model=schemas.Prompt, status_code=status.HTTP_201_CREATED, tags=["Prompts"])
async def create_prompt(
    request: Request, # Added request parameter
    prompt: schemas.PromptCreate, db: Session = Depends(get_db),
    current_db_user: models.User = Depends(get_current_active_user)
):
    # Enforce tier limits for prompt creation
    tier_utils.enforce_prompt_creation_limit(db, current_db_user.user_id)
    
    db_prompt = crud.create_db_prompt(db=db, prompt_data=prompt, user_id=current_db_user.user_id)
    return crud._map_prompt_db_to_schema(db_prompt)

@app.get("/prompts/{prompt_id}", response_model=schemas.Prompt, tags=["Prompts"])
async def read_prompt(
    request: Request, # Added request parameter
    prompt_id: str, db: Session = Depends(get_db),
    current_db_user: models.User = Depends(get_current_active_user)
):
    db_prompt = crud.get_prompt_by_prompt_id(db, prompt_id=prompt_id, user_id=current_db_user.user_id)
    if db_prompt is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prompt not found")
    return crud._map_prompt_db_to_schema(db_prompt)

@app.delete("/prompts/{prompt_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Prompts"])
async def delete_prompt(
    request: Request, # Added request parameter
    prompt_id: str, db: Session = Depends(get_db),
    current_db_user: models.User = Depends(get_current_active_user)
):
    success = crud.delete_db_prompt(db, prompt_id=prompt_id, user_id=current_db_user.user_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prompt not found")

@app.put("/prompts/{prompt_id}", response_model=schemas.Prompt, tags=["Prompts"])
async def update_prompt(
    request: Request, # Added request parameter
    prompt_id: str, prompt_update: schemas.PromptUpdate, db: Session = Depends(get_db),
    current_db_user: models.User = Depends(get_current_active_user)
):
    db_prompt = crud.update_db_prompt(db, prompt_id=prompt_id, user_id=current_db_user.user_id, update_data=prompt_update)
    if db_prompt is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prompt not found")
    return crud._map_prompt_db_to_schema(db_prompt)

# -- Version Endpoints --
@app.post("/prompts/{prompt_id}/versions", response_model=schemas.Version, status_code=status.HTTP_201_CREATED, tags=["Versions"])
async def create_version(
    request: Request, # Added request parameter
    prompt_id: str, version: schemas.VersionCreate, db: Session = Depends(get_db),
    current_db_user: models.User = Depends(get_current_active_user)
):
    # Enforce tier limits for version creation
    tier_utils.enforce_version_creation_limit(db, current_db_user.user_id, prompt_id)
    
    db_version = crud.create_db_version(db=db, prompt_id=prompt_id, user_id=current_db_user.user_id, version_data=version)
    if db_version is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prompt not found or not authorized")
    
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
    request: Request, # Added request parameter
    prompt_id: str, version_id: str, note_update: schemas.NoteUpdate, db: Session = Depends(get_db),
    current_db_user: models.User = Depends(get_current_active_user)
):
    db_version = crud.update_db_version_notes(db, prompt_id=prompt_id, user_id=current_db_user.user_id, version_id_str=version_id, notes=note_update.notes)
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
    request: Request, # Added request parameter
    prompt_id: str, tag: schemas.SingleTagAdd, db: Session = Depends(get_db),
    current_db_user: models.User = Depends(get_current_active_user)
):
    db_prompt = crud.add_db_tag(db, prompt_id=prompt_id, user_id=current_db_user.user_id, tag_create_data=tag)
    if db_prompt is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prompt not found")
    return crud._map_prompt_db_to_schema(db_prompt)

@app.delete("/prompts/{prompt_id}/tags/{tag_name}", response_model=schemas.Prompt, tags=["Tags"])
async def remove_tag(
    request: Request, # Added request parameter
    prompt_id: str, tag_name: str, db: Session = Depends(get_db),
    current_db_user: models.User = Depends(get_current_active_user)
):
    db_prompt = crud.remove_db_tag(db, prompt_id=prompt_id, user_id=current_db_user.user_id, tag_name=tag_name)
    if db_prompt is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prompt not found")
    return crud._map_prompt_db_to_schema(db_prompt)

# --- Playground Endpoint ---
@app.post("/playground/test", response_model=schemas.PlaygroundResponse, tags=["Playground"])
@limiter.limit("10/minute") # Stricter limit for this specific endpoint
async def test_prompt_in_playground(
    fastapi_request: Request, # Renamed to avoid clash with schemas.PlaygroundRequest
    payload: schemas.PlaygroundRequest, # Changed to payload to receive request body
    db: Session = Depends(get_db),
    current_db_user: models.User = Depends(get_current_active_user)
):
    llm_provider_from_request = payload.llm_provider.lower()

    # If not using dev override, fetch user's key
    decrypted_key = crud.get_decrypted_api_key(db=db, user_id=current_db_user.user_id, llm_provider=llm_provider_from_request)
    if not decrypted_key:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No API key found for provider '{llm_provider_from_request}'. Please add your API key in settings."
        )

    try:
        # Call the LLM service with the user's API key
        output_text = get_llm_response(
            prompt_text=payload.prompt_text,
            llm_provider=llm_provider_from_request,
            api_key=decrypted_key,
            model_id=payload.model_id
        )
        return schemas.PlaygroundResponse(output_text=output_text)
    except Exception as e:
        return schemas.PlaygroundResponse(error=str(e))

