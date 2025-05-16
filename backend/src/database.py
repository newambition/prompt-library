# database.py
# Handles SQLAlchemy database connection setup and session management.

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from src import models  # We will inherit from this class to create each of the ORM models (in models.py).

# --- Database URL Configuration ---
# Use SQLite for local development (creates a file named prompt_library.db)
SQLALCHEMY_DATABASE_URL = "sqlite:///./prompt_library.db"

# Example for PostgreSQL (uncomment and configure if using Postgres)
# Make sure you have installed 'psycopg2-binary': pip install psycopg2-binary
# SQLALCHEMY_DATABASE_URL = "postgresql://user:password@host:port/database_name"
# Example: SQLALCHEMY_DATABASE_URL = "postgresql://postgres:mysecretpassword@localhost:5432/promptdb"

# --- SQLAlchemy Engine Setup ---
# 'connect_args' is needed only for SQLite to allow multi-threaded access
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False} if SQLALCHEMY_DATABASE_URL.startswith("sqlite") else {}
    # Add echo=True for debugging SQL statements (optional)
    # echo=True
)

# --- SQLAlchemy Session Factory ---
# Each instance of SessionLocal will be a database session.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# --- SQLAlchemy Base Class ---
# We will inherit from this class to create each of the ORM models (in models.py).
Base = declarative_base()

# --- Dependency for FastAPI Endpoints ---
def get_db():
    """
    FastAPI dependency that provides a SQLAlchemy database session per request.
    Ensures the session is always closed, even if errors occur.
    """
    db: Session = SessionLocal()
    try:
        yield db # Provide the session to the endpoint function
    finally:
        db.close() # Close the session after the request is finished

# --- Function to Create Database Tables ---
# This is typically handled by migration tools like Alembic in production,
# but can be useful for initial setup or simple cases.
def create_database_tables():
    """Creates all database tables defined by models inheriting from Base."""
    print("Attempting to create database tables...")
    try:
        # Import models here to ensure Base has metadata
        from src import models # noqa: F401 (ignore unused import warning)
        Base.metadata.create_all(bind=engine)
        print("Database tables created successfully (if they didn't exist).")
    except Exception as e:
        print(f"Error creating database tables: {e}")

# You might call create_database_tables() once during application startup
# in main.py, or preferably use Alembic for managing schema changes.
# For example, in main.py:
# from database import create_database_tables
# @app.on_event("startup")
# async def startup_event():
#     create_database_tables()

