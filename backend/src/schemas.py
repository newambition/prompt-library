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
    llm_provider: Optional[str] = None
    model_id_used: Optional[str] = None

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
    llm_provider: str = Field(..., description="The LLM provider to use for this test (e.g., 'gemini', 'openai')")
    # user_api_key: Optional[str] = None
    model_id: str = Field(..., description="The specific model ID to use for the selected provider (e.g., 'gemini-1.5-flash', 'gpt-4')")

class PlaygroundResponse(BaseModel):
    """Response model for the playground endpoint."""
    output_text: Optional[str] = None
    error: Optional[str] = None


# --- User API Key Schemas ---
class UserApiKeyBase(BaseModel):
    llm_provider: str = Field(..., description="The name of the LLM provider (e.g., 'gemini', 'openai')")

class UserApiKeyCreate(UserApiKeyBase):
    api_key_plain: str = Field(..., description="The plain text API key")

class UserApiKeyUpdate(BaseModel):
    new_api_key_plain: str = Field(..., description="The new plain text API key")

class UserApiKey(UserApiKeyBase):
    id: int
    masked_api_key: str
    created_at: datetime.datetime
    updated_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)


# --- User Schemas ---
class UserBase(BaseModel):
    email: Optional[str] = None
    username: Optional[str] = None

class UserCreate(UserBase):
    auth0_id: str

class User(UserBase):
    user_id: int
    auth0_id: str
    tier: str
    subscription_status: str
    subscription_start_date: Optional[datetime.datetime] = None
    subscription_end_date: Optional[datetime.datetime] = None
    stripe_customer_id: Optional[str] = None
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)


# --- Stripe Schemas ---
class StripeCheckoutRequest(BaseModel):
    price_id: str = Field(..., description="Stripe price ID for the subscription")
    success_url: Optional[str] = None
    cancel_url: Optional[str] = None

class StripeCheckoutResponse(BaseModel):
    checkout_url: str

class StripeCustomerPortalRequest(BaseModel):
    return_url: Optional[str] = None

class StripeCustomerPortalResponse(BaseModel):
    portal_url: str

class StripeWebhookEvent(BaseModel):
    """Schema for incoming Stripe webhook events"""
    id: str
    type: str
    data: Dict
    created: int

# --- Tier and Limits Schemas ---
class UserTierInfo(BaseModel):
    tier: str
    subscription_status: str
    prompt_count: int
    prompt_limit: Optional[int] = None  # None means unlimited
    can_create_prompt: bool
    can_create_version: bool

class TierLimits(BaseModel):
    max_prompts: Optional[int] = None  # None means unlimited
    max_versions_per_prompt: Optional[int] = None  # None means unlimited

