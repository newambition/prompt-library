# Defines SQLAlchemy ORM models corresponding to database tables

from sqlalchemy import (
    create_engine, Column, Integer, String, Text, ForeignKey, JSON, Index, DateTime, func, LargeBinary, Boolean
)
from sqlalchemy.orm import relationship, declarative_base, Mapped, mapped_column
from sqlalchemy.ext.mutable import MutableDict # Needed for JSON mutation tracking
from typing import List, Optional
import datetime # Add this import

from .database import Base # Import Base from database.py

# --- SQLAlchemy Models ---

class User(Base):
    __tablename__ = 'userdb'

    user_id = Column(Integer, primary_key=True, index=True)
    auth0_id = Column(String(255), unique=True, nullable=False) # Auth0 user id
    email = Column(String(255), unique=False, nullable=True) # Auth0 email - make nullable and non-unique
    username = Column(String(100), unique=False, nullable=True) # Auth0 username - make non-unique
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    tier = Column(String(100), nullable=False) # e.g., "free", "pro"
    subscription_status = Column(String(100), nullable=False) # e.g., "active", "cancelled"
    subscription_start_date = Column(DateTime(timezone=True), nullable=True) # e.g., "2025-01-01 00:00:00"
    subscription_end_date = Column(DateTime(timezone=True), nullable=True) # e.g., "2025-01-01 00:00:00"
    stripe_customer_id = Column(String(255), nullable=True) # Stripe customer id
    has_seen_paywall_modal = Column(Boolean, nullable=False, default=False) # Track if user has seen tier selection modal

class PromptDB(Base):
    """SQLAlchemy model for the 'prompts' table."""
    __tablename__ = "prompts"

    # Use Mapped for modern SQLAlchemy type hinting
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    prompt_id: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False) # e.g., "prompt1"
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("userdb.user_id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String, index=True, nullable=False)
    # Store tags as a JSON list for simplicity with SQLite/Postgres
    # For complex tag querying, a separate Tag table and many-to-many relationship is better
    tags: Mapped[list] = mapped_column(JSON, nullable=False, default=[])
    latest_version: Mapped[str] = mapped_column(String, nullable=False) # e.g., "v3"

    # Relationship to versions (one-to-many)
    # 'cascade="all, delete-orphan"' means versions are deleted when the prompt is deleted
    versions: Mapped[List["PromptVersionDB"]] = relationship(
        "PromptVersionDB",
        back_populates="prompt",
        cascade="all, delete-orphan",
        foreign_keys="[PromptVersionDB.prompt_id]"
    )

    # Add an index for searching by title
    __table_args__ = (
        Index('ix_prompt_title', 'title'),
        Index('ix_prompt_user_id', 'user_id'),
        {"extend_existing": True}
    )

class UserApiKeyDB(Base):
    __tablename__ = "user_api_keys"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("userdb.user_id", ondelete="CASCADE"), nullable=False)
    llm_provider: Mapped[str] = mapped_column(String, nullable=False) # e.g., "gemini", "openai"
    encrypted_api_key: Mapped[bytes] = mapped_column(LargeBinary, nullable=False)
    masked_api_key: Mapped[str] = mapped_column(String, nullable=False) # e.g., "sk-...xxxx"
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        Index('ix_user_api_key_user_id_llm_provider', 'user_id', 'llm_provider', unique=True),
    )

class PromptVersionDB(Base):
    __tablename__ = "prompt_versions"

    id = Column(Integer, primary_key=True, index=True)
    prompt_id = Column(Integer, ForeignKey("prompts.id"))
    user_id = Column(Integer, ForeignKey("userdb.user_id", ondelete="CASCADE"), nullable=False)
    version_number = Column(Integer, nullable=False)
    version_id_str = Column(String, index=True, nullable=False)
    text = Column(Text, nullable=False)
    notes = Column(Text, nullable=True)
    llm_provider = Column(String, nullable=True)
    model_id_used = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    prompt = relationship(
        "PromptDB",
        back_populates="versions",
        foreign_keys="[PromptVersionDB.prompt_id]"
    )
