# --- Setup ---
import os
# Ensure PYTHONPATH is set if running from a script, or ensure your CWD allows src imports
# For interactive shell from `backend` directory, direct imports should work if venv is active.
# If not, you might need:
# import sys
# sys.path.insert(0, os.path.abspath('.')) # or os.path.abspath('./src')

from sqlalchemy.orm import Session
from src.database import SessionLocal, engine, Base
from src.models import UserApiKeyDB # To inspect results
from src.crud.crud_api_keys import (
    create_user_api_key,
    get_user_api_keys,
    get_decrypted_api_key,
    update_user_api_key,
    delete_user_api_key
)
from src.config import settings # To verify FERNET_KEY is loaded

# (Optional) Create tables if they don't exist - Alembic should handle this, but for isolated testing:
# Base.metadata.create_all(bind=engine)

# Get a DB session
db: Session = SessionLocal()

# --- Test Data ---
test_user_id = "auth0|testuser123"
test_provider_gemini = "Gemini"
test_api_key_gemini_plain = "test_gemini_api_key_string_12345"
test_provider_openai = "OpenAI"
test_api_key_openai_plain = "sk-test_openai_api_key_string_67890"

# --- 0. Verify Fernet Key (Optional but recommended first) ---
print(f"FERNET_KEY is set: {bool(settings.FERNET_KEY)}")
if not settings.FERNET_KEY:
    print("CRITICAL: FERNET_KEY is not set in .env. Please set it before proceeding.")
    db.close()
    exit()

# --- 1. Test `create_user_api_key` ---
print("\\n--- Testing create_user_api_key ---")
# Clean up any existing test data first (optional, good for rerunning tests)
existing_keys_gemini = db.query(UserApiKeyDB).filter(UserApiKeyDB.user_id == test_user_id, UserApiKeyDB.llm_provider == test_provider_gemini.lower()).all()
for k in existing_keys_gemini: db.delete(k)
existing_keys_openai = db.query(UserApiKeyDB).filter(UserApiKeyDB.user_id == test_user_id, UserApiKeyDB.llm_provider == test_provider_openai.lower()).all()
for k in existing_keys_openai: db.delete(k)
db.commit()

created_key_gemini = create_user_api_key(db, test_user_id, test_provider_gemini, test_api_key_gemini_plain)
print(f"Created Gemini Key ID: {created_key_gemini.id}, Provider: {created_key_gemini.llm_provider}, Masked: {created_key_gemini.masked_api_key}")
assert created_key_gemini.user_id == test_user_id
assert created_key_gemini.llm_provider == test_provider_gemini.lower()
assert "..." in created_key_gemini.masked_api_key

created_key_openai = create_user_api_key(db, test_user_id, test_provider_openai, test_api_key_openai_plain)
print(f"Created OpenAI Key ID: {created_key_openai.id}, Provider: {created_key_openai.llm_provider}, Masked: {created_key_openai.masked_api_key}")

# --- 2. Test `get_user_api_keys` ---
print("\\n--- Testing get_user_api_keys ---")
user_keys = get_user_api_keys(db, test_user_id)
print(f"Found {len(user_keys)} keys for user {test_user_id}:")
for key_obj in user_keys:
    print(f"  ID: {key_obj.id}, Provider: {key_obj.llm_provider}, Masked: {key_obj.masked_api_key}, Created: {key_obj.created_at}")
assert len(user_keys) == 2

# --- 3. Test `get_decrypted_api_key` ---
print("\\n--- Testing get_decrypted_api_key ---")
decrypted_gemini = get_decrypted_api_key(db, test_user_id, test_provider_gemini)
print(f"Decrypted Gemini Key: {decrypted_gemini}")
assert decrypted_gemini == test_api_key_gemini_plain

decrypted_openai = get_decrypted_api_key(db, test_user_id, test_provider_openai.lower()) # Test with lowercase provider
print(f"Decrypted OpenAI Key (using lowercase provider for lookup): {decrypted_openai}")
assert decrypted_openai == test_api_key_openai_plain

non_existent_key = get_decrypted_api_key(db, test_user_id, "NonExistentProvider")
print(f"Decrypted NonExistentProvider Key: {non_existent_key}")
assert non_existent_key is None

# --- 4. Test `update_user_api_key` ---
print("\\n--- Testing update_user_api_key ---")
new_gemini_key_plain = "new_gemini_key_78901"

# Capture the timestamp BEFORE the update from the object we have
# Ensure created_key_gemini is refreshed to get its initial updated_at accurately from DB post-creation
# This might not be strictly necessary if server_default for updated_at is reliable on creation,
# but doesn't hurt for test robustness.
db.refresh(created_key_gemini) 
timestamp_before_update = created_key_gemini.updated_at

updated_gemini_key_obj = update_user_api_key(db, test_user_id, test_provider_gemini, new_gemini_key_plain)
print(f"Updated Gemini Key ID: {updated_gemini_key_obj.id}, Masked: {updated_gemini_key_obj.masked_api_key}, UpdatedAt: {updated_gemini_key_obj.updated_at}")
assert "..." in updated_gemini_key_obj.masked_api_key
decrypted_after_update = get_decrypted_api_key(db, test_user_id, test_provider_gemini)
print(f"Decrypted Gemini Key after update: {decrypted_after_update}")
assert decrypted_after_update == new_gemini_key_plain

# Now compare the captured old timestamp with the new one from the updated object
assert timestamp_before_update != updated_gemini_key_obj.updated_at # Check timestamp changed

# Test update for non-existent key
updated_non_existent = update_user_api_key(db, test_user_id, "NonExistentProvider", "somekey")
print(f"Update NonExistentProvider Key: {updated_non_existent}")
assert updated_non_existent is None

# --- 5. Test `delete_user_api_key` ---
print("\\n--- Testing delete_user_api_key ---")
# Delete by provider name
deleted_openai_result = delete_user_api_key(db, test_user_id, test_provider_openai)
print(f"Deletion of OpenAI key by provider name successful: {deleted_openai_result}")
assert deleted_openai_result is True
assert get_decrypted_api_key(db, test_user_id, test_provider_openai) is None
user_keys_after_openai_delete = get_user_api_keys(db, test_user_id)
assert len(user_keys_after_openai_delete) == 1

# Delete by ID
gemini_key_id_to_delete = created_key_gemini.id # Use the ID from the initially created Gemini key
deleted_gemini_result = delete_user_api_key(db, test_user_id, gemini_key_id_to_delete)
print(f"Deletion of Gemini key by ID ({gemini_key_id_to_delete}) successful: {deleted_gemini_result}")
assert deleted_gemini_result is True
assert get_decrypted_api_key(db, test_user_id, test_provider_gemini) is None
user_keys_after_all_deletes = get_user_api_keys(db, test_user_id)
assert len(user_keys_after_all_deletes) == 0

# Test delete non-existent
deleted_non_existent_provider = delete_user_api_key(db, test_user_id, "NoSuchProvider")
print(f"Deletion of non-existent provider key successful: {deleted_non_existent_provider}")
assert deleted_non_existent_provider is False

deleted_non_existent_id = delete_user_api_key(db, test_user_id, 99999) # Assuming 99999 is a non-existent ID
print(f"Deletion of non-existent ID key successful: {deleted_non_existent_id}")
assert deleted_non_existent_id is False


# --- Clean up session ---
print("\\n--- Tests Complete ---")
db.close()
