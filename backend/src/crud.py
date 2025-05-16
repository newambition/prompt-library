# Contains functions for Create, Read, Update, Delete (CRUD) operations
# interacting with the database via SQLAlchemy models.

from sqlalchemy.orm import Session
from sqlalchemy import select, delete, update
from typing import List, Optional, Dict

from src import models
from src import schemas
import datetime

# --- Helper Functions ---

def get_next_prompt_id_db(db: Session) -> str:
    """Generates the next sequential prompt ID based on DB data."""
    # Query the highest prompt number from the prompt_id column
    # This is less efficient than sequence/auto-increment but matches previous logic
    last_prompt = db.query(models.PromptDB).order_by(models.PromptDB.id.desc()).first()
    if not last_prompt or not last_prompt.prompt_id.startswith("prompt"):
        return "prompt1"
    try:
        last_num = int(last_prompt.prompt_id[len("prompt"):])
        return f"prompt{last_num + 1}"
    except ValueError:
        # Fallback if parsing fails (shouldn't happen with correct data)
        return f"prompt{last_prompt.id + 1}" # Use DB ID as fallback

def get_next_version_id_db(prompt: models.PromptDB) -> str:
    """Generates the next sequential version ID for a given prompt."""
    if not prompt.versions:
        return "v1"
    max_num = 0
    for version in prompt.versions:
        if version.version_id.startswith("v"):
            try:
                num = int(version.version_id[len("v"):])
                if num > max_num:
                    max_num = num
            except ValueError:
                continue
    return f"v{max_num + 1}"

def get_current_date_str() -> str:
    """Returns the current date as a YYYY-MM-DD string."""
    return datetime.date.today().isoformat()

def _map_prompt_db_to_schema(prompt_db: models.PromptDB) -> schemas.Prompt:
    """Helper to map SQLAlchemy PromptDB model to Pydantic Prompt schema."""
    versions_dict: Dict[str, schemas.Version] = {}
    for version_db in prompt_db.versions:
        versions_dict[version_db.version_id] = schemas.Version.model_validate(version_db) # Use model_validate for Pydantic v2

    return schemas.Prompt(
        id=prompt_db.prompt_id,
        title=prompt_db.title,
        tags=prompt_db.tags, # Assumes tags are stored as a list in JSON
        versions=versions_dict,
        latest_version=prompt_db.latest_version
    )

# --- Prompt CRUD ---

def get_prompt_by_prompt_id(db: Session, prompt_id: str) -> Optional[models.PromptDB]:
    """Retrieves a prompt by its string ID (e.g., 'prompt1')."""
    return db.execute(
        select(models.PromptDB).where(models.PromptDB.prompt_id == prompt_id)
    ).scalar_one_or_none()

def get_prompts(db: Session, skip: int = 0, limit: int = 100) -> List[models.PromptDB]:
    """Retrieves a list of prompts with pagination."""
    return db.execute(
        select(models.PromptDB).offset(skip).limit(limit)
    ).scalars().all()

def create_db_prompt(db: Session, prompt_data: schemas.PromptCreate) -> models.PromptDB:
    """Creates a new prompt record in the database with its initial version."""
    db_prompt_id = get_next_prompt_id_db(db)
    initial_version_id = "v1"

    # Create the PromptDB instance
    db_prompt = models.PromptDB(
        prompt_id=db_prompt_id,
        title=prompt_data.title,
        tags=prompt_data.tags if prompt_data.tags else [],
        latest_version=initial_version_id
    )
    db.add(db_prompt)
    # Must flush to get the db_prompt.id assigned if needed for the version's foreign key
    db.flush()

    # Create the initial VersionDB instance linked to the prompt
    db_version = models.VersionDB(
        version_id=initial_version_id,
        date=get_current_date_str(),
        text=prompt_data.initial_version_text,
        notes=prompt_data.initial_version_notes,
        prompt_db_id=db_prompt.id # Link using the generated primary key
    )
    db.add(db_version)

    # Commit the transaction to save both prompt and version
    db.commit()
    # Refresh the prompt instance to load the newly added version relationship
    db.refresh(db_prompt)
    return db_prompt

def delete_db_prompt(db: Session, prompt_id: str) -> bool:
    """Deletes a prompt and its associated versions from the database."""
    db_prompt = get_prompt_by_prompt_id(db, prompt_id)
    if db_prompt:
        db.delete(db_prompt)
        db.commit()
        return True
    return False

# --- Version CRUD ---

def create_db_version(db: Session, prompt_id: str, version_data: schemas.VersionCreate) -> Optional[models.VersionDB]:
    """Creates a new version record for an existing prompt."""
    db_prompt = get_prompt_by_prompt_id(db, prompt_id)
    if not db_prompt:
        return None # Prompt not found

    new_version_id = get_next_version_id_db(db_prompt)

    # Create the new version instance
    db_version = models.VersionDB(
        version_id=new_version_id,
        date=get_current_date_str(),
        text=version_data.text,
        notes=version_data.notes,
        prompt_db_id=db_prompt.id
    )
    db.add(db_version)

    # Update the prompt's latest_version field
    db_prompt.latest_version = new_version_id
    db.add(db_prompt) # Add prompt back to session to track changes

    db.commit()
    db.refresh(db_version)
    db.refresh(db_prompt) # Refresh prompt to reflect latest_version change
    return db_version

def update_db_version_notes(db: Session, prompt_id: str, version_id: str, notes: Optional[str]) -> Optional[models.VersionDB]:
    """Updates the notes for a specific version."""
    db_prompt = get_prompt_by_prompt_id(db, prompt_id)
    if not db_prompt:
        return None

    # Find the specific version within the prompt's versions
    db_version = None
    for v in db_prompt.versions:
        if v.version_id == version_id:
            db_version = v
            break

    if not db_version:
        return None # Version not found

    db_version.notes = notes
    db.add(db_version)
    db.commit()
    db.refresh(db_version)
    return db_version

# --- Tag CRUD ---

def add_db_tag(db: Session, prompt_id: str, tag: str) -> Optional[models.PromptDB]:
    """Adds a tag to a prompt's tag list if it doesn't exist."""
    db_prompt = get_prompt_by_prompt_id(db, prompt_id)
    if not db_prompt:
        return None

    # Ensure tags attribute is treated as mutable if using JSON
    # This might require specific handling depending on the DB/SQLAlchemy version
    # For simplicity, we retrieve, modify, and update
    current_tags = list(db_prompt.tags) # Create a mutable copy
    if tag not in current_tags:
        current_tags.append(tag)
        db_prompt.tags = current_tags # Assign the modified list back
        db.add(db_prompt)
        db.commit()
        db.refresh(db_prompt)
    return db_prompt

def remove_db_tag(db: Session, prompt_id: str, tag: str) -> Optional[models.PromptDB]:
    """Removes a tag from a prompt's tag list if it exists."""
    db_prompt = get_prompt_by_prompt_id(db, prompt_id)
    if not db_prompt:
        return None

    current_tags = list(db_prompt.tags)
    if tag in current_tags:
        current_tags.remove(tag)
        db_prompt.tags = current_tags
        db.add(db_prompt)
        db.commit()
        db.refresh(db_prompt)
        return db_prompt
    else:
        # Tag not found, return the prompt as is or raise an error?
        # Returning prompt is consistent with adding an existing tag.
        return db_prompt

def update_db_prompt(db: Session, prompt_id: str, update_data: schemas.PromptUpdate) -> Optional[models.PromptDB]:
    """Updates a prompt's title and/or tags."""
    db_prompt = get_prompt_by_prompt_id(db, prompt_id)
    if not db_prompt:
        return None
    updated = False
    if update_data.title is not None:
        db_prompt.title = update_data.title
        updated = True
    if update_data.tags is not None:
        db_prompt.tags = update_data.tags
        updated = True
    if updated:
        db.add(db_prompt)
        db.commit()
        db.refresh(db_prompt)
    return db_prompt