# Prompt Library - Road to Deployment

## Overall Goal:
Transition the `prompt-library` project from its current development state to a deployable, production-ready application with a freemium monetization model.

---

## Phase 1: Core Refinements & Configuration

### Overall Goal for Phase 1:
Address immediate UX improvements, enhance security regarding API key management, and establish robust environment configuration.

### Sub-Phase 1.1: Enhance "New Prompt" Workflow

- 1. [X] Modify UI for "Add New Prompt" to allow users to input:
    - a. [X] Title
    - b. [X] Initial prompt text (for V1)
    - c. [X] Initial notes (for V1)
    - d. [~] Select tags (optional - UI elements for tag name and theme selection added to modal; theme picker pop-out needs robust fix)

- 2. [ ] **NEW TODO**: Revisit and robustly fix `NewPromptModal` tag theme picker UI (currently not displaying correctly despite state changes, likely a CSS stacking/overflow issue).

- 3. [X] Update `apiCreatePrompt` backend endpoint to accept and store this new initial data (title, `initial_version_text`, `initial_version_notes`, tags with themes). *(Verified: Existing backend code already supports this structure).*

- 4. [X] Ensure `App.js` `handleAddNewPrompt` (via `handleSubmitNewPrompt`) is correctly structured to pass all new fields (title, text, notes, tags) from the modal to the API call.

### Sub-Phase 1.2: API Key Management & Security

- 1. [X] **Overall Goal for User API Key Handling:** Securely allow users to manage and use their own LLM API keys for multiple providers, with keys encrypted at rest in a PostgreSQL database and mapped to their Auth0 User ID (`sub`). Keys should never be stored client-side persistently.

- 2. [X] **Database Design & Setup (Backend - PostgreSQL):**
    - a. [X] Design a new SQLAlchemy model (e.g., `UserApiKeyDB`) to store user API keys.
        - i. [X] Columns: `id` (PK), `user_id` (String, indexed, foreign key to Auth0 `sub` indirectly or directly stored), `llm_provider` (String, e.g., "gemini", "openai"), `encrypted_api_key` (LargeBinary or String for Fernet token), `masked_api_key` (String, e.g., "sk-...xxxx"), `created_at`, `updated_at`.
        - ii. [X] Ensure `user_id` + `llm_provider` is unique.
    - b. [X] Generate and apply database migration (Alembic) to create the `user_api_keys` table.
    - c. [X] Ensure a strong, centrally managed Fernet encryption key (`FERNET_KEY`) is loaded securely by the backend (e.g., from environment variables, see Sub-Phase 1.3).

- 3. [X] **Backend CRUD Operations for User API Keys (`crud_api_keys.py` or similar):**
    - a. [X] `create_user_api_key(db, user_id, llm_provider, api_key_plain)`: Encrypts key with Fernet, stores it, returns masked key (returns DB object).
    - b. [X] `get_user_api_keys(db, user_id)`: Returns a list of masked keys for a user (provider, masked_key, id) (returns list of DB objects).
    - c. [X] `get_decrypted_api_key(db, user_id, llm_provider)`: Retrieves and decrypts a specific key for a user and provider (for internal use when proxying calls).
    - d. [X] `update_user_api_key(db, user_id, llm_provider, new_api_key_plain)`: Updates an existing key.
    - e. [X] `delete_user_api_key(db, user_id, llm_provider_or_key_id)`: Deletes a key.

- 4. [X] **Backend API Endpoints for User API Key Management (`routers/user_settings.py` or similar):**
    - a. [X] `POST /user/api-keys`: Accepts `llm_provider` and `api_key_plain`, calls `create_user_api_key`.
    - b. [X] `GET /user/api-keys`: Calls `get_user_api_keys`.
    - c. [X] `PUT /user/api-keys/{llm_provider}`: Accepts `new_api_key_plain`, calls `update_user_api_key`.
    - d. [X] `DELETE /user/api-keys/{llm_provider_or_key_id}`: Calls `delete_user_api_key`.
    - e. [X] Ensure all these endpoints are authenticated using `verify_token` and use the `user_id` (`sub`) from the token.

- 5. [X] **Frontend `SettingsModal.js` Enhancements:**
    - a. [X] UI to list currently configured API keys (provider, masked key, edit/delete buttons).
    - b. [X] UI to add a new API key: select LLM provider (dropdown), input API key.
    - c. [X] UI to edit an existing API key (likely means re-entering it).
    - d. [X] UI to delete an API key.
    - e. [X] Call the new backend API endpoints for these operations.
    - f. [X] Ensure API keys are only held in component state temporarily during submission and not stored in `localStorage` or `sessionStorage`.

- 6. [X] **Backend Playground Integration (`main.py` - `/playground/test`):**
    - a. [X] Modify `/playground/test` to accept an `llm_provider` field in the request.
    - b. [X] Instead of using `settings.GEMINI_API_KEY` directly, fetch the user's decrypted API key for the specified `llm_provider` using `get_decrypted_api_key(user_id_from_token, llm_provider)`.
    - c. [X] If no key found for the user/provider, return an appropriate error.
    - d. [X] Pass the fetched, decrypted key to the relevant LLM service (e.g., `generate_text_from_gemini`, or new ones for other providers).
    - **DONE**: A new `FERNET_KEY` has been generated. User has:
        - Updated `backend/.env` with the new key: `FboeqiKA__DEPTYjzrnwc56pVTc2zugIL2IKVNDaoD8=`
        - Cleared/truncated the `user_api_keys` table (by deleting and recreating `prompt_library.db` via Alembic).
        - Restarted the backend server.
        - Re-added API keys via the application's settings modal.
    - **DONE**: Fixed `AttributeError: 'Settings' object has no attribute 'ENVIRONMENT'` in `backend/src/config.py`.
    - **DONE**: Fixed frontend TypeError `undefined is not an object (evaluating 'userApiKeys.length')` in `SettingsModal.js`.
    - **PENDING USER TEST**: User to confirm core functionality:
        - [X] Test with a valid user-added API key.
        - [X] Test selecting a provider with no user-added API key (expect user-friendly error).
          (Note: UI prevents direct test of this path; backend logic confirmed to handle it.)

- 7. [X] **Developer API Key Override (Backend - Development Mode Only):** (Functionality removed for simplicity. Playground will always use user-specific keys.)

### Sub-Phase 1.3: Environment Configuration
- 1. [X] **Frontend:**
    - a. [X] Create `frontend/.env.example` file documenting `REACT_APP_AUTH0_DOMAIN`, `REACT_APP_AUTH0_CLIENT_ID`, `REACT_APP_AUTH0_AUDIENCE`, and `REACT_APP_API_URL`.
- 2. [X] **Backend:**
    - a. [X] Create a `.env.example` (or equivalent configuration template) in the `backend/` directory documenting all necessary environment variables (database connection strings, Auth0 domain/audience for token validation, managed LLM API keys if applicable here, etc.).

### Sub-Phase 1.4: Error Handling and User Feedback
- 1. [X] Review and standardize error handling messages across the frontend.
- 2. [X] Implement consistent loading indicators for all asynchronous operations in the frontend. (Playground Save, DetailsView busy state, SettingsModal busy states implemented)

---

## Phase 2: Multi-Model AI & Enhanced Playground

### Overall Goal for Phase 2:
Integrate support for multiple AI models in the backend and provide a user interface in the playground for model selection.

### Suxb-Phase 2.1: Backend Multi-Model Support
- 1. [X] Design and implement an abstraction layer or common interface in the backend for interacting with different LLM APIs.
    - **Plan:**
        - Create `BaseLLMProvider` abstract base class with `async def generate_text(self, api_key: str, model_id: str, prompt_text: str)`.
        - Implement `GeminiProvider(BaseLLMProvider)`.
        - Implement `OpenAIProvider(BaseLLMProvider)`.
        - Implement `AnthropicProvider(BaseLLMProvider)`.
        - Create a factory/registry function `get_llm_response(provider_name: str, api_key: str, model_id: str, prompt_text: str)` to dispatch to the correct provider.
- 2. [X] Add backend logic to handle requests for at least two different LLM providers (e.g., OpenAI, Anthropic, Cohere, in addition to Gemini).
    - a. [X] Include configuration for API endpoints and key management for these new models (Implemented `OpenAIProvider` and `AnthropicProvider` in `llm_services.py`).
- 3. [X] Modify the `/playground/test` API endpoint to accept a `model_id` (or similar identifier) to specify which LLM to use.
- 4. [X] Store the `model_id` and `llm_provider` used for a test when a prompt version is saved from the playground.
    - **Note**: This involved significant refactoring of `models.py` (introducing `PromptVersionDB` as the primary version model, adding `version_id_str`), schema definitions, CRUD operations for versions, and a full reset and regeneration of Alembic migrations to ensure a clean and correct database schema.
    - a. [X] **Backend Model:** Add `llm_provider` (String) and `model_id_used` (String, nullable) columns to `PromptVersionDB` in `backend/src/models.py`. (Also added `version_id_str`).
    - b. [X] **Database Migration:** Generate and apply an Alembic migration for the new columns. (Re-initialized all migrations).
    - c. [X] **Backend Schemas:** Add `llm_provider` and `model_id_used` (optional) to `VersionCreate` and `VersionResponse` Pydantic schemas in `backend/src/schemas.py`.
    - d. [X] **Backend CRUD:** Update `crud.create_prompt_version` (now `create_db_version`), `create_db_prompt`, `_map_prompt_db_to_schema`, and `update_db_version_notes` in `backend/src/crud/crud_prompts.py` to accept and save/map these new fields and use `PromptVersionDB`.
    - e. [X] **Backend API:** Modify `POST /prompts/{prompt_id}/versions` endpoint in `routers/prompts.py` (actually `main.py`) to accept and pass these fields from the request body and correctly map the response.
    - f. [X] **Frontend API Service:** Update `apiCreateVersion` in `frontend/src/api.js` to include `llm_provider` and `model_id_used` in the payload. (No change needed in `api.js` itself, change was in the calling components).
    - g. [X] **Frontend State Flow:** 
        - [X] Modify `PlaygroundView.js` `handleSave` to pass `selectedLlmProvider` and `selectedModelId` to `onSaveAsNewVersion`.
        - [X] Update `App.js` `handleSaveAsNewVersion` to accept these parameters and pass them to `apiCreateVersion`.

### Sub-Phase 2.2: Frontend Playground UI for Model Selection
- 1. [X] Add a dropdown or selection component to `PlaygroundView.js` to allow users to choose which AI model to use for testing.
- 2. [X] Update `handleRunTest` in `PlaygroundView.js` (and `App.js`, `api.js`) to pass the selected `model_id` to `apiRunPlaygroundTest`.
- 3. [X] Display the model used for a particular version if that information is available (e.g., in `DetailsView.js`).

---

## Phase 3: Monetization Features (Freemium)

### Overall Goal for Phase 3:
Implement the backend and frontend components necessary for a freemium monetization model.

### Sub-Phase 3.1: Define Tiered Feature Set
- 1. [ ] Finalize specific limits for the Free tier (e.g., number of prompts, versions per prompt, playground tests per month, access to specific models).
- 2. [ ] Define features and benefits for Premium tier(s).

### Sub-Phase 3.2: Backend Monetization Logic
- 1. [ ] Implement user roles/tiers in the backend database.
- 2. [ ] Add logic to track usage against defined limits for free-tier users (e.g., prompt creation, test runs).
- 3. [ ] Integrate with a payment processing service (e.g., Stripe) for handling subscriptions.
    - a. [ ] API endpoints for creating/managing subscriptions.
    - b. [ ] Webhooks to handle payment events.
- 4. [ ] Protect premium features/models, ensuring they are only accessible to subscribed users.

### Sub-Phase 3.3: Frontend Monetization UI
- 1. [ ] Display usage information to users (e.g., "You have X playground tests remaining this month").
- 2. [ ] Create UI components for:
    - a. [ ] Presenting different subscription tiers and their benefits.
    - b. [ ] Handling the upgrade process (redirect to payment provider or use their embedded elements).
    - c. [ ] Allowing users to manage their subscription (if applicable, e.g., view status, cancel).
- 3. [ ] Conditionally render UI elements or enable/disable features based on the user's subscription tier.

---

## Phase 4: Deployment Preparations & Polish

### Overall Goal for Phase 4:
Ensure the application is robust, well-tested, documented, and ready for deployment.

### Sub-Phase 4.1: Testing
- 1. [ ] **Frontend:**
    - a. [ ] Expand unit test coverage for React components and utility functions.
    - b. [ ] Write integration tests for key user flows (e.g., creating a prompt, running a test, upgrading subscription).
- 2. [ ] **Backend:**
    - a. [ ] Ensure comprehensive unit and integration test coverage for API endpoints and business logic.
- 3. [ ] Conduct end-to-end testing of the entire application.

### Sub-Phase 4.2: Documentation
- 1. [ ] Review and update any existing READMEs.
- 2. [ ] Create user-facing documentation or FAQs if necessary.
- 3. [ ] Ensure deployment steps are documented.

### Sub-Phase 4.3: Final UI/UX Polish
- 1. [ ] Conduct a final review of the UI for consistency and ease of use.
- 2. [ ] Perform an accessibility (A11y) review and address any critical issues.

### Sub-Phase 4.4: Deployment Setup
- 1. [ ] Choose hosting providers for frontend and backend.
- 2. [ ] Configure build pipelines (CI/CD) for automated testing and deployment.
- 3. [ ] Set up production environment configurations (secrets, database connections, etc.).
- 4. [ ] Implement basic monitoring, logging, and alerting for the production environment.

--- 