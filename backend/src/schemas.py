# Defines Pydantic models for data validation and serialization


from pydantic import BaseModel, Field, ConfigDict
from typing import List, Dict, Optional
import datetime

# --- Base Models ---

class VersionBase(BaseModel):
    """Base model for version data (used for creation)."""
    text: str
    notes: Optional[str] = None

class Version(VersionBase):
    """Full version model including ID and date."""
    id: int # e.g., "v1", "v2"
    date: str # Store as string for simplicity, could use datetime

    # Add ConfigDict for ORM mode compatibility
    model_config = ConfigDict(from_attributes=True)


class PromptBase(BaseModel):
    """Base model for prompt data (used for creation)."""
    title: str
    tags: List[str] = []

class PromptCreate(PromptBase):
    """Model specifically for creating a new prompt, requires initial version details."""
    initial_version_text: str
    initial_version_notes: Optional[str] = None

class Prompt(PromptBase):
    """Full prompt model including ID, versions, and latest version."""
    id: str # e.g., "prompt1", "prompt2"
    # Use the Version schema here
    versions: Dict[str, Version] = {} # Dictionary mapping version_id ("v1") to Version object
    latest_version: str # ID of the latest version, e.g., "v1"

    # Add ConfigDict for ORM mode compatibility
    model_config = ConfigDict(from_attributes=True)


# --- Request/Response Models for Specific Operations ---

class PromptUpdate(BaseModel):
    """Model for updating prompt fields (e.g., title, tags)."""
    title: Optional[str] = None  # Allow updating the title
    tags: Optional[List[str]] = None # Allow updating the whole tag list

class VersionCreate(VersionBase):
    """Model specifically for creating a new version for an existing prompt."""
    pass # Inherits fields from VersionBase

class NoteUpdate(BaseModel):
    """Model for updating notes of a specific version."""
    notes: Optional[str] = None

class TagUpdate(BaseModel):
    """Model for adding/removing tags (though often handled by specific endpoints)."""
    tag: str # The tag to add or remove

class PromptListResponse(BaseModel):
    """Model for the response when listing prompts."""
    prompts: List[Prompt]