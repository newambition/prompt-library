# backend/src/crud.py

from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select, delete, update, func
from typing import List, Optional, Dict, Any

from src import models # SQLAlchemy models
from src import schemas # Pydantic models
import datetime

# --- Helper Functions ---

def get_next_prompt_id_db(db: Session) -> str:
    """Generates the next sequential prompt ID based on DB data."""
    last_prompt = db.query(models.PromptDB).order_by(models.PromptDB.id.desc()).first()
    if not last_prompt or not last_prompt.prompt_id.startswith("prompt"):
        return "prompt1"
    try:
        last_num = int(last_prompt.prompt_id[len("prompt"):])
        return f"prompt{last_num + 1}"
    except ValueError:
        return f"prompt{last_prompt.id + 1}"

def get_next_version_id_db(prompt: models.PromptDB) -> str:
    """Generates the next sequential version ID for a given prompt (e.g., v1, v2)."""
    if not prompt.versions:
        return "v1"
    max_num = 0
    for version_db in prompt.versions: # These are now PromptVersionDB instances
        if hasattr(version_db, 'version_id_str') and version_db.version_id_str.startswith("v"):
            try:
                num = int(version_db.version_id_str[len("v"):])
                if num > max_num:
                    max_num = num
            except ValueError:
                continue
        elif hasattr(version_db, 'version_number'): # Fallback or handling for just number if needed, though we aim for vN
            if version_db.version_number > max_num:
                 max_num = version_db.version_number

    return f"v{max_num + 1}"

def get_current_date_str() -> str:
    """Returns the current date as a YYYY-MM-DD string."""
    return datetime.date.today().isoformat()

def _map_prompt_db_to_schema(prompt_db: models.PromptDB) -> schemas.Prompt:
    """Helper to map SQLAlchemy PromptDB model to Pydantic Prompt schema."""
    versions_dict: Dict[str, schemas.Version] = {}
    # Sort versions by created_at descending, then by version_number descending
    sorted_db_versions = sorted(
        prompt_db.versions,
        key=lambda v: (
            v.created_at if hasattr(v, 'created_at') else datetime.datetime.min, # Primary sort key
            v.version_number if hasattr(v, 'version_number') else 0 # Secondary sort key
        ),
        reverse=True
    )
    for version_db in sorted_db_versions: # These are PromptVersionDB instances
        # Map SQLAlchemy PromptVersionDB to Pydantic Version schema
        versions_dict[version_db.version_id_str] = schemas.Version(
            id=version_db.id, # This is the integer PK
            version_id=version_db.version_id_str, # This is the "vN" string
            text=version_db.text,
            notes=version_db.notes,
            date=version_db.created_at.isoformat() if hasattr(version_db, 'created_at') and version_db.created_at else get_current_date_str(), # Use created_at, provide fallback
            llm_provider=version_db.llm_provider if hasattr(version_db, 'llm_provider') else None,
            model_id_used=version_db.model_id_used if hasattr(version_db, 'model_id_used') else None
        )
    
    # Map tags from list of dicts in DB to list of Pydantic Tag schemas
    tags_list = [schemas.Tag(name=t.get("name"), color=t.get("color")) for t in prompt_db.tags if isinstance(t, dict) and "name" in t and "color" in t]

    return schemas.Prompt(
        id=prompt_db.prompt_id,
        title=prompt_db.title,
        tags=tags_list,
        versions=versions_dict,
        latest_version=prompt_db.latest_version
    )

# --- Prompt CRUD ---

def get_prompt_by_prompt_id(db: Session, prompt_id: str) -> Optional[models.PromptDB]:
    """Retrieves a prompt by its string ID, with versions eagerly loaded."""
    return db.query(models.PromptDB).\
        options(joinedload(models.PromptDB.versions)).\
        filter(models.PromptDB.prompt_id == prompt_id).\
        first()

def get_prompts(db: Session, skip: int = 0, limit: int = 100) -> List[models.PromptDB]:
    """Retrieves a list of prompts with pagination, with versions eagerly loaded."""
    return db.query(models.PromptDB).\
        options(joinedload(models.PromptDB.versions)).\
        order_by(models.PromptDB.id).\
        offset(skip).\
        limit(limit).\
        all()

def create_db_prompt(db: Session, prompt_data: schemas.PromptCreate) -> models.PromptDB:
    """Creates a new prompt record with an initial version and tags."""
    db_prompt_id = get_next_prompt_id_db(db)
    initial_version_id_str = "v1"

    # Convert Pydantic TagCreate objects to dictionaries for JSON storage
    tags_to_store = [tag.model_dump() for tag in prompt_data.tags]

    db_prompt = models.PromptDB(
        prompt_id=db_prompt_id,
        title=prompt_data.title,
        tags=tags_to_store, # Store as list of dicts
        latest_version=initial_version_id_str
    )
    db.add(db_prompt)
    db.flush() # Ensure db_prompt.id is populated before using it for the version

    db_version = models.PromptVersionDB(
        prompt_id=db_prompt.id, # Correct: Foreign key to PromptDB's primary key (integer)
        version_number=1,
        version_id_str=initial_version_id_str, # This is "v1"
        # date=get_current_date_str(), # created_at is now auto-set by DB
        text=prompt_data.initial_version_text,
        notes=prompt_data.initial_version_notes,
        llm_provider=None, # Explicitly None for initial version
        model_id_used=None   # Explicitly None for initial version
    )
    db.add(db_version)

    db.commit()
    db.refresh(db_prompt)
    return db_prompt

def delete_db_prompt(db: Session, prompt_id: str) -> bool:
    db_prompt = get_prompt_by_prompt_id(db, prompt_id)
    if db_prompt:
        db.delete(db_prompt)
        db.commit()
        return True
    return False

def update_db_prompt(db: Session, prompt_id: str, update_data: schemas.PromptUpdate) -> Optional[models.PromptDB]:
    db_prompt = get_prompt_by_prompt_id(db, prompt_id)
    if not db_prompt:
        return None
    
    updated_fields = False
    if update_data.title is not None:
        db_prompt.title = update_data.title
        updated_fields = True
    
    if update_data.tags is not None:
        # Convert list of Pydantic TagCreate models to list of dicts for JSON storage
        db_prompt.tags = [tag.model_dump() for tag in update_data.tags]
        updated_fields = True

    if updated_fields:
        db.add(db_prompt)
        db.commit()
        db.refresh(db_prompt)
    return db_prompt

# --- Version CRUD ---

def create_db_version(db: Session, prompt_id: str, version_data: schemas.VersionCreate) -> Optional[models.PromptVersionDB]:
    db_prompt = get_prompt_by_prompt_id(db, prompt_id)
    if not db_prompt:
        return None

    new_version_id_str = get_next_version_id_db(db_prompt)
    next_version_number = 0
    try:
        next_version_number = int(new_version_id_str[len("v"):])
    except ValueError:
        # This case should ideally not happen if get_next_version_id_db is robust
        # Or handle by querying max version_number from db_prompt.versions + 1
        if db_prompt.versions:
            next_version_number = max(v.version_number for v in db_prompt.versions if hasattr(v, 'version_number')) + 1
        else:
            next_version_number = 1

    db_version = models.PromptVersionDB(
        prompt_id=db_prompt.id, # Foreign key to PromptDB's primary key
        version_number=next_version_number,
        version_id_str=new_version_id_str,
        # date=get_current_date_str(), # created_at is now auto-set by DB
        text=version_data.text,
        notes=version_data.notes,
        llm_provider=version_data.llm_provider,
        model_id_used=version_data.model_id_used
    )
    db.add(db_version)
    db_prompt.latest_version = new_version_id_str
    db.add(db_prompt)
    db.commit()
    db.refresh(db_version)
    db.refresh(db_prompt)
    return db_version

def update_db_version_notes(db: Session, prompt_id: str, version_id_str: str, notes: Optional[str]) -> Optional[models.PromptVersionDB]:
    db_prompt = get_prompt_by_prompt_id(db, prompt_id)
    if not db_prompt:
        return None
    # Find the version by version_id_str
    db_version_to_update = next((v for v in db_prompt.versions if hasattr(v, 'version_id_str') and v.version_id_str == version_id_str), None)
    if not db_version_to_update:
        return None
    db_version_to_update.notes = notes
    db.add(db_version_to_update)
    db.commit()
    db.refresh(db_version_to_update)
    return db_version_to_update

# --- Tag CRUD ---

def add_db_tag(db: Session, prompt_id: str, tag_create_data: schemas.TagCreate) -> Optional[models.PromptDB]:
    """Adds a tag (name and color) to a prompt. If tag name exists, updates color."""
    db_prompt = get_prompt_by_prompt_id(db, prompt_id)
    if not db_prompt:
        return None

    # Ensure tags is a list of dictionaries
    current_tags: List[Dict[str, Any]] = [dict(t) for t in db_prompt.tags if isinstance(t, dict)]
    
    tag_name_exists = False
    for i, existing_tag_dict in enumerate(current_tags):
        if existing_tag_dict.get("name") == tag_create_data.name:
            # Update color if tag name already exists
            current_tags[i]["color"] = tag_create_data.color
            tag_name_exists = True
            break
    
    if not tag_name_exists:
        current_tags.append(tag_create_data.model_dump()) # Add new tag object

    db_prompt.tags = current_tags # Assign the modified list back
    db.add(db_prompt)
    db.commit()
    db.refresh(db_prompt)
    return db_prompt

def remove_db_tag(db: Session, prompt_id: str, tag_name: str) -> Optional[models.PromptDB]:
    """Removes a tag from a prompt's tag list by its name."""
    db_prompt = get_prompt_by_prompt_id(db, prompt_id)
    if not db_prompt:
        return None

    # Ensure tags is a list of dictionaries
    current_tags: List[Dict[str, Any]] = [dict(t) for t in db_prompt.tags if isinstance(t, dict)]
    
    original_length = len(current_tags)
    # Filter out the tag by name
    updated_tags = [tag_dict for tag_dict in current_tags if tag_dict.get("name") != tag_name]

    if len(updated_tags) < original_length: # If a tag was actually removed
        db_prompt.tags = updated_tags
        db.add(db_prompt)
        db.commit()
        db.refresh(db_prompt)
    
    return db_prompt
