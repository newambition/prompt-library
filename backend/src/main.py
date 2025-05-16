# FastAPI application endpoints using SQLAlchemy and CRUD operations

from fastapi import FastAPI, HTTPException, status, Body, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from sqlalchemy.orm import Session

# Import schemas (Pydantic models), CRUD functions, DB models, and session dependency
from src import schemas
from src import crud
from src import models # Need this for Base.metadata if creating tables here
from src.database import SessionLocal, engine, get_db, create_database_tables

# --- Optional: Create DB tables on startup (Alternative to Alembic for simple cases) ---
# Uncomment the line below if you want FastAPI to create tables when it starts.
# Note: This is NOT recommended for production where Alembic should be used.
# models.Base.metadata.create_all(bind=engine)
# print("Database tables checked/created.")

# --- FastAPI App Initialization ---
app = FastAPI(
    title="Prompt Library API",
    description="API for managing prompts, versions, notes, and tags using SQLAlchemy.",
    version="0.2.0",
)

# --- CORS Middleware ---
# Allow requests from your React frontend development server
origins = [
    "http://localhost",      # Base domain
    "http://localhost:3000", # Default Create React App port
    "http://localhost:5173", # Default Vite port
    # Add any other origins if needed (e.g., deployed frontend URL)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Allow all methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"], # Allow all headers
)

# --- API Endpoints ---

@app.get("/", tags=["Root"])
async def read_root():
    """Basic root endpoint."""
    return {"message": "Welcome to the Prompt Library API!"}

# -- Prompt Endpoints --

@app.get("/prompts", response_model=schemas.PromptListResponse, tags=["Prompts"])
async def read_prompts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Retrieve a list of all prompts."""
    db_prompts = crud.get_prompts(db, skip=skip, limit=limit)
    # Map DB models to Pydantic schemas
    schema_prompts = [crud._map_prompt_db_to_schema(p) for p in db_prompts]
    return schemas.PromptListResponse(prompts=schema_prompts)

@app.post("/prompts", response_model=schemas.Prompt, status_code=status.HTTP_201_CREATED, tags=["Prompts"])
async def create_prompt(prompt_data: schemas.PromptCreate, db: Session = Depends(get_db)):
    """Create a new prompt with an initial version."""
    # Check if title already exists (optional, add if needed)
    # db_prompt_existing = db.query(models.PromptDB).filter(models.PromptDB.title == prompt_data.title).first()
    # if db_prompt_existing:
    #     raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Prompt title already exists")

    db_prompt = crud.create_db_prompt(db=db, prompt_data=prompt_data)
    return crud._map_prompt_db_to_schema(db_prompt) # Map to schema for response

@app.get("/prompts/{prompt_id}", response_model=schemas.Prompt, tags=["Prompts"])
async def read_prompt(prompt_id: str, db: Session = Depends(get_db)):
    """Retrieve a specific prompt by its string ID (e.g., 'prompt1')."""
    db_prompt = crud.get_prompt_by_prompt_id(db, prompt_id=prompt_id)
    if db_prompt is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prompt not found")
    return crud._map_prompt_db_to_schema(db_prompt)

@app.delete("/prompts/{prompt_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Prompts"])
async def delete_prompt(prompt_id: str, db: Session = Depends(get_db)):
    """Delete a specific prompt by its ID."""
    deleted = crud.delete_db_prompt(db, prompt_id=prompt_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prompt not found")
    return # Return None for 204 No Content

@app.put("/prompts/{prompt_id}", response_model=schemas.Prompt, tags=["Prompts"])
async def update_prompt(prompt_id: str, update_data: schemas.PromptUpdate, db: Session = Depends(get_db)):
    """Update a prompt's title and/or tags."""
    db_prompt = crud.update_db_prompt(db, prompt_id=prompt_id, update_data=update_data)
    if db_prompt is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prompt not found")
    return crud._map_prompt_db_to_schema(db_prompt)

# -- Version Endpoints --

@app.post("/prompts/{prompt_id}/versions", response_model=schemas.Version, status_code=status.HTTP_201_CREATED, tags=["Versions"])
async def create_version_for_prompt(prompt_id: str, version_data: schemas.VersionCreate, db: Session = Depends(get_db)):
    """Create a new version for an existing prompt."""
    db_version = crud.create_db_version(db=db, prompt_id=prompt_id, version_data=version_data)
    if db_version is None:
         # This implies the prompt_id was not found by the crud function
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Prompt '{prompt_id}' not found")

    # The response model is Version, so we validate against it
    return schemas.Version.model_validate(db_version)

@app.put("/prompts/{prompt_id}/versions/{version_id}/notes", response_model=schemas.Version, tags=["Versions"])
async def update_version_notes(prompt_id: str, version_id: str, note_update: schemas.NoteUpdate, db: Session = Depends(get_db)):
    """Update the notes for a specific version of a prompt."""
    db_version = crud.update_db_version_notes(db=db, prompt_id=prompt_id, version_id=version_id, notes=note_update.notes)
    if db_version is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Prompt '{prompt_id}' or Version '{version_id}' not found")
    return schemas.Version.model_validate(db_version)

# -- Tag Endpoints --

@app.post("/prompts/{prompt_id}/tags", response_model=schemas.Prompt, tags=["Tags"])
async def add_tag_to_prompt(prompt_id: str, tag_update: schemas.TagUpdate = Body(...), db: Session = Depends(get_db)):
    """Add a tag to a specific prompt. Expects {"tag": "your_tag_name"} in body."""
    tag_to_add = tag_update.tag.strip()
    if not tag_to_add:
         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tag name cannot be empty")

    db_prompt = crud.add_db_tag(db=db, prompt_id=prompt_id, tag=tag_to_add)
    if db_prompt is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prompt not found")
    return crud._map_prompt_db_to_schema(db_prompt)

@app.delete("/prompts/{prompt_id}/tags/{tag_name}", response_model=schemas.Prompt, tags=["Tags"])
async def remove_tag_from_prompt(prompt_id: str, tag_name: str, db: Session = Depends(get_db)):
    """Remove a specific tag from a prompt."""
    db_prompt = crud.remove_db_tag(db=db, prompt_id=prompt_id, tag=tag_name)
    if db_prompt is None:
         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prompt not found")
    # We also need to handle the case where the tag itself wasn't found on the prompt
    # The crud function currently returns the prompt even if tag wasn't found.
    # If you want to return 404 if tag doesn't exist, modify crud.remove_db_tag
    # and check its return value here.
    return crud._map_prompt_db_to_schema(db_prompt)


# --- How to Run ---
# Save files: main.py, schemas.py, models.py, database.py, crud.py
# Install dependencies: pip install fastapi uvicorn sqlalchemy "psycopg2-binary" alembic pydantic
# Initialize Database (using Alembic recommended, see below)
# Run the server: uvicorn main:app --reload --port 8000

# --- Database Initialization (Recommended: Use Alembic) ---
# 1. Initialize Alembic: alembic init alembic
# 2. Edit alembic.ini: Set sqlalchemy.url = sqlite:///./prompt_library.db (or your Postgres URL)
# 3. Edit alembic/env.py:
#    - Add: from models import Base # Or wherever your Base is defined
#    - Set: target_metadata = Base.metadata
# 4. Create initial migration: alembic revision --autogenerate -m "Initial migration"
# 5. Apply migration to create tables: alembic upgrade head
# Now run the FastAPI app: uvicorn main:app --reload --port 8000
