# backend/src/schemas.py
# Defines Pydantic models for data validation and serialization

from pydantic import BaseModel, Field, ConfigDict
from typing import List, Dict, Optional
import datetime

# --- Tag Schemas ---
class TagBase(BaseModel):
    name: str
    color: str

class TagCreate(TagBase):
    pass

class Tag(TagBase):
    model_config = ConfigDict(from_attributes=True)


# --- Version Schemas ---
class VersionBase(BaseModel):
    text: str
    notes: Optional[str] = None

class Version(VersionBase):
    id: int
    version_id: str
    date: str
    model_config = ConfigDict(from_attributes=True)


# --- Prompt Schemas ---
class PromptBase(BaseModel):
    title: str
    tags: List[TagCreate] = []

class PromptCreate(PromptBase):
    initial_version_text: str
    initial_version_notes: Optional[str] = None

class Prompt(PromptBase):
    id: str
    versions: Dict[str, Version] = {}
    latest_version: str
    tags: List[Tag] = []
    model_config = ConfigDict(from_attributes=True)


# --- Request/Response Models for Specific Operations ---
class PromptUpdate(BaseModel):
    title: Optional[str] = None
    tags: Optional[List[TagCreate]] = None

class VersionCreate(VersionBase):
    pass

class NoteUpdate(BaseModel):
    notes: Optional[str] = None

class SingleTagAdd(TagCreate):
    pass

class PromptListResponse(BaseModel):
    prompts: List[Prompt]

# --- Playground Schemas ---
class PlaygroundRequest(BaseModel):
    """Request model for the playground endpoint."""
    prompt_text: str
    # In the future, you might add user_api_key here if backend is to use it
    # user_api_key: Optional[str] = None

class PlaygroundResponse(BaseModel):
    """Response model for the playground endpoint."""
    output_text: Optional[str] = None
    error: Optional[str] = None

