from logging.config import fileConfig
import os
import sys

# Add src/ to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../src')))
# Add project root to sys.path
project_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, project_dir)

# --- Import models and set target_metadata --- 
try:
    from src import models # This will execute models.py, which imports Base and defines tables
except ImportError as e:
    print(f"Error importing src.models: {e}") # Keep this error print for actual import issues
    print("Ensure models.py is accessible in the Python path.")
    sys.exit(1)

from sqlalchemy import engine_from_config
from sqlalchemy import pool
from alembic import context

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

if hasattr(models, 'Base') and hasattr(models.Base, 'metadata'):
    target_metadata = models.Base.metadata
else:
    # This case should ideally not be reached if models.py and database.py are correct
    print("ERROR: Could not find Base.metadata via src.models. Attempting fallback to src.database.Base.")
    try:
        from src.database import Base as DatabaseBase
        target_metadata = DatabaseBase.metadata
    except Exception as e_db_base:
        print(f"CRITICAL ERROR: Could not get SQLAlchemy metadata for autogenerate: {e_db_base}")
        target_metadata = None


def run_migrations_offline() -> None:
    url = os.environ.get("DATABASE_URL")
    if not url:
        raise RuntimeError("DATABASE_URL environment variable not set")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        render_as_batch=True if url and url.startswith("sqlite") else False
    )
    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    url = os.environ.get("DATABASE_URL")
    if not url:
        raise RuntimeError("DATABASE_URL environment variable not set")
    connectable = engine_from_config(
        {"sqlalchemy.url": url},
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata,
            render_as_batch=True if connectable.url and connectable.url.drivername == "sqlite" else False
        )
        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
