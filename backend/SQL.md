# Backend SQL & API Guide

## Architecture Overview
- **Frameworks:** FastAPI (API), SQLAlchemy (ORM), Alembic (migrations)
- **Structure:**
  - `src/models.py`: SQLAlchemy ORM models (PromptDB, VersionDB)
  - `src/schemas.py`: Pydantic schemas for request/response validation
  - `src/crud.py`: CRUD logic for database operations
  - `src/database.py`: DB connection, session, and Base
  - `src/main.py`: FastAPI app and API endpoints
  - `alembic/`: Alembic migration scripts and config
- **Database:** SQLite (default, see `database.py` for config)

## How to Run & Develop
1. **Install dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```
2. **Run migrations (creates DB tables):**
   ```bash
   alembic upgrade head
   ```
3. **Start the server:**
   ```bash
   PYTHONPATH=src uvicorn src.main:app --reload
   ```
4. **API docs:**
   - Open [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

## Database Migrations (Alembic)
- **Create new migration after model changes:**
  ```bash
  alembic revision --autogenerate -m "Describe your change"
  alembic upgrade head
  ```
- **Alembic config:**
  - `alembic.ini` points to the SQLite DB
  - `alembic/env.py` imports `Base` from `src.database`

## Troubleshooting
- **Table already defined / InvalidRequestError:**
  - Ensure all imports use `from src import models` and `from src.database import Base`
  - Delete all `.pyc` files and `__pycache__` folders in `src/` and `alembic/`
  - Remove `prompt_library.db` and re-run migrations
- **ModuleNotFoundError:**
  - Always run with `PYTHONPATH=src` from the `backend` directory
- **Migrations not reflecting model changes:**
  - Check `alembic/env.py` imports `Base` from `src.database`
  - Run `alembic revision --autogenerate -m "..."` and `alembic upgrade head`
- **General tips:**
  - Restart the server after DB/model changes
  - Use the interactive docs to test endpoints

---
For further help, see FastAPI, SQLAlchemy, and Alembic documentation. 