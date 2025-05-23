# backend/src/main.py
from fastapi import FastAPI, HTTPException, status, Body, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict # Added Dict
from sqlalchemy.orm import Session

from src import schemas, crud, models
from src.database import get_db
from src.config import settings
from src.llm_services import generate_text_from_gemini
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
    current_user: Dict = Depends(verify_token) # Protect endpoint
):
    # print(f"Current user from token: {current_user.get('sub')}") # Example: access user ID
    db_prompts = crud.get_prompts(db, skip=skip, limit=limit)
    schema_prompts = [crud._map_prompt_db_to_schema(p) for p in db_prompts]
    return schemas.PromptListResponse(prompts=schema_prompts)

@app.post("/prompts", response_model=schemas.Prompt, status_code=status.HTTP_201_CREATED, tags=["Prompts"])
async def create_prompt(
    prompt_data: schemas.PromptCreate, db: Session = Depends(get_db),
    current_user: Dict = Depends(verify_token) # Protect endpoint
):
    db_prompt = crud.create_db_prompt(db=db, prompt_data=prompt_data)
    return crud._map_prompt_db_to_schema(db_prompt)

@app.get("/prompts/{prompt_id}", response_model=schemas.Prompt, tags=["Prompts"])
async def read_prompt(
    prompt_id: str, db: Session = Depends(get_db),
    current_user: Dict = Depends(verify_token) # Protect endpoint
):
    db_prompt = crud.get_prompt_by_prompt_id(db, prompt_id=prompt_id)
    if db_prompt is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prompt not found")
    return crud._map_prompt_db_to_schema(db_prompt)

@app.delete("/prompts/{prompt_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Prompts"])
async def delete_prompt(
    prompt_id: str, db: Session = Depends(get_db),
    current_user: Dict = Depends(verify_token) # Protect endpoint
):
    deleted = crud.delete_db_prompt(db, prompt_id=prompt_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prompt not found")
    return

@app.put("/prompts/{prompt_id}", response_model=schemas.Prompt, tags=["Prompts"])
async def update_prompt(
    prompt_id: str, update_data: schemas.PromptUpdate, db: Session = Depends(get_db),
    current_user: Dict = Depends(verify_token) # Protect endpoint
):
    db_prompt = crud.update_db_prompt(db, prompt_id=prompt_id, update_data=update_data)
    if db_prompt is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prompt not found")
    return crud._map_prompt_db_to_schema(db_prompt)

# -- Version Endpoints --
@app.post("/prompts/{prompt_id}/versions", response_model=schemas.Version, status_code=status.HTTP_201_CREATED, tags=["Versions"])
async def create_version_for_prompt(
    prompt_id: str, version_data: schemas.VersionCreate, db: Session = Depends(get_db),
    current_user: Dict = Depends(verify_token) # Protect endpoint
):
    db_version = crud.create_db_version(db=db, prompt_id=prompt_id, version_data=version_data)
    if db_version is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Prompt '{prompt_id}' not found")
    return schemas.Version(
        id=db_version.id, version_id=db_version.version_id, text=db_version.text,
        notes=db_version.notes, date=db_version.date
    )

@app.put("/prompts/{prompt_id}/versions/{version_id_str}/notes", response_model=schemas.Version, tags=["Versions"])
async def update_version_notes(
    prompt_id: str, version_id_str: str, note_update: schemas.NoteUpdate, db: Session = Depends(get_db),
    current_user: Dict = Depends(verify_token) # Protect endpoint
):
    db_version = crud.update_db_version_notes(db=db, prompt_id=prompt_id, version_id_str=version_id_str, notes=note_update.notes)
    if db_version is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Prompt '{prompt_id}' or Version '{version_id_str}' not found")
    return schemas.Version(
        id=db_version.id, version_id=db_version.version_id, text=db_version.text,
        notes=db_version.notes, date=db_version.date
    )

# -- Tag Endpoints --
@app.post("/prompts/{prompt_id}/tags", response_model=schemas.Prompt, tags=["Tags"])
async def add_tag_to_prompt(
    prompt_id: str, tag_data: schemas.SingleTagAdd = Body(...), db: Session = Depends(get_db),
    current_user: Dict = Depends(verify_token) # Protect endpoint
):
    if not tag_data.name.strip():
         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tag name cannot be empty")
    if not tag_data.color.strip():
        tag_data.color = "bg-gray-200"
    db_prompt = crud.add_db_tag(db=db, prompt_id=prompt_id, tag_create_data=tag_data)
    if db_prompt is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prompt not found")
    return crud._map_prompt_db_to_schema(db_prompt)

@app.delete("/prompts/{prompt_id}/tags/{tag_name}", response_model=schemas.Prompt, tags=["Tags"])
async def remove_tag_from_prompt(
    prompt_id: str, tag_name: str, db: Session = Depends(get_db),
    current_user: Dict = Depends(verify_token) # Protect endpoint
):
    db_prompt = crud.remove_db_tag(db=db, prompt_id=prompt_id, tag_name=tag_name)
    if db_prompt is None:
         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prompt not found")
    return crud._map_prompt_db_to_schema(db_prompt)

# --- Playground Endpoint ---
@app.post("/playground/test", response_model=schemas.PlaygroundResponse, tags=["Playground"])
async def test_prompt_in_playground(
    request: schemas.PlaygroundRequest,
    current_user: Dict = Depends(verify_token) # Protect endpoint
):
    api_key_to_use = settings.GEMINI_API_KEY
    if not api_key_to_use:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="LLM service is not configured on the server (API key missing)."
        )
    generated_text, error_message = await generate_text_from_gemini(
        api_key=api_key_to_use,
        prompt_text=request.prompt_text
    )
    if error_message:
        return schemas.PlaygroundResponse(output_text=None, error=error_message)
    return schemas.PlaygroundResponse(output_text=generated_text, error=None)

