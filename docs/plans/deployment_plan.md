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

- 5. [ ] **Frontend `SettingsModal.js` Enhancements:**
    - a. [ ] UI to list currently configured API keys (provider, masked key, edit/delete buttons).
    - b. [ ] UI to add a new API key: select LLM provider (dropdown), input API key.
    - c. [ ] UI to edit an existing API key (likely means re-entering it).
    - d. [ ] UI to delete an API key.
    - e. [ ] Call the new backend API endpoints for these operations.
    - f. [ ] Ensure API keys are only held in component state temporarily during submission and not stored in `localStorage` or `sessionStorage`.

- 6. [ ] **Backend Playground Integration (`main.py` - `/playground/test`):**
    - a. [ ] Modify `/playground/test` to accept an `llm_provider` field in the request.
    - b. [ ] Instead of using `settings.GEMINI_API_KEY` directly, fetch the user\'s decrypted API key for the specified `llm_provider` using `get_decrypted_api_key(user_id_from_token, llm_provider)`.
    - c. [ ] If no key found for the user/provider, return an appropriate error.
    - d. [ ] Pass the fetched, decrypted key to the relevant LLM service (e.g., `generate_text_from_gemini`, or new ones for other providers).

- 7. [ ] **Developer API Key Override (Backend - Development Mode Only):**
    - a. [ ] **Verify/Refine:** Current implementation in `/playground/test` uses `settings.GEMINI_API_KEY`.
    - b. [ ] Ensure this developer override is clearly documented and strictly limited to non-production environments. Perhaps by checking an `ENVIRONMENT` variable.
    - c. [ ] When dev override is active, it should bypass the user-specific key fetching for the playground for easier backend testing.

### Sub-Phase 1.3: Environment Configuration
- 1. [X] **Frontend:**
    - a. [X] Create `frontend/.env.example` file documenting `REACT_APP_AUTH0_DOMAIN`, `REACT_APP_AUTH0_CLIENT_ID`, `REACT_APP_AUTH0_AUDIENCE`, and `REACT_APP_API_URL`.
- 2. [X] **Backend:**
    - a. [X] Create a `.env.example` (or equivalent configuration template) in the `backend/` directory documenting all necessary environment variables (database connection strings, Auth0 domain/audience for token validation, managed LLM API keys if applicable here, etc.).

### Sub-Phase 1.4: Error Handling and User Feedback
- 1. [ ] Review and standardize error handling messages across the frontend.
- 2. [ ] Implement consistent loading indicators for all asynchronous operations in the frontend.

---

## Phase 2: Multi-Model AI & Enhanced Playground

### Overall Goal for Phase 2:
Integrate support for multiple AI models in the backend and provide a user interface in the playground for model selection.

### Sub-Phase 2.1: Backend Multi-Model Support
- 1. [ ] Design and implement an abstraction layer or common interface in the backend for interacting with different LLM APIs.
- 2. [ ] Add backend logic to handle requests for at least two different LLM providers (e.g., OpenAI, Anthropic, Cohere, in addition to Gemini).
    - a. [ ] Include configuration for API endpoints and key management for these new models.
- 3. [ ] Modify the `/playground/test` API endpoint to accept a `model_id` (or similar identifier) to specify which LLM to use.
- 4. [ ] Store the `model_id` used for a test when a prompt version is saved from the playground.

### Sub-Phase 2.2: Frontend Playground UI for Model Selection
- 1. [ ] Add a dropdown or selection component to `PlaygroundView.js` to allow users to choose which AI model to use for testing.
- 2. [ ] Update `handleRunTest` in `PlaygroundView.js` to pass the selected `model_id` to `apiRunPlaygroundTest`.
- 3. [ ] Display the model used for a particular version if that information is available (e.g., in `DetailsView.js`).

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