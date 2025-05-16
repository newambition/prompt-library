# Defines SQLAlchemy ORM models corresponding to database tables

from sqlalchemy import (
    create_engine, Column, Integer, String, Text, ForeignKey, JSON, Index
)
from sqlalchemy.orm import relationship, declarative_base, Mapped, mapped_column
from sqlalchemy.ext.mutable import MutableDict # Needed for JSON mutation tracking
from typing import List, Optional

from database import Base # Import Base from database.py

# --- SQLAlchemy Models ---

class PromptDB(Base):
    """SQLAlchemy model for the 'prompts' table."""
    __tablename__ = "prompts"

    # Use Mapped for modern SQLAlchemy type hinting
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    prompt_id: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False) # e.g., "prompt1"
    title: Mapped[str] = mapped_column(String, index=True, nullable=False)
    # Store tags as a JSON list for simplicity with SQLite/Postgres
    # For complex tag querying, a separate Tag table and many-to-many relationship is better
    tags: Mapped[list] = mapped_column(JSON, nullable=False, default=[])
    latest_version: Mapped[str] = mapped_column(String, nullable=False) # e.g., "v3"

    # Relationship to versions (one-to-many)
    # 'cascade="all, delete-orphan"' means versions are deleted when the prompt is deleted
    versions: Mapped[List["VersionDB"]] = relationship("VersionDB", back_populates="prompt", cascade="all, delete-orphan")

    # Add an index for searching by title
    __table_args__ = (
        Index('ix_prompt_title', 'title'),
        {"extend_existing": True}
    )

class VersionDB(Base):
    """SQLAlchemy model for the 'versions' table."""
    __tablename__ = "versions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    version_id: Mapped[str] = mapped_column(String, index=True, nullable=False) # e.g., "v1"
    date: Mapped[str] = mapped_column(String, nullable=False) # Store as YYYY-MM-DD string
    text: Mapped[str] = mapped_column(Text, nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Foreign key relationship to the prompts table
    prompt_db_id: Mapped[int] = mapped_column(Integer, ForeignKey("prompts.id"), nullable=False)

    # Relationship back to the prompt (many-to-one)
    prompt: Mapped["PromptDB"] = relationship("PromptDB", back_populates="versions")

    # Add an index for the foreign key and version_id for faster lookups
    __table_args__ = (Index('ix_version_prompt_id_version_id', 'prompt_db_id', 'version_id', unique=True),)

# Note: We are storing versions directly related to a prompt.
# The 'versions' dictionary and 'latest_version' string in the Pydantic 'Prompt' schema
# will be constructed dynamically from these related VersionDB objects in the CRUD layer.
