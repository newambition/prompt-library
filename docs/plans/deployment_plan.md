# Prompt Library - Road to Deployment

## Overall Goal:
Transition the `prompt-library` project from its current development state to a deployable, production-ready application with a freemium monetization model.

---

## Completed Milestones Summary

### Phase 1: Core Refinements & Configuration (MVP Baseline)
* **Enhanced "New Prompt" Workflow:** UI for "Add New Prompt" allows input for Title, Initial prompt text, Initial notes, and optional tags. Backend and frontend logic supports these fields.
* **API Key Management & Security:** Secure system for users to manage their LLM API keys implemented.
    * **Database Schema:** `UserApiKeyDB` model and Alembic migration created for `user_api_keys` table with Fernet encrypted API keys.
    * **Backend CRUD & API:** Authenticated CRUD operations and API endpoints for user API key management established.
    * **Frontend Settings:** `SettingsModal.js` allows users to manage API keys without client-side persistent storage.
    * **Playground Integration:** `/playground/test` endpoint uses user-specific, decrypted API keys.
* **Environment Configuration:** `.env.example` files created for both frontend and backend.
* **Error Handling & User Feedback:** Standardized error messages and loading indicators implemented.

### Phase 2: Multi-Model AI & Enhanced Playground (MVP Baseline)
* **Backend Multi-Model Support:** Abstraction layer and implementations for multiple LLM providers (Gemini, OpenAI, Anthropic) created. `/playground/test` endpoint supports `model_id`. `llm_provider` and `model_id_used` stored with prompt versions.
* **Frontend Playground UI for Model Selection:** UI for model selection in `PlaygroundView.js` and display of model used in `DetailsView.js` implemented.

---

## Phase 3 (MVP Focus): Monetization & Production Database Setup

### Overall Goal for Phase 3:
Implement the freemium monetization model using Stripe Billing and configure the production database with Neon, ensuring all existing functionality is stable with these integrations.

### Sub-Phase 3.1: Production Database Setup (Neon)
**STATUS: COMPLETED ✅**

- 1. [X] **Neon Account & Project Setup:**
    - a. [X] Create a Neon account and set up a new project for the application.
    - b. [X] Obtain the PostgreSQL connection string for the production database.
- 2. [X] **Backend Configuration for Neon:**
    - a. [X] Update backend environment configuration (`DATABASE_URL`) to use the Neon connection string in the production environment. Ensure `.env.example` reflects this variable.
    - b. [X] Test backend connectivity to the Neon database.
- 3. [X] **Initial Schema Migration to Neon:**
    - a. [X] Run Alembic migrations against the Neon production database to create all necessary tables (ensure Alembic is configured to use the production `DATABASE_URL`).
    - b. [X] Verify schema integrity in the Neon database.
- 3c. [X] **Remove Redundant Local Database Logic:**
    - a. [X] Remove or comment out SQLite-specific connection strings and logic from `database.py`.
    - b. [X] Remove or comment out the `create_database_tables()` function and any calls to it.
    - c. [X] Delete any local SQLite DB files (e.g., `prompt_library.db`) from the project directory.
    - d. [X] Ensure all environments use PostgreSQL via `DATABASE_URL`.
- 3d. [X] **User-Specific Data Isolation:**
    - a. [X] Add `user_id` columns to `prompts` and `prompt_versions` tables via Alembic migration.
    - b. [X] Update all CRUD functions in `crud_prompts.py` to filter by `user_id`.
    - c. [X] Update all API endpoints in `main.py` to extract `user_id` from authenticated user token and pass to CRUD functions.
    - d. [X] Verify complete data isolation between users for prompts, versions, and API keys.
- 4. [X] **Security Considerations for Neon:**
    - a. [X] Ensure SSL/TLS is enforced for connections to Neon.
    - b. [X] Configure appropriate IP allow lists if necessary/available in Neon settings.
    - c. [X] Regularly review Neon's security recommendations and apply them.
   
    **Summary of Completed Work:**
- Production database successfully configured with Neon PostgreSQL
- Complete user data isolation implemented and tested
- User-specific prompt IDs with hash prefixes prevent conflicts between users
- All CRUD operations filter by user_id ensuring complete data separation
- Database schema managed via Alembic migrations
- SSL/TLS enforced for secure connections

---

### Sub-Phase 3.2: Monetization Implementation (Stripe Billing)
- 1. [ ] **Finalize Tier Definitions [subs]:**
    - a. [ ] Confirm Free and Pro tier limits and benefits as defined in [subs].
    - b. [ ] Define how Pro-tier usage limits (e.g., for future AI evaluation tool) will be tracked, even if the tool itself is deferred. (This is for future-proofing the subscription logic).
- 2. [ ] **User Roles/Tiers in Local DB:**
    - a. [ ] Ensure `UserDB` model has `tier` (e.g., "free", "pro"), `subscription_status` (e.g., "active", "canceled", "past_due"), and `stripe_customer_id` columns.
    - b. [ ] Apply necessary Alembic migration if changes are needed.
- 3. [ ] **Stripe Billing Integration:**
    - a. [ ] **Stripe Account & Product Setup:** Set up Stripe account. Configure "Pro Tier" product and corresponding pricing plans (monthly, annually) in the Stripe dashboard.
    - b. [ ] **Backend API Endpoints for Stripe:**
        - i. [ ] Implement `POST /checkout/create-stripe-session`: Creates a Stripe Checkout session for new subscriptions.
        - ii. [ ] Implement `POST /stripe-webhooks`: Handles essential webhook events from Stripe (e.g., `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.updated`, `customer.subscription.deleted`) to update `UserDB` (`tier`, `subscription_status`, `stripe_customer_id`). Crucially, verify webhook signatures.
        - iii. [ ] Implement `POST /billing/create-customer-portal-session`: Creates a Stripe Billing Customer Portal session for users to manage their subscriptions.
    - c. [ ] **Environment Variables:** Securely manage Stripe API keys (publishable, secret) and webhook signing secret. Add to `.env.example`.
- 4. [ ] **Premium Feature Gating Logic (Backend):**
    - a. [ ] Implement/verify decorators or middleware to check user's `tier` and `subscription_status` from the local DB before allowing access to features intended only for "Pro" users (even if those specific features are deferred to "Future Features," the gating mechanism for *current* differences like unlimited prompts should be in place).
- 5. [ ] **Rate Limiting/Abuse Prevention (Free Tier Enforcement):**
    - a. [ ] Implement backend enforcement of free tier limits (e.g., 20 prompts per user, 3 versions per prompt). Ensure these limits are tested and cannot be bypassed via the API.
    - b. [ ] Add automated and/or manual tests to verify enforcement of these limits and prevent abuse (e.g., attempts to create more than allowed prompts/versions).
- 6. [ ] **Frontend Monetization UI:**
    - a. [ ] **Tier Presentation:** UI to display Free and Pro tiers with their benefits [subs].
    - b. [ ] **Upgrade/Manage Subscription Flow:**
        - i. [ ] Buttons/links to initiate upgrade (calls `/checkout/create-stripe-session`, redirects to Stripe).
        - ii. [ ] Button/link to manage subscription (calls `/billing/create-customer-portal-session`, redirects to Stripe Customer Portal).
        - iii. [ ] Clear display of current subscription status.
    - c. [ ] **Conditional UI Rendering:** UI elements should adapt based on user tier (e.g., prompts for upgrade, visual distinction of Pro status).
- 7. [ ] **User Experience for Downgrade/Upgrade:**
    - a. [ ] Define and implement backend logic for what happens when a user's subscription lapses (e.g., downgrade to free tier, enforcement of free tier limits, handling of excess prompts/versions).
    - b. [ ] Ensure the frontend clearly communicates changes in subscription status, including downgrade scenarios, and provides appropriate messaging and UI states for users who lose Pro access.

---

## Phase 4 (MVP Focus): Deployment Preparations & Polish

### Overall Goal for Phase 4:
Ensure the MVP application is robust, secure, well-tested, documented, and ready for initial deployment.

### Sub-Phase 4.1: Final Security Review & Hardening
- 1. [ ] **API Key Security:** Re-verify that LLM API keys are encrypted at rest (Fernet key management) and never exposed client-side.
- 2. [ ] **Authentication & Authorization:** Ensure all backend endpoints are properly protected using `verify_token` and that tier-based feature access is correctly enforced.
- 3. [ ] **Input Validation:** Review all API endpoints for robust input validation to prevent common vulnerabilities (e.g., SQL injection (via ORM), XSS (less likely with FastAPI returning JSON, but good to be mindful)).
- 4. [ ] **Dependency Audit:** Check for known vulnerabilities in frontend and backend dependencies. Update critical packages.
- 5. [ ] **Secrets Management:** Confirm all secrets (DB connection strings, API keys, Stripe keys, Fernet key, Auth0 secrets) are managed via environment variables and not hardcoded. Ensure `.env.example` files are accurate and do not contain real secrets.
- 6. [ ] **CORS Configuration:** Ensure CORS is configured correctly and not overly permissive for the production environment.
- 7. [ ] **Stripe Webhook Security:** Double-check webhook signature verification is correctly implemented.

### Sub-Phase 4.2: Testing
- 1. [ ] **Core Functionality Testing:** Rigorous testing of all existing prompt creation, editing, viewing, and playground functionalities.
- 2. [ ] **Monetization Flow Testing:**
    - a. [ ] Test Stripe Checkout process with test cards.
    - b. [ ] Test webhook handling for subscription creation, updates, and cancellations.
    - c. [ ] Verify user tier changes and feature access based on subscription status.
    - d. [ ] Test Stripe Customer Portal integration.
- 3. [ ] **Neon Database Integration Testing:** Ensure all CRUD operations work correctly with the Neon production database. Test concurrent access if possible.
- 4. [ ] **Frontend Unit & Integration Tests:** Focus on critical components and user flows, especially those related to settings, playground, and new subscription UI.
- 5. [ ] **Backend Unit & Integration Tests:** Ensure good coverage for API endpoints, especially new ones for Stripe integration, and core business logic.
- 6. [ ] **End-to-End Testing:** Test key user journeys from signup/login, through prompt management, to subscription upgrade and management.

### Sub-Phase 4.3: Documentation
- 1. [ ] **README Updates:** Ensure `frontend/README.md` and a new `backend/README.md` (if not already comprehensive) are up-to-date with setup, development, and deployment instructions relevant to the MVP.
- 2. [ ] **User-Facing Documentation (Minimal for MVP):**
    - a. [ ] Brief guide on how to use the playground.
    - b. [ ] Explanation of Free vs. Pro tiers [subs].
    - c. [ ] How to manage API keys and subscriptions.
- 3. [ ] **Deployment Steps Documentation:** Document the process for deploying frontend and backend, including environment variable setup for production (Neon URL, Stripe keys, etc.) and Stripe webhook configuration.

### Sub-Phase 4.4: Deployment Setup
- 1. [ ] **Hosting Provider Selection:**
    - a. [ ] Frontend: Choose provider (e.g., Vercel, Netlify).
    - b. [ ] Backend: Choose provider (e.g., Render, AWS Elastic Beanstalk, DigitalOcean App Platform).
- 2. [ ] **Neon Database:** Confirm Neon project is production-ready (from Sub-Phase 3.1).
- 3. [ ] **CI/CD Pipeline:**
    - a. [ ] Set up basic CI/CD pipelines (e.g., using GitHub Actions) for automated testing and deployment of frontend and backend to chosen hosting providers.
- 4. [ ] **Production Environment Configuration:**
    - a. [ ] Configure all necessary environment variables in production hosting environments for both frontend and backend (Auth0, Neon DB URL, Stripe keys, Fernet key, API URLs, etc.).
- 5. [ ] **Monitoring & Logging (Basic):**
    - a. [ ] Implement basic error tracking for frontend (e.g., Sentry free tier).
    - b. [ ] Ensure backend logging is captured by the hosting provider or a simple logging service.
- 6. [ ] **Final Deployment & Smoke Testing:** Deploy to production and perform thorough smoke testing of all critical functionalities.

---
## Future Features (Post-MVP)

This section lists features that were part of the broader plan but are deferred to keep the MVP scope focused on core functionality, monetization, and stable deployment.

* **Prompt Data Export (JSON/XML):** (Originally Sub-Phase 1.5) Allowing users to download their prompts.
* **Advanced Playground Tools:** (Originally Sub-Phase 2.3)
    * Bulk testing of a prompt against multiple models/configurations.
    * A/B comparison tools for different prompt versions.
    * AI prompt vs output evaluation, scoring & improvement suggestion tool (as defined in [eval_prompt_logic]).
* **Enhanced Version Control Features:** (Beyond current versioning) E.g., named versions, branching within the app.
* **Import Functionality:** Allowing users to import prompts from other formats.
* **Collaboration Features:** Shared prompt libraries for teams.
* **Further UI/UX Polish & Accessibility (A11y) Enhancements:** Beyond MVP baseline.

---

## References

1.  **Subscription Plan [subs]:**
    * **FREE:**
        * Number of Prompts:
            * Limit: 20 - This allows users to build a useful personal library and understand the organizational value.
        * Versions Per Prompt:
            * Limit: 3 versions. This is sufficient for users to experience the benefit of iterating and refining prompts.
        * Playground Tests:
            * Limit: "Effectively Unlimited" (or a very high cap like 200-500/month if you need to prevent system abuse). Since users provide their own API keys, allowing extensive testing in the free tier can be a major selling point.
        * Access to LLM Models in Playground:
            * Limit: No restriction. Users can test with any model for which they can provide an API key. This is a core part of the playground's utility.
        * Tagging & Organization:
            * Benefit: Full access. This is a fundamental feature of a "library."
        * API Key Management:
            * Benefit: Full access to add and manage their own keys.
    * **Premium Tier ("Pro Tier"):**
        * Number of Prompts:
            * Benefit: Unlimited.
        * Versions Per Prompt:
            * Benefit: Unlimited.
        * Playground Tests:
            * Benefit: Unlimited (as per the BYOK model).
        * Advanced Playground Features (Deferred to Future Features):
            * Bulk testing of a prompt against multiple models or configurations.
            * A/B comparison tools for different prompt versions.
            * AI prompt vs output evaluation, scoring & improvement suggestion tool (250 uses limit/month planned) - See [eval_prompt_logic].
        * Enhanced Version Control (Deferred to Future Features).
        * Export/Import Options (Deferred to Future Features).
        * Priority Support.
        * Early access to new (non-MVP) features.

2.  **AI Prompt Evaluator Logic [eval_prompt_logic]:** (Deferred to Future Features)
    * **Purpose:** An LLM-based tool to analyze a user-provided 'INPUT PROMPT' and its corresponding 'OUTPUT'. It assesses the effectiveness of the 'INPUT PROMPT' and suggests improvements or highlights strengths. This feature is planned for Pro tier users with usage limits [subs].
    * **Core System Prompt Elements:**
        * **Role Definition:** AI acts as an "AI Input Prompt Evaluator."
        * **Internal Chain-of-Thought (CoT):** Mandated internal process for reasoning before generating output. Includes:
            * Goal Assessment of the user's prompt.
            * Success Evaluation by comparing output to the prompt's goal.
            * Metric-Based Scoring (internal reasoning for each score).
            * Formulation of Improvement Suggestions with examples (if applicable).
            * Ambiguity Identification.
        * **Scoring Metrics (1-5 scale):**
            1.  Relevance & Fidelity
            2.  Clarity & Structure (of prompt leading to output)
            3.  Depth & Insight (elicited by prompt)
            4.  Creativity & Originality (elicited by prompt)
            5.  Adaptability Across Versions (prompt's potential robustness)
    * **Conditional Output Logic based on "Excellence Threshold":**
        * **Threshold Definition (Example):** Overall Score >= 4.5 AND no individual metric < 4. This is determined during the CoT.
        * **IF Excellence Threshold is MET:**
            * **Output Format:** Acknowledges high quality, provides Overall Score, lists "Key Strengths," and includes a "What This Prompt Does Well" section. Improvement suggestions are omitted.
        * **ELSE (Excellence Threshold is NOT MET):**
            * **Output Format:** Provides a detailed "Evaluation" overview, scores for all metrics, an "Overall Score," 3-5 "Suggested improvements" with examples, and "Ambiguities Noted."
    * **Cost Management:** Word limits on user's input prompt, user's output (for evaluation), and the evaluator's output are planned to manage token usage for the LLM calls.

**Plan for next steps:**
- 3c.c: Search the project directory for any lingering SQLite database files (e.g., `prompt_library.db`) and delete them if found.
- 3c.d: Review all environment configuration files and deployment scripts to ensure that only PostgreSQL/Neon is used via the `DATABASE_URL` variable, and that no environment (dev, staging, prod) can fall back to SQLite.