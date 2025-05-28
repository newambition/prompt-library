# Prompt Library - Road to Deployment

## Completed Milestones Summary

### ✅ Phase 1: Core Refinements & Configuration (MVP Baseline)
* ✅  **Enhanced "New Prompt" Workflow:** UI for "Add New Prompt" allows input for Title, Initial prompt text, Initial notes, and optional tags. Backend and frontend logic supports these fields.
* ✅ **API Key Management & Security:** Secure system for users to manage their LLM API keys implemented.
    * **Database Schema:** `UserApiKeyDB` model and Alembic migration created for `user_api_keys` table with Fernet encrypted API keys.
    * **Backend CRUD & API:** Authenticated CRUD operations and API endpoints for user API key management established.
    * **Frontend Settings:** `SettingsModal.js` allows users to manage API keys without client-side persistent storage.
    * **Playground Integration:** `/playground/test` endpoint uses user-specific, decrypted API keys.
* ✅ **Environment Configuration:** `.env.example` files created for both frontend and backend.
* ✅ **Error Handling & User Feedback:** Standardized error messages and loading indicators implemented.
* ✅ **Error Handling & User Feedback:** Standardized error messages and loading indicators implemented.

### ✅ Phase 2: Multi-Model AI & Enhanced Playground (MVP Baseline)
* ✅**Backend Multi-Model Support:** Abstraction layer and implementations for multiple LLM providers (Gemini, OpenAI, Anthropic) created. `/playground/test` endpoint supports `model_id`. `llm_provider` and `model_id_used` stored with prompt versions.
* ✅ **Frontend Playground UI for Model Selection:** UI for model selection in `PlaygroundView.js` and display of model used in `DetailsView.js` implemented.

### ½µ Phase 3: Monetization & Production Database Setup
* ✅ **Production Database (Neon):**
    * Neon PostgreSQL configured and all Alembic migrations applied
    * User-specific data isolation via `user_id` columns and filtering
    * SSL/TLS enforced for secure connections
* ✅ **Stripe Monetization Backend:**
    * Stripe billing endpoints implemented (`/billing/create-checkout-session`, `/billing/create-customer-portal-session`, `/billing/stripe-webhooks`)
    * User table with `tier`, `subscription_status`, and `stripe_customer_id`
    * Tier enforcement system (Free: 20 prompts, 3 versions; Pro: unlimited)
    * Webhook signature verification and full subscription lifecycle handling
    * All environment variables and security best practices in place
    * Comprehensive backend tests for Stripe and database

---

## Phase 3 (MVP Focus): Monetization & Production Database Setup

### Sub-Phase 3.1 & 3.2: [COMPLETED] (See summary above)

### Sub-Phase 3.3: Frontend Monetization UI
- 1. **UI Setup for Monetization**
    - a. [ ] **Tier Presentation:** UI to display Free and Pro tiers with their benefits [subs].
    - b. [ ] **Upgrade/Manage Subscription Flow:**µµ
        - i. [ ] Buttons/links to initiate upgrade (calls `/billing/create-checkout-session`, redirects to Stripe).
        - ii. [ ] Button/link to manage subscription (calls `/billing/create-customer-portal-session`, redirects to Stripe Customer Portal).
        - iii. [ ] Clear display of current subscription status.
    - c. [ ] **Conditional UI Rendering:** UI elements should adapt based on user tier (e.g., prompts for upgrade, visual distinction of Pro status).

- 2. **User Experience for Downgrade/Upgrade:**
    - a. [X] Define and implement backend logic for what happens when a user's subscription lapses (e.g., downgrade to free tier, enforcement of free tier limits, handling of excess prompts/versions).
    - b. [ ] Ensure the frontend clearly communicates changes in subscription status, including downgrade scenarios, and provides appropriate messaging and UI states for users who lose Pro access.

    **Remaining Work:**
- ❌ **Step 3a**: Stripe dashboard setup (account, products, pricing plans)
- ❌ **Step 6**: Complete frontend monetization UI implementation
- ❌ **Step 7b**: Frontend user experience for subscription changes

    **Current Status**: Backend monetization infrastructure is **production-ready**. Only Stripe frontend UI implementation remains.

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
            * Limit: 3 versions. Sufficient for users to experience the benefit of iterating and refining prompts.
        * Playground Tests:
            * Limit: "Effectively Unlimited" (or a very high cap like 200-500/month if need to prevent system abuse). Since users provide their own API keys, allowing extensive testing in the free tier can be a major selling point.
        * Access to LLM Models in Playground:
            * Limit: No restriction. Users can test with any model for which they can provide an API key. This is a core part of the playground's utility.
        * Tagging & Organization:
            * Benefit: Full access. 
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
        * Enhanced Version Control; custom naming, version brnaching (To be implemented before launch).
        * Export/Import Options (To be implemented before launch).
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

