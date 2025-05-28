export const PROMPT_TEMPLATES = [
  {
    id: 1,
    title: "Marketing Copy Generator",
    description: "Create compelling marketing copy for products and services",
    category: "Marketing",
    prompt: "Create engaging marketing copy for [PRODUCT/SERVICE].\n\nInclude a catchy headline, key benefits, and a strong call-to-action.\n\nTarget audience: [TARGET_AUDIENCE].\n\nTone: [TONE - professional/casual/exciting].",
    tags: ["marketing", "copywriting", "advertising"]
  },
  {
    id: 2,
    title: "A/B Test Headline Generator",
    description: "Generate alternative headlines for A/B testing",
    category: "Marketing",
    prompt: "Generate [NUMBER] alternative headlines for an A/B test.\n\nOriginal headline: [ORIGINAL_HEADLINE]\nProduct/Service: [PRODUCT_SERVICE]\nGoal: [GOAL - e.g., increase click-through rate, improve conversion]\nTarget audience: [TARGET_AUDIENCE]\nKey benefit/message: [KEY_BENEFIT_OR_MESSAGE]",
    tags: ["marketing", "ab testing", "headlines"]
  },
  {
    id: 3,
    title: "Unique Selling Proposition (USP) Definer",
    description: "Help define a Unique Selling Proposition for a product/service",
    category: "Marketing",
    prompt: "Help define a Unique Selling Proposition (USP) for [PRODUCT/SERVICE_NAME].\n\nCompetitors: [COMPETITOR_1_USP, COMPETITOR_2_USP]\nKey features & benefits: [LIST_FEATURES_AND_BENEFITS]\nTarget customer pain points solved: [LIST_PAIN_POINTS]\nWhat makes it different/better: [DIFFERENTIATORS]\nDesired brand perception: [BRAND_PERCEPTION]",
    tags: ["marketing", "branding", "strategy"]
  },
  {
    id: 4,
    title: "Promotional Campaign Idea Generator",
    description: "Brainstorm creative promotional campaign ideas",
    category: "Marketing",
    prompt: "Brainstorm [NUMBER] creative promotional campaign ideas for [PRODUCT/SERVICE] for [TARGET_PERIOD - e.g., upcoming holiday, product launch, season].\n\nBudget level: [LOW/MEDIUM/HIGH]\nTarget audience: [TARGET_AUDIENCE]\nKey message: [KEY_MESSAGE]\nDesired outcome: [OUTCOME - e.g., brand awareness, lead generation, sales boost]\nCampaign channels to consider: [CHANNELS - e.g., social media, email, influencers, PR]",
    tags: ["marketing", "promotion", "ideas"]
  },
  {
    id: 5,
    title: "Code Review Assistant",
    description: "Get detailed code reviews and improvement suggestions",
    category: "Development",
    prompt: "Please review the following code and provide feedback on:\n1. Code quality and best practices\n2. Potential bugs or issues\n3. Performance improvements\n4. Security considerations\n5. Readability and maintainability\n\nCode:\n[PASTE_CODE_HERE]",
    tags: ["coding", "development", "review"]
  },
  {
    id: 6,
    title: "API Design Assistant",
    description: "Get help designing RESTful API endpoints",
    category: "Development",
    prompt: "Help design a RESTful API endpoint for [FUNCTIONALITY - e.g., managing user profiles, retrieving product data].\n\nResource name (plural): [RESOURCE_NAME]\nHTTP Methods needed: [GET/POST/PUT/DELETE/PATCH]\n\nFor each method, describe:\n- Purpose: [PURPOSE_OF_ENDPOINT]\n- Request path: [e.g., /users, /users/{id}]\n- Key request parameters/body schema: [SCHEMA_DETAILS]\n- Expected success response (status code & body schema): [RESPONSE_SCHEMA_DETAILS]\n- Potential error responses (status codes & reasons): [ERROR_DETAILS]\n\nAuthentication/Authorization method: [AUTH_METHOD]",
    tags: ["development", "api", "backend"]
  },
  {
    id: 7,
    title: "Technical Debt Prioritizer",
    description: "Prioritize technical debt items based on impact and effort",
    category: "Development",
    prompt: "Help prioritize the following technical debt items:\n\nItem 1: [DESCRIPTION_OF_TECH_DEBT_1]\n- Estimated effort to fix (e.g., S/M/L, story points): [EFFORT_1]\n- Perceived impact if not fixed (e.g., user experience, system stability, development velocity): [IMPACT_1]\n\nItem 2: [DESCRIPTION_OF_TECH_DEBT_2]\n- Estimated effort to fix: [EFFORT_2]\n- Perceived impact if not fixed: [IMPACT_2]\n\nItem 3: [DESCRIPTION_OF_TECH_DEBT_3]\n- Estimated effort to fix: [EFFORT_3]\n- Perceived impact if not fixed: [IMPACT_3]\n\nBusiness goals/priorities to consider: [BUSINESS_CONTEXT]\n\nSuggest a prioritization order with reasoning.",
    tags: ["development", "project management"]
  },
  {
    id: 8,
    title: "Algorithm Explainer & Pseudocode Generator",
    description: "Explain algorithms and generate pseudocode",
    category: "Development",
    prompt: "Explain the [ALGORITHM_NAME] algorithm.\n\nDescribe:\n1. Its primary use case(s).\n2. Time complexity (Big O notation).\n3. Space complexity (Big O notation).\n4. Advantages and disadvantages.\n\nProvide pseudocode for its implementation.\nInput: [DESCRIPTION_OF_INPUT_DATA_STRUCTURE]\nOutput: [DESCRIPTION_OF_EXPECTED_OUTPUT]",
    tags: ["development", "algorithms", "pseudocode", "coding"]
  },
  {
    id: 9,
    title: "Email Writer",
    description: "Craft professional emails for various purposes",
    category: "Communication",
    prompt: "Write a professional email for [PURPOSE].\n\nRecipient: [RECIPIENT].\n\nKey points to include: [KEY_POINTS].\n\nTone should be [TONE - formal/friendly/urgent].\n\nInclude appropriate subject line.",
    tags: ["email", "professional", "communication"]
  },
  {
    id: 10,
    title: "Difficult Conversation Scripter",
    description: "Craft scripts for handling difficult conversations",
    category: "Communication",
    prompt: "Help script a difficult conversation regarding [SCENARIO_DESCRIPTION - e.g., giving negative feedback, addressing a conflict, declining a request].\n\nPerson involved: [PERSON_ROLE/RELATIONSHIP]\nMy desired outcome: [DESIRED_OUTCOME]\nKey points I need to convey: [KEY_POINTS_LIST]\nPotential challenges/reactions to anticipate: [POTENTIAL_CHALLENGES]\nMy desired tone: [CONSTRUCTIVE/EMPATHETIC/FIRM_BUT_FAIR]\n\nProvide opening lines, key phrases, and ways to navigate potential responses.",
    tags: ["communication", "conflict resolution"]
  },
  {
    id: 11,
    title: "Elevator Pitch Refiner",
    description: "Refine and perfect your elevator pitch",
    category: "Communication",
    prompt: "Help me refine my elevator pitch for [MYSELF/MY_PROJECT/MY_COMPANY].\n\nCurrent pitch (if any): [CURRENT_PITCH_TEXT]\nTarget audience for this pitch: [AUDIENCE - e.g., potential investor, new client, networking contact]\nKey value proposition I want to highlight: [VALUE_PROPOSITION]\nWhat I want the listener to do/think next: [DESIRED_NEXT_STEP]\nMaximum length: [e.g., 30 seconds, 60 seconds]\n\nProvide a revised pitch and suggestions for delivery.",
    tags: ["communication", "networking", "personal branding"]
  },
  {
    id: 12,
    title: "Networking Follow-Up Message",
    description: "Draft effective follow-up messages after networking",
    category: "Communication",
    prompt: "Draft a follow-up message after meeting someone at [EVENT_NAME/CONTEXT_OF_MEETING].\n\nPerson's name: [PERSON_NAME]\nTheir company/role (if known): [PERSON_COMPANY_ROLE]\nKey points of our conversation: [DISCUSSION_POINTS_TO_REFERENCE]\nMy goal for following up: [GOAL - e.g., schedule a coffee chat, explore collaboration, share a resource, express thanks]\nDesired tone: [PROFESSIONAL_FRIENDLY/FORMAL/ENTHUSIASTIC]\n\nInclude a clear call to action if applicable.",
    tags: ["communication", "networking", "professional"]
  },
  {
    id: 13,
    title: "Creative Story Starter",
    description: "Generate creative story beginnings and plot ideas",
    category: "Creative",
    prompt: "Create an engaging story beginning with the following elements:\n\n- Genre: [GENRE]\n- Main character: [CHARACTER_DESCRIPTION]\n- Setting: [SETTING]\n- Conflict/Challenge: [CONFLICT]\n\nWrite the opening 2-3 paragraphs that hook the reader.",
    tags: ["creative", "writing", "storytelling"]
  },
  {
    id: 14,
    title: "Character Backstory Generator",
    description: "Generate detailed backstories for fictional characters",
    category: "Creative",
    prompt: "Generate a detailed backstory for a character.\n\nName: [CHARACTER_NAME]\nRole in story: [ROLE - e.g., protagonist, antagonist, mentor, sidekick]\nKey personality traits (3-5): [TRAITS_LIST]\nCore motivation: [MOTIVATION]\nGreatest fear: [FEAR]\nSignificant life event that shaped them: [EVENT_IDEA_OR_THEME]\nSetting/Genre: [GENRE_OF_STORY]\n\nProvide a narrative backstory incorporating these elements.",
    tags: ["creative", "writing", "character development"]
  },
  {
    id: 15,
    title: "Worldbuilding Detail Expander",
    description: "Expand on specific worldbuilding details for fictional settings",
    category: "Creative",
    prompt: "Expand on a worldbuilding detail for my [FANTASY/SCI-FI/OTHER_GENRE] setting.\n\nAspect to expand: [ASPECT - e.g., magic system, political structure, unique technology, cultural tradition, alien species].\nKey elements already established about this aspect: [EXISTING_ELEMENTS]\nDesired tone/feel of the world: [TONE_FEEL - e.g., gritty, whimsical, epic]\n\nProvide [NUMBER] unique details, implications, or examples related to this aspect that enrich the world.",
    tags: ["creative", "writing", "fantasy", "sci-fi"]
  },
  {
    id: 16,
    title: "Poetry Prompt Generator",
    description: "Generate inspiring prompts for writing poetry",
    category: "Creative",
    prompt: "Generate [NUMBER] poetry prompts based on the theme of [THEME - e.g., transformation, solitude, nature's power].\n\nDesired poetic form (optional): [FORM - e.g., sonnet, haiku, free verse, limerick]\nMood/Tone to evoke: [MOOD - e.g., melancholic, joyful, reflective, satirical]\n\nInclude specific imagery, sensory details, or contrasting ideas to inspire the poem.",
    tags: ["creative", "poetry", "writing prompts", "inspiration"]
  },
  {
    id: 17,
    title: "Data Analysis Helper",
    description: "Analyze data patterns and generate insights",
    category: "Analytics",
    prompt: "Analyze the following data and provide insights:\n\nData: [PASTE_DATA_HERE]\n\nPlease provide:\n1. Key patterns and trends\n2. Notable outliers or anomalies\n3. Actionable insights\n4. Recommendations for next steps\n5. Potential areas for further investigation",
    tags: ["data", "analysis", "insights"]
  },
  {
    id: 18,
    title: "Hypothesis Generation for A/B Testing",
    description: "Generate testable hypotheses for A/B tests from data observations",
    category: "Analytics",
    prompt: "Generate [NUMBER] testable hypotheses for an A/B test based on the following observation from our data: [OBSERVATION_FROM_DATA - e.g., 'High bounce rate on product page X', 'Low click-through on CTA Y'].\n\nMetric we want to improve: [METRIC - e.g., conversion rate, engagement time, click-through rate]\nCurrent user behavior related to observation: [CURRENT_BEHAVIOR]\nPotential areas on the [WEBSITE/APP/PRODUCT] to change: [AREAS_TO_CHANGE - e.g., UI element, copy, workflow, information architecture]\n\nFormat each hypothesis as: 'If we [PROPOSED_CHANGE], then [EXPECTED_OUTCOME_ON_METRIC] because [REASONING/ASSUMPTION]'.",
    tags: ["analytics", "ab testing", "hypothesis", "data driven", "cro"]
  },
  {
    id: 19,
    title: "Data Visualization Recommender",
    description: "Get recommendations for the best data visualizations",
    category: "Analytics",
    prompt: "Recommend the best types of visualizations for the following dataset and analysis goal.\n\nData characteristics:\n- Key variables: [VARIABLE_1 (type: e.g., categorical, numerical, time-series), VARIABLE_2 (type), ...]\n- Data size (approx): [e.g., small, medium, large]\n\nAnalysis goal: [GOAL - e.g., show trends over time, compare categories, display distribution, identify relationships between variables, show geographical patterns]\nAudience for visualization: [AUDIENCE - e.g., technical team, executives, general public]\n\nFor each recommended visualization type, provide a brief rationale.",
    tags: ["analytics", "data visualization", "charts", "reporting", "data storytelling"]
  },
  {
    id: 20,
    title: "Key Performance Indicator (KPI) Suggester",
    description: "Suggest relevant KPIs for a business or project",
    category: "Analytics",
    prompt: "Suggest relevant Key Performance Indicators (KPIs) for a [BUSINESS_TYPE/PROJECT_TYPE - e.g., SaaS startup, e-commerce website, marketing campaign, software development project].\n\nPrimary objectives: [OBJECTIVE_1, OBJECTIVE_2, OBJECTIVE_3]\nTarget audience/users: [TARGET_AUDIENCE]\nKey activities/processes involved: [KEY_ACTIVITIES]\n\nFor each suggested KPI, explain:\n1. What it measures.\n2. Why it's important for the stated objectives.\n3. How it could be tracked (data sources).",
    tags: ["analytics", "kpi", "metrics", "business intelligence", "performance"]
  },
  {
    id: 21,
    title: "Meeting Summarizer",
    description: "Create concise summaries of meetings and discussions",
    category: "Productivity",
    prompt: "Summarize the following meeting notes into a clear, actionable format:\n\nMeeting: [MEETING_TITLE]\nDate: [DATE]\nAttendees: [ATTENDEES]\n\nNotes: [PASTE_NOTES_HERE]\n\nPlease provide:\n- Key decisions made\n- Action items with owners\n- Next steps\n- Important discussion points",
    tags: ["meetings", "productivity", "summary"]
  },
  {
    id: 22,
    title: "Daily Task Prioritizer",
    description: "Prioritize daily tasks based on importance and urgency",
    category: "Productivity",
    prompt: "Help me prioritize my tasks for today using a method like Eisenhower Matrix (Urgent/Important) or MoSCoW.\n\nTask list:\n- Task 1: [TASK_1_DESCRIPTION] (Deadline: [DATE/TIME], Estimated effort: [EFFORT])\n- Task 2: [TASK_2_DESCRIPTION] (Deadline: [DATE/TIME], Estimated effort: [EFFORT])\n- Task 3: [TASK_3_DESCRIPTION] (Deadline: [DATE/TIME], Estimated effort: [EFFORT])\n- (Add more tasks as needed)\n\nMy main goal for today: [MAIN_GOAL_FOR_THE_DAY]\nAny constraints or dependencies: [CONSTRAINTS - e.g., meetings, energy levels, waiting for others]\n\nProvide a prioritized list with justification for the order.",
    tags: ["productivity", "task management", "prioritization", "time management"]
  },
  {
    id: 23,
    title: "Goal Breakdown Planner",
    description: "Break down large goals into smaller, actionable steps",
    category: "Productivity",
    prompt: "Break down this large goal into smaller, actionable steps: [LARGE_GOAL_DESCRIPTION].\n\nDesired completion date/timeframe: [DATE/TIMEFRAME]\nAvailable resources (time, budget, tools, people): [RESOURCES_LIST]\nPotential obstacles or challenges: [OBSTACLES_LIST]\nKey milestones to track progress: [MILESTONE_IDEAS (optional)]\n\nProvide a structured plan with clear steps, potential sub-tasks, and a suggested timeline if possible.",
    tags: ["productivity", "goal setting", "planning", "project management", "action plan"]
  },
  {
    id: 24,
    title: "Distraction Minimization Strategist",
    description: "Create strategies to minimize distractions and improve focus",
    category: "Productivity",
    prompt: "Help me create a strategy to minimize distractions while working on [TYPE_OF_WORK - e.g., deep work, coding, writing, studying].\n\nMy common distractions:\n- Internal: [e.g., mind-wandering, procrastination urges]\n- External: [e.g., notifications, noise, interruptions from others]\n\nMy work environment: [ENVIRONMENT - e.g., home office, open office, library]\nDesired focus duration per session: [MINUTES/HOURS]\n\nSuggest [NUMBER] actionable techniques, tools, or environmental changes to improve focus and reduce distractions.",
    tags: ["productivity", "focus", "distraction management", "deep work", "concentration"]
  },
  {
    id: 25,
    title: "Social Media Post Creator",
    description: "Generate engaging social media content",
    category: "Social Media",
    prompt: "Create engaging social media posts for [PLATFORM - Instagram/Twitter/LinkedIn/Facebook] about [TOPIC].\n\nInclude:\n- Compelling caption\n- Relevant hashtags\n- Call-to-action\n- Tone: [TONE]\n\nTarget audience: [AUDIENCE]",
    tags: ["social media", "content", "engagement"]
  },
  {
    id: 26,
    title: "Content Pillar Idea Generator",
    description: "Generate core content pillars for a social media strategy",
    category: "Social Media",
    prompt: "Generate [NUMBER] core content pillars for a social media strategy for [BRAND_NAME/TOPIC].\n\nBrand mission/values: [MISSION_VALUES]\nTarget audience interests & pain points: [AUDIENCE_INTERESTS_PAIN_POINTS]\nKey products/services offered (if applicable): [PRODUCTS_SERVICES]\nOverall marketing goals: [GOALS - e.g., build community, educate audience, drive traffic]\n\nFor each pillar, suggest 2-3 example post ideas or sub-topics.",
    tags: ["social media", "content strategy", "content pillars", "marketing"]
  },
  {
    id: 27,
    title: "Influencer Collaboration Pitch",
    description: "Draft a pitch for collaborating with an influencer",
    category: "Social Media",
    prompt: "Draft a compelling pitch to a potential influencer for collaboration.\n\nInfluencer's name/handle: [INFLUENCER_NAME_OR_HANDLE]\nMy brand/product: [MY_BRAND_PRODUCT_NAME_AND_BRIEF_DESCRIPTION]\nWhy this influencer is a good fit for my brand: [REASON_FOR_CHOOSING_INFLUENCER - e.g., audience alignment, content style, values]\nProposed collaboration idea: [COLLAB_IDEA - e.g., sponsored post, product review, giveaway, affiliate partnership]\nWhat's in it for the influencer (WIIFM): [BENEFITS_FOR_INFLUENCER - e.g., payment, free product, exposure]\nDesired outcome of collaboration: [OUTCOME]\nCall to action: [CTA - e.g., schedule a brief call, discuss details further, express interest]\n\nKeep the pitch concise and personalized.",
    tags: ["social media", "influencer marketing", "collaboration", "pitch", "marketing"]
  },
  {
    id: 28,
    title: "Social Media Crisis Response Drafter",
    description: "Help draft responses for social media crises or negative feedback",
    category: "Social Media",
    prompt: "Help draft a response to a [NEGATIVE_COMMENT/SOCIAL_MEDIA_CRISIS_SITUATION].\n\nPlatform where it occurred: [PLATFORM]\nDetails of the comment/issue: [ISSUE_DETAILS_OR_PASTE_COMMENT]\nBrand values to uphold in response: [BRAND_VALUES]\nDesired tone of response: [EMPATHETIC/APOLOGETIC/FACTUAL/CONCERNED]\nKey message to convey: [KEY_MESSAGE]\nGoal of the response: [GOAL - e.g., de-escalate, provide accurate information, take conversation offline, offer solution]\n\nProvide a draft response and any considerations for follow-up actions.",
    tags: ["social media", "crisis management", "pr", "reputation management", "customer service"]
  },
  {
    id: 29,
    title: "Learning Tutor",
    description: "Get explanations and help with learning new concepts",
    category: "Education",
    prompt: "Explain [CONCEPT/TOPIC] in simple terms.\n\nI am a [SKILL_LEVEL - beginner/intermediate/advanced] learner.\n\nPlease:\n1. Provide a clear definition\n2. Give practical examples\n3. Explain why it's important\n4. Suggest next steps for learning\n5. Include any common misconceptions to avoid",
    tags: ["education", "learning", "explanation"]
  },
  {
    id: 30,
    title: "Concept Comparison Explainer",
    description: "Explain similarities and differences between two concepts",
    category: "Education",
    prompt: "Explain the similarities and differences between [CONCEPT_A] and [CONCEPT_B].\n\nSubject area: [SUBJECT_AREA]\nMy current understanding level of these concepts: [BEGINNER/INTERMEDIATE/ADVANCED]\n\nPlease provide:\n1. A clear definition of each concept.\n2. Key similarities with examples.\n3. Key differences with examples.\n4. Common points of confusion or ways they are often mistaken for each other.\n5. Contexts where each concept is most relevant.",
    tags: ["education", "learning", "comparison", "explanation", "concepts"]
  },
  {
    id: 31,
    title: "Flashcard Content Generator",
    description: "Generate content for study flashcards (term and definition)",
    category: "Education",
    prompt: "Generate [NUMBER] flashcards (front/back content) for studying [TOPIC/SUBJECT].\n\nKey terms, concepts, or questions to cover: [LIST_OF_TERMS_CONCEPTS_OR_QUESTIONS (or ask AI to generate based on topic)]\nDesired format for 'back' of card: [CONCISE_DEFINITION/KEY_FACTS/FORMULA/EXAMPLE]\nEducation Level: [HIGH_SCHOOL/COLLEGE/PROFESSIONAL]\n\nOutput format:\nFront: [TERM/QUESTION 1]\nBack: [DEFINITION/ANSWER 1]\n\nFront: [TERM/QUESTION 2]\nBack: [DEFINITION/ANSWER 2]\n...",
    tags: ["education", "studying", "flashcards", "memorization", "learning tools"]
  },
  {
    id: 32,
    title: "Real-World Application Finder",
    description: "Find real-world applications for academic concepts or theories",
    category: "Education",
    prompt: "Provide [NUMBER] real-world applications or examples of the academic concept/theory: [ACADEMIC_CONCEPT_OR_THEORY_NAME].\n\nBriefly explain the concept/theory if it's obscure: [BRIEF_EXPLANATION (optional)]\n\nFor each application, describe:\n1. The industry or field where it's used.\n2. How the concept/theory is applied in practice.\n3. The impact or benefit of its application in that context.\n\nMake the applications relatable and easy to understand for a [LEARNER_LEVEL - e.g., high school student, undergraduate, general audience].",
    tags: ["education", "learning", "real world examples", "application", "relevance"]
  },
  {
    id: 33,
    title: "Problem Solver",
    description: "Break down complex problems into manageable solutions",
    category: "Problem Solving",
    prompt: "Help me solve this problem: [DESCRIBE_PROBLEM]\n\nPlease:\n1. Break down the problem into smaller parts\n2. Identify potential root causes\n3. Suggest multiple solution approaches\n4. Evaluate pros and cons of each approach\n5. Recommend the best solution with implementation steps",
    tags: ["problem solving", "analysis", "strategy"]
  },
  {
    id: 34,
    title: "Root Cause Analysis (5 Whys)",
    description: "Perform a Root Cause Analysis using the '5 Whys' technique",
    category: "Problem Solving",
    prompt: "Perform a Root Cause Analysis using the '5 Whys' technique for the following problem: [PROBLEM_STATEMENT].\n\nInitial known contributing factors or symptoms: [KNOWN_FACTORS_OR_SYMPTOMS]\n\nStart with the problem statement and ask 'Why?' iteratively at least 5 times, or until the root cause(s) seem to be identified. Document each 'Why?' and its corresponding answer.",
    tags: ["problem solving", "root cause analysis", "5 whys", "critical thinking", "troubleshooting"]
  },
  {
    id: 35,
    title: "Decision Matrix Creator",
    description: "Create a decision matrix to evaluate and choose between options",
    category: "Problem Solving",
    prompt: "Help create a decision matrix to choose between the following options for [DECISION_TO_BE_MADE]:\n\nOptions:\n- Option A: [DESCRIPTION_OF_OPTION_A]\n- Option B: [DESCRIPTION_OF_OPTION_B]\n- Option C: [DESCRIPTION_OF_OPTION_C]\n- (Add more options as needed)\n\nKey criteria for evaluation (suggest 3-5 if I don't provide): [CRITERION_1, CRITERION_2, CRITERION_3, ...]\nRelative weight/importance of each criterion (e.g., on a scale of 1-5 or 1-10): [WEIGHT_FOR_CRITERION_1, WEIGHT_FOR_CRITERION_2, ...]\n\nHelp me structure the matrix and score each option against each criterion (e.g., on a scale of 1-5). Calculate a weighted score for each option.",
    tags: ["problem solving", "decision making", "analysis", "matrix", "evaluation"]
  },
  {
    id: 36,
    title: "Pre-Mortem Analysis Facilitator",
    description: "Facilitate a pre-mortem analysis to identify potential project failures",
    category: "Problem Solving",
    prompt: "Facilitate a pre-mortem analysis for an upcoming project: [PROJECT_NAME_OR_GOAL].\n\nProject description: [BRIEF_DESCRIPTION_OF_PROJECT]\nKey project timeline: [TIMELINE_OR_DEADLINE]\n\nImagine it's [FUTURE_DATE_AFTER_PROJECT_DEADLINE] and the project has failed spectacularly. Brainstorm all possible reasons for this failure. Categorize them if possible (e.g., technical, communication, resource, external factors).\n\nFor each significant potential reason for failure, suggest:\n1. Preventative actions we can take now.\n2. Mitigation strategies if the issue starts to occur.",
    tags: ["problem solving", "risk management", "project management", "pre-mortem", "strategy"]
  },
  {
    id: 37,
    title: "Recipe Creator",
    description: "Create custom recipes based on ingredients and preferences",
    category: "Cooking",
    prompt: "Create a recipe using these ingredients: [LIST_INGREDIENTS]\n\nPreferences:\n- Dietary restrictions: [RESTRICTIONS]\n- Cooking time: [TIME_AVAILABLE]\n- Skill level: [BEGINNER/INTERMEDIATE/ADVANCED]\n- Cuisine style: [CUISINE_TYPE]\n\nProvide step-by-step instructions, cooking tips, and serving suggestions.",
    tags: ["cooking", "recipe", "food"]
  },
  {
    id: 38,
    title: "Ingredient Substitution Suggester",
    description: "Get suggestions for substituting ingredients in a recipe",
    category: "Cooking",
    prompt: "I'm making [DISH_NAME] and I'm out of/need to substitute [MISSING_INGREDIENT].\n\nOriginal amount of missing ingredient: [AMOUNT]\nBrief description of the recipe or its key flavors: [RECIPE_CONTEXT_OR_FLAVOR_PROFILE]\nMy dietary restrictions (if any): [RESTRICTIONS - e.g., vegan, gluten-free, nut-free]\nOther key ingredients I have available that might be relevant: [AVAILABLE_INGREDIENTS_LIST (optional)]\n\nSuggest [NUMBER] suitable substitutes, explaining the impact on flavor/texture and any adjustments needed for quantity.",
    tags: ["cooking", "recipe", "substitution", "ingredients", "tips"]
  },
  {
    id: 39,
    title: "Weekly Meal Prep Planner",
    description: "Create a meal prep plan for the week based on preferences",
    category: "Cooking",
    prompt: "Create a meal prep plan for [NUMBER_OF_DAYS] days for [NUMBER_OF_PEOPLE] people.\n\nDietary preferences/restrictions: [PREFERENCES_RESTRICTIONS - e.g., vegetarian, low-carb, high-protein, gluten-free, no dairy]\nCooking skill level: [BEGINNER/INTERMEDIATE/ADVANCED]\nPreferred cuisines or types of dishes: [CUISINES_OR_DISH_TYPES]\nMain goal for meal prep: [HEALTHY_EATING/TIME_SAVING/BUDGET_FRIENDLY/VARIETY]\nKitchen equipment available (e.g., oven, microwave, Instant Pot): [EQUIPMENT_LIST]\n\nProvide ideas for:\n- Breakfasts\n- Lunches\n- Dinners\n- Snacks (optional)\nInclude make-ahead tips and storage suggestions for each.",
    tags: ["cooking", "meal prep", "planning", "healthy eating", "recipes"]
  },
  {
    id: 40,
    title: "Flavor Pairing Explorer",
    description: "Explore ingredients and flavors that pair well together",
    category: "Cooking",
    prompt: "What flavors and ingredients pair well with [CENTRAL_INGREDIENT_OR_FLAVOR_PROFILE - e.g., salmon, dark chocolate, smoky paprika, basil, citrus]?\n\nSuggest [NUMBER] complementary ingredients or flavor combinations.\nFor each suggestion, explain:\n1. Why they work well together (e.g., contrast, similarity, regional cuisine tradition).\n2. Ideas for dishes or ways to use the pairing.\n\nConsider different categories of pairings: [HERBS_SPICES/FRUITS_VEGETABLES/PROTEINS/SAUCES_CONDIMENTS/ETC.]",
    tags: ["cooking", "flavor pairing", "ingredients", "culinary", "inspiration"]
  },
  {
    id: 41,
    title: "Business Plan Generator",
    description: "Create comprehensive business plans and strategies",
    category: "Business",
    prompt: "Create a business plan for [BUSINESS_IDEA]. Include:\n\n1. Executive Summary\n2. Market Analysis\n3. Target Audience: [TARGET_MARKET]\n4. Revenue Model\n5. Marketing Strategy\n6. Financial Projections (3-year)\n7. Risk Assessment\n8. Implementation Timeline\n\nBusiness Type: [SERVICE/PRODUCT/TECH/etc.]\nStartup Budget: [BUDGET_RANGE]",
    tags: ["business", "planning", "strategy"]
  },
  {
    id: 42,
    title: "SWOT Analysis Generator",
    description: "Conduct a SWOT analysis for a company, product, or project",
    category: "Business",
    prompt: "Conduct a SWOT analysis for [COMPANY_NAME/PRODUCT_IDEA/PROJECT_NAME].\n\nIndustry: [INDUSTRY]\nKey competitors (if applicable): [COMPETITORS_LIST]\nInternal factors to consider (for Strengths & Weaknesses): [e.g., team expertise, financial resources, brand reputation, technology, operational efficiency]\nExternal factors to consider (for Opportunities & Threats): [e.g., market trends, economic conditions, regulatory changes, new technologies, competitive landscape]\n\nProvide distinct bullet points for:\n- Strengths\n- Weaknesses\n- Opportunities\n- Threats",
    tags: ["business", "strategy", "swot analysis", "planning", "market analysis"]
  },
  {
    id: 43,
    title: "Value Proposition Designer",
    description: "Design a compelling value proposition for a product or service",
    category: "Business",
    prompt: "Help design a compelling value proposition for [PRODUCT/SERVICE_NAME].\n\nTarget customer segment(s): [CUSTOMER_SEGMENT_DESCRIPTION_WHO_ARE_THEY]\nCustomer jobs-to-be-done (what are they trying to achieve?): [JOBS_TO_BE_DONE_LIST]\nCustomer pains (challenges, frustrations, risks): [PAIN_POINTS_LIST]\nCustomer gains (desired outcomes, benefits, aspirations): [DESIRED_GAINS_LIST]\nHow our product/service specifically helps (features & benefits that address pains/gains): [PRODUCT_FEATURES_BENEFITS_MAPPING]\n\nDraft a concise and impactful value proposition statement using a common format (e.g., 'For [target customer] who [statement of need/opportunity], our [product/service] is a [product category] that [statement of benefit]').",
    tags: ["business", "value proposition", "marketing", "strategy", "product development"]
  },
  {
    id: 44,
    title: "Competitor Analysis Framework",
    description: "Get a framework for analyzing key competitors",
    category: "Business",
    prompt: "Provide a framework for analyzing the key competitors of [MY_BUSINESS_NAME_OR_PRODUCT_NAME].\n\nMy business/product is in the [INDUSTRY_OR_MARKET_NICHE] market.\nKey competitors I've identified: [COMPETITOR_1, COMPETITOR_2, COMPETITOR_3 (or ask for help identifying)]\n\nSuggest key aspects to compare for each competitor, such as:\n- Product/Service offerings & features\n- Pricing strategy & models\n- Target audience & market positioning\n- Marketing & sales tactics\n- Strengths & weaknesses\n- Customer reviews & reputation\n- Unique Selling Proposition (USP)\n\nAlso, suggest methods or sources for gathering this information (e.g., websites, reviews, social media, industry reports).",
    tags: ["business", "competitor analysis", "market research", "strategy", "planning"]
  },
  {
    id: 45,
    title: "Resume Builder",
    description: "Craft professional resumes tailored to specific roles",
    category: "Career",
    prompt: "Create a professional resume for:\n\nPosition: [JOB_TITLE]\nIndustry: [INDUSTRY]\nExperience Level: [ENTRY/MID/SENIOR]\n\nBackground:\n- Current Role: [CURRENT_POSITION]\n- Years of Experience: [YEARS]\n- Key Skills: [SKILLS_LIST]\n- Education: [EDUCATION_BACKGROUND]\n- Notable Achievements: [ACHIEVEMENTS]\n\nFormat the resume with strong action verbs, quantified achievements, and ATS-friendly keywords.",
    tags: ["career", "resume", "job application"]
  },
  {
    id: 46,
    title: "Cover Letter Customizer",
    description: "Customize a cover letter for a specific job application",
    category: "Career",
    prompt: "Help me customize a cover letter for the position of [JOB_TITLE] at [COMPANY_NAME].\n\nKey requirements from the job description: [PASTE_OR_LIST_KEY_REQUIREMENTS_FROM_JD]\nMy relevant skills and experiences that match these requirements: [MY_MATCHING_SKILLS_EXPERIENCE]\nWhy I am particularly interested in this company and role: [REASONS_FOR_INTEREST_IN_COMPANY_AND_ROLE]\nSpecific achievements or projects I want to highlight: [ACHIEVEMENTS_OR_PROJECTS]\nMy current resume (optional, for context): [LINK_OR_PASTE_RESUME_HIGHLIGHTS]\nDesired tone for the cover letter: [PROFESSIONAL/ENTHUSIASTIC/FORMAL/SLIGHTLY_CASUAL]\n\nDraft a compelling cover letter that connects my qualifications to the job and company.",
    tags: ["career", "cover letter", "job application", "job search", "writing"]
  },
  {
    id: 47,
    title: "LinkedIn Profile Optimizer",
    description: "Get suggestions to optimize your LinkedIn profile",
    category: "Career",
    prompt: "Provide suggestions to optimize my LinkedIn profile for [CAREER_GOAL - e.g., job seeking in X industry, networking for Y purpose, establishing thought leadership in Z area].\n\nMy current LinkedIn profile URL (optional): [LINKEDIN_PROFILE_URL]\nMy current headline: [CURRENT_HEADLINE]\nMy current 'About' section summary: [CURRENT_SUMMARY_TEXT]\nMy target roles/industry: [TARGET_ROLES_INDUSTRY]\nKey skills I want to emphasize: [SKILLS_LIST]\n\nFocus on actionable advice for:\n- Headline optimization (keywords, value proposition)\n- 'About' section (storytelling, achievements, call to action)\n- Experience descriptions (using STAR method, quantifying results)\n- Skills section (relevant skills, endorsements)\n- Other sections (e.g., recommendations, projects, education)",
    tags: ["career", "linkedin", "personal branding", "job search", "networking", "profile optimization"]
  },
  {
    id: 48,
    title: "Salary Negotiation Scripter",
    description: "Prepare scripts and strategies for salary negotiation",
    category: "Career",
    prompt: "Help me prepare for salary negotiation for the role of [JOB_TITLE] at [COMPANY_NAME].\n\nOffer received (if any, including base, bonus, benefits): [SALARY_OFFER_DETAILS]\nMy research on the typical salary range for this role/location/experience level: [SALARY_RESEARCH_RANGE_AND_SOURCES]\nMy desired salary/compensation package: [DESIRED_SALARY_AND_COMPONENTS]\nKey contributions, skills, and value I bring to this role: [MY_VALUE_PROPOSITION_AND_KEY_STRENGTHS]\nAny leverage points I have (e.g., competing offers, unique skills): [LEVERAGE_POINTS]\n\nProvide:\n1. Talking points to justify my desired salary.\n2. Phrases for expressing gratitude for the offer while opening negotiation.\n3. Strategies for responding to common objections (e.g., 'this is our max budget').\n4. How to negotiate non-salary benefits if salary is firm.",
    tags: ["career", "salary negotiation", "job offer", "compensation", "negotiation"]
  },
  {
    id: 49,
    title: "Language Translator",
    description: "Translate text with cultural context and nuance",
    category: "Language",
    prompt: "Translate the following text from [SOURCE_LANGUAGE] to [TARGET_LANGUAGE]:\n\n[TEXT_TO_TRANSLATE]\n\nPlease provide:\n1. Direct translation\n2. Cultural context explanation if needed\n3. Alternative translations for key phrases\n4. Tone: [FORMAL/INFORMAL/BUSINESS/CASUAL]\n\nEnsure the translation maintains the original meaning and appropriate cultural sensitivity.",
    tags: ["translation", "language", "localization"]
  },
  {
    id: 60,
    title: "Idiom/Slang Explainer",
    description: "Understand the meaning and usage of idioms and slang",
    category: "Language",
    prompt: "Explain the meaning and usage of the idiom/slang phrase '[IDIOM_SLANG_PHRASE_TO_EXPLAIN]' in [LANGUAGE - e.g., English, Spanish, French].\n\nPlease provide:\n1. A clear definition of the phrase.\n2. Its literal translation (if applicable and different).\n3. [NUMBER] example sentences showing how it's used in context.\n4. Whether it's considered formal, informal, or neutral.\n5. Any regional variations or common contexts where it's used.\n6. Similar idioms or phrases, if any.",
    tags: ["language", "idioms", "slang", "vernacular", "cultural understanding", "learning"]
  },
  {
    id: 61,
    title: "Grammar Corrector & Explainer",
    description: "Correct grammar and get explanations for the corrections",
    category: "Language",
    prompt: "Correct the grammar in the following sentence(s) written in [LANGUAGE]:\n\n'[SENTENCE_OR_PARAGRAPH_WITH_POTENTIAL_ERRORS]'\n\nFor each correction made, please:\n1. Show the corrected sentence(s).\n2. Clearly explain the grammatical error(s) that were present.\n3. Explain why the corrected version is grammatically sound, referencing specific grammar rules if possible.\nFocus on [SPECIFIC_GRAMMAR_POINT_IF_ANY - e.g., tense usage, prepositions, word order, subject-verb agreement].",
    tags: ["language", "grammar", "proofreading", "writing aid", "correction", "learning"]
  },
  {
    id: 62,
    title: "Cultural Nuance Advisor for Communication",
    description: "Get advice on cultural nuances for effective communication",
    category: "Language",
    prompt: "I need to communicate the following message to someone from [CULTURE/COUNTRY/REGION]:\n\nMessage content/purpose: [MESSAGE_CONTENT_OR_PURPOSE_OF_COMMUNICATION]\nMy relationship with the person: [RELATIONSHIP_TYPE - e.g., business colleague, potential client, friend, stranger]\nContext of communication: [CONTEXT - e.g., email, face-to-face meeting, formal presentation, casual chat]\nLanguage of communication: [LANGUAGE]\n\nWhat cultural nuances, customs, or etiquette should I be aware of to ensure my message is received positively and respectfully? \nSpecifically, advise on:\n- Appropriate level of formality/directness.\n- Topics to avoid or approach with caution.\n- Non-verbal cues (if applicable to context).\n- Common communication pitfalls for outsiders.",
    tags: ["language", "cultural communication", "etiquette", "intercultural", "global business", "sensitivity"]
  },
  {
    id: 63,
    title: "Workout Planner",
    description: "Design personalized fitness routines and exercise plans",
    category: "Health & Fitness",
    prompt: "Create a personalized workout plan:\n\nGoals: [WEIGHT_LOSS/MUSCLE_GAIN/ENDURANCE/STRENGTH]\nFitness Level: [BEGINNER/INTERMEDIATE/ADVANCED]\nTime Available: [MINUTES_PER_SESSION]\nFrequency: [DAYS_PER_WEEK]\nEquipment: [HOME/GYM/BODYWEIGHT_ONLY]\nLimitations: [INJURIES_OR_RESTRICTIONS]\n\nProvide:\n- Weekly schedule\n- Specific exercises with sets/reps\n- Progression plan\n- Recovery recommendations",
    tags: ["fitness", "health", "exercise", "workout"]
  },
  {
    id: 64,
    title: "Healthy Meal Suggester",
    description: "Get healthy meal ideas based on dietary needs and preferences",
    category: "Health & Fitness",
    prompt: "Suggest [NUMBER] healthy meal ideas for [MEAL_TYPE - breakfast/lunch/dinner/snack].\n\nMy dietary preferences/restrictions: [PREFERENCES - e.g., vegetarian, vegan, high-protein, low-carb, gluten-free, dairy-free, specific allergies]\nApproximate calorie target per meal (optional): [CALORIE_TARGET]\nDesired prep/cook time: [QUICK_UNDER_30_MIN/MODERATE/NO_LIMIT]\nMain ingredients I have or like: [INGREDIENTS_LIST (optional)]\nMy health goals: [WEIGHT_LOSS/MUSCLE_GAIN/GENERAL_WELLBEING/ENERGY_BOOST]\n\nFor each meal idea, provide a brief description and key ingredients.",
    tags: ["health & fitness", "nutrition", "healthy eating", "meal ideas", "diet"]
  },
  {
    id: 65,
    title: "Mindfulness Exercise Guide",
    description: "Get guided instructions for mindfulness exercises",
    category: "Health & Fitness",
    prompt: "Guide me through a [DURATION - e.g., 5-minute, 10-minute, 15-minute] mindfulness exercise.\n\nMy primary goal for this exercise: [PURPOSE - e.g., stress reduction, improved focus, relaxation before sleep, managing anxiety]\nMy current state/feeling: [FEELING_STRESSED/ANXIOUS/DISTRACTED/TIRED (optional)]\nPreferred style of mindfulness (if any): [GUIDED_MEDITATION/BREATHING_EXERCISE/BODY_SCAN/LOVING_KINDNESS]\n\nProvide step-by-step instructions in a calm and guiding tone. Include prompts for focusing attention and handling distractions.",
    tags: ["health & fitness", "mindfulness", "meditation", "stress relief", "mental wellbeing", "relaxation"]
  },
  {
    id: 66,
    title: "Injury Prevention Tips for [Activity]",
    description: "Learn how to prevent injuries for a specific physical activity",
    category: "Health & Fitness",
    prompt: "Provide injury prevention tips for [PHYSICAL_ACTIVITY - e.g., running, weightlifting, yoga, cycling, swimming, team sport like basketball].\n\nMy experience level with this activity: [BEGINNER/INTERMEDIATE/ADVANCED]\nAny past injuries or specific concerns I have: [PAST_INJURIES_OR_CONCERNS (optional)]\n\nFocus on practical advice covering:\n1. Proper warm-up routines.\n2. Correct form and technique for key movements.\n3. Common mistakes to avoid.\n4. Importance of cool-down and stretching.\n5. Role of appropriate gear/equipment.\n6. Listening to your body and signs of overtraining.",
    tags: ["health & fitness", "injury prevention", "exercise safety", "sports", "workout tips"]
  },
  {
    id: 67,
    title: "Travel Itinerary Planner",
    description: "Plan detailed travel itineraries with recommendations",
    category: "Travel",
    prompt: "Create a detailed travel itinerary for:\n\nDestination: [CITY/COUNTRY]\nDuration: [NUMBER_OF_DAYS]\nTravel Dates: [DATES]\nBudget: [BUDGET_RANGE]\nTravel Style: [LUXURY/MID-RANGE/BUDGET/BACKPACKING]\nInterests: [CULTURE/FOOD/ADVENTURE/RELAXATION/HISTORY]\nGroup: [SOLO/COUPLE/FAMILY/FRIENDS]\n\nInclude:\n- Daily schedules\n- Must-see attractions\n- Restaurant recommendations\n- Transportation options\n- Budget breakdown\n- Local tips and cultural notes",
    tags: ["travel", "planning", "vacation", "itinerary"]
  },
  {
    id: 68,
    title: "Packing List Generator",
    description: "Generate a comprehensive packing list for a trip",
    category: "Travel",
    prompt: "Generate a packing list for a trip to [DESTINATION_CITY_COUNTRY_REGION] for [NUMBER_OF_DAYS] days.\n\nTime of year/Expected weather: [SEASON/MONTH/EXPECTED_WEATHER_CONDITIONS]\nPlanned activities: [ACTIVITIES_LIST - e.g., hiking, beach, city sightseeing, business meetings, formal dinners, skiing]\nType of accommodation: [HOTEL/HOSTEL/AIRBNB/CAMPING]\nLuggage type allowed/preferred: [CARRY-ON_ONLY/CHECKED_BAGGAGE/BACKPACK]\nAny specific items I shouldn't forget: [PERSONAL_MUST_HAVES_OR_REMINDERS]\n\nCategorize the list (e.g., Clothing, Toiletries, Documents, Electronics, Medications).",
    tags: ["travel", "packing list", "preparation", "organization", "vacation"]
  },
  {
    id: 69,
    title: "Local Etiquette Guide",
    description: "Learn about local customs and etiquette for a destination",
    category: "Travel",
    prompt: "Provide a guide on local customs and etiquette for travelers visiting [COUNTRY/REGION/CITY].\n\nKey areas to cover:\n- Greetings and addressing people (formality, titles).\n- Dining etiquette (tipping, table manners, sharing food).\n- Dress code for public places, religious sites, or specific occasions.\n- Gift-giving customs (if applicable).\n- Appropriate public behavior (PDA, noise levels, gestures to avoid).\n- Sensitive topics to avoid in conversation.\n\nHighlight common faux pas for tourists and provide tips on how to show respect to local culture and people.",
    tags: ["travel", "etiquette", "cultural sensitivity", "customs", "local guide", "respectful travel"]
  },
  {
    id: 70,
    title: "'Off-the-Beaten-Path' Recommendation Finder",
    description: "Discover unique, non-touristy attractions and experiences",
    category: "Travel",
    prompt: "Suggest [NUMBER] 'off-the-beaten-path' attractions or experiences in [CITY/REGION].\n\nMy interests: [INTERESTS - e.g., local culture, authentic food, nature, hidden history, street art, unique shops, live music]\nI want to avoid: [TYPICAL_TOURIST_TRAPS_OR_OVERCROWDED_PLACES]\nMy travel style: [ADVENTUROUS/CURIOUS_EXPLORER/RELAXED_WANDERER/BUDGET_CONSCIOUS]\nDuration of my stay in this area: [NUMBER_OF_DAYS]\n\nFor each suggestion, provide a brief description, why it's unique or less known, and any tips for visiting (e.g., best time, how to get there).",
    tags: ["travel", "hidden gems", "local experiences", "authentic travel", "adventure", "exploration"]
  },
  {
    id: 71,
    title: "Interview Preparation",
    description: "Prepare comprehensive answers for job interviews",
    category: "Career",
    prompt: "Help me prepare for a job interview:\n\nPosition: [JOB_TITLE]\nCompany: [COMPANY_NAME]\nIndustry: [INDUSTRY]\nInterview Type: [PHONE/VIDEO/IN-PERSON/PANEL]\n\nMy Background:\n- Current Role: [CURRENT_POSITION]\n- Relevant Experience: [EXPERIENCE]\n- Key Strengths: [STRENGTHS]\n- Areas for Growth: [WEAKNESSES]\n\nProvide:\n1. Common interview questions with sample answers\n2. Questions to ask the interviewer\n3. Company research talking points\n4. STAR method examples\n5. Salary negotiation tips",
    tags: ["interview", "career", "preparation", "job search"]
  },
  {
    id: 72,
    title: "Budget Planner",
    description: "Create personal or business budgets and financial plans",
    category: "Finance",
    prompt: "Create a comprehensive budget plan:\n\nBudget Type: [PERSONAL/BUSINESS/PROJECT]\n\nMonthly Income: [AMOUNT]\n\nCurrent Expenses: [LIST_EXPENSES]\n\nFinancial Goals: [GOALS]\n\nTimeframe: [MONTHS/YEARS]\n\nPriorities: [DEBT_PAYOFF/SAVINGS/INVESTMENT]\n\nProvide:\n- Detailed budget breakdown\n- Expense categorization\n- Savings recommendations\n- Debt reduction strategy\n- Emergency fund planning\n- Investment suggestions",
    tags: ["finance", "budgeting", "money", "planning"]
  },
  {
    id: 73,
    title: "Investment Portfolio Allocator (Basic)",
    description: "Get basic suggestions for investment portfolio allocation",
    category: "Finance",
    prompt: "Suggest a basic investment portfolio allocation for someone with the following profile:\n\nRisk tolerance: [CONSERVATIVE/MODERATE/AGGRESSIVE]\nInvestment time horizon: [SHORT-TERM (1-3 years)/MEDIUM-TERM (3-10 years)/LONG-TERM (10+ years)]\nPrimary investment goals: [GOALS - e.g., retirement savings, buying a house, wealth growth, generating income]\nAmount to invest (optional, for context): [AMOUNT]\nKnowledge level about investing: [BEGINNER/INTERMEDIATE]\n\nSuggest a percentage allocation across major asset classes (e.g., stocks/equities, bonds/fixed income, cash, real estate/REITs, commodities). Provide a brief rationale for the allocation. \n\nDisclaimer: This is for informational purposes only and not financial advice.",
    tags: ["finance", "investing", "portfolio allocation", "asset allocation", "financial planning", "beginner investing"]
  },
  {
    id: 74,
    title: "Debt Reduction Strategy Planner",
    description: "Compare debt snowball vs. avalanche methods for your debts",
    category: "Finance",
    prompt: "Help me create a debt reduction strategy using either the debt snowball or debt avalanche method.\n\nMy debts:\n- Debt 1: [CREDITOR_NAME_1], Amount Owed: $[AMOUNT_1], Interest Rate: [RATE_1]%\n- Debt 2: [CREDITOR_NAME_2], Amount Owed: $[AMOUNT_2], Interest Rate: [RATE_2]%\n- Debt 3: [CREDITOR_NAME_3], Amount Owed: $[AMOUNT_3], Interest Rate: [RATE_3]%\n- (Add more debts as needed)\n\nExtra amount I can pay towards debt each month (above minimum payments): $[EXTRA_PAYMENT_AMOUNT]\n\n1. Explain both the debt snowball and debt avalanche methods.\n2. Show the order of payoff for my debts under each method.\n3. Discuss the pros and cons of each method in my situation (e.g., psychological benefits vs. interest saved).",
    tags: ["finance", "debt reduction", "debt snowball", "debt avalanche", "personal finance", "budgeting"]
  },
  {
    id: 75,
    title: "Financial Goal Savings Calculator",
    description: "Calculate how much to save regularly for a financial goal",
    category: "Finance",
    prompt: "I want to save for [FINANCIAL_GOAL - e.g., a down payment on a house, a new car, an emergency fund, a specific vacation].\n\nTarget amount needed for the goal: $[TARGET_AMOUNT]\nTimeframe to achieve this goal: [NUMBER] [YEARS/MONTHS]\nCurrent amount already saved for this goal: $[CURRENT_SAVINGS_AMOUNT]\nExpected average annual interest rate on savings (if applicable, e.g., for HYSA): [INTEREST_RATE]% (enter 0 if not applicable)\n\nCalculate:\n1. How much I need to save each [MONTH/WEEK] to reach this goal, considering current savings and potential interest.\n2. If I can only save $[FIXED_MONTHLY_SAVING_AMOUNT] per month, how long will it take to reach the goal?",
    tags: ["finance", "savings goal", "financial planning", "calculator", "budgeting", "personal finance"]
  },
  {
    id: 76,
    title: "Product Description Writer",
    description: "Write compelling product descriptions for e-commerce",
    category: "E-commerce",
    prompt: "Write a compelling product description for:\n\nProduct: [PRODUCT_NAME]\n\nCategory: [PRODUCT_CATEGORY]\n\nTarget Audience: [TARGET_CUSTOMER]\n\nKey Features: [FEATURES_LIST]\n\nBenefits: [BENEFITS_LIST]\n\nPrice Point: [PRICE_RANGE]\n\nBrand Voice: [PROFESSIONAL/CASUAL/LUXURY/FUN]\n\nInclude:\n- Attention-grabbing headline\n- Feature highlights\n- Benefit-focused copy\n- Technical specifications\n- Call-to-action\n- SEO keywords\n- Social proof elements",
    tags: ["ecommerce", "copywriting", "marketing", "product"]
  },
  {
    id: 77,
    title: "Customer Review Response Generator",
    description: "Draft responses to positive, negative, or neutral customer reviews",
    category: "E-commerce",
    prompt: "Draft a response to a [POSITIVE/NEGATIVE/NEUTRAL] customer review for our product: [PRODUCT_NAME].\n\nCustomer review text: '[PASTE_CUSTOMER_REVIEW_TEXT_HERE]'\nKey points from the review to address/acknowledge: [POINTS_TO_ADDRESS]\nDesired tone of response: [EMPATHETIC/GRATEFUL/PROFESSIONAL/APOLOGETIC/SOLUTION-ORIENTED]\nGoal of the response: [RETAIN_CUSTOMER/SHOW_APPRECIATION/ADDRESS_CONCERN_PUBLICLY/OFFER_SOLUTION/GATHER_MORE_INFO]\n\nIf negative, suggest how to take the conversation offline if appropriate.",
    tags: ["ecommerce", "customer service", "review management", "reputation", "communication"]
  },
  {
    id: 78,
    title: "Abandoned Cart Email Sequence Idea",
    description: "Outline an email sequence to recover abandoned shopping carts",
    category: "E-commerce",
    prompt: "Outline a [NUMBER]-email sequence to recover abandoned shopping carts for an e-commerce store selling [TYPE_OF_PRODUCTS - e.g., fashion apparel, electronics, handmade crafts].\n\nConsider the following for each email in the sequence:\n- Timing (e.g., 1 hour after abandonment, 24 hours, 3 days)\n- Subject line idea (catchy and relevant)\n- Key message/content (e.g., reminder, address concerns, offer help, highlight benefits)\n- Call to action (e.g., complete purchase, view cart, contact support)\n- Potential incentives (e.g., small discount, free shipping, limited-time offer - specify if/when to use)\n\nGoal: Maximize cart recovery rate.",
    tags: ["ecommerce", "email marketing", "abandoned cart", "conversion rate optimization", "marketing automation"]
  },
  {
    id: 79,
    title: "Upsell/Cross-sell Product Suggester",
    description: "Get suggestions for upselling or cross-selling products",
    category: "E-commerce",
    prompt: "A customer has just added [PRODUCT_A_NAME] to their cart (or is viewing its product page).\n\nDetails of Product A:\n- Category: [PRODUCT_A_CATEGORY]\n- Price: $[PRODUCT_A_PRICE]\n- Key features/benefits: [PRODUCT_A_FEATURES_BENEFITS]\n\nSuggest [NUMBER] relevant products for:\n1. Upselling (a slightly better, more expensive version or package).\n2. Cross-selling (complementary products that go well with Product A).\n\nFor each suggested product, provide:\n- Product Name: [SUGGESTED_PRODUCT_NAME]\n- Brief rationale for why it's a good suggestion (e.g., 'enhances Product A's functionality', 'customers who bought A also bought this', 'offers premium features').\n- Where to display this suggestion (e.g., product page, cart page, checkout).",
    tags: ["ecommerce","sales strategy", "conversion"]
  },
  {
    id: 80,
    title: "Study Guide Creator",
    description: "Generate comprehensive study materials and guides",
    category: "Education",
    prompt: "Create a study guide for:\n\nSubject: [SUBJECT_NAME]\n\nTopic: [SPECIFIC_TOPIC]\n\nEducation Level: [HIGH_SCHOOL/COLLEGE/GRADUATE/PROFESSIONAL]\n\nExam Date: [DATE]\n\nStudy Time Available: [HOURS_PER_DAY]\n\nLearning Style: [VISUAL/AUDITORY/KINESTHETIC/READING]\n\nInclude:\n- Key concepts and definitions\n- Study schedule\n- Practice questions\n- Memory techniques\n- Review strategies\n- Resource recommendations\n- Self-assessment checklist",
    tags: ["education", "studying"]
  },
  {
    id: 81,
    title: "Event Planning Assistant",
    description: "Plan and organize events with detailed checklists",
    category: "Event Planning",
    prompt: "Help me plan an event:\n\nEvent Type: [WEDDING/BIRTHDAY/CORPORATE/CONFERENCE/etc.]\nDate: [EVENT_DATE]\nGuest Count: [NUMBER_OF_GUESTS]\nBudget: [BUDGET_AMOUNT]\nVenue: [INDOOR/OUTDOOR/SPECIFIC_LOCATION]\nTheme/Style: [THEME_DESCRIPTION]\nSpecial Requirements: [DIETARY/ACCESSIBILITY/etc.]\n\nProvide:\n- Timeline and checklist\n- Budget breakdown\n- Vendor recommendations\n- Menu suggestions\n- Decoration ideas\n- Entertainment options\n- Contingency planning",
    tags: ["event planning", "organization", "checklist"]
  },
  {
    id: 82,
    title: "Event Invitation Wording Crafter",
    description: "Craft compelling wording for event invitations",
    category: "Event Planning",
    prompt: "Help draft the wording for an invitation to a [EVENT_TYPE - e.g., corporate gala, workshop, birthday party, webinar].\n\nEvent Name/Title: [EVENT_NAME]\nHosted by: [HOST_NAME_OR_ORGANIZATION]\nPurpose of the event: [PURPOSE_OF_EVENT]\nDate(s): [DATE_S]\nTime: [START_TIME] - [END_TIME] ([TIME_ZONE])\nLocation/Venue (or virtual platform details): [LOCATION_DETAILS]\nTarget audience/Guest type: [GUEST_TYPE - e.g., clients, employees, general public, friends & family]\nKey highlights or what attendees can expect: [KEY_HIGHLIGHTS_OR_BENEFITS]\nRSVP details (deadline, method - email/link/phone): [RSVP_CONTACT_DEADLINE_METHOD]\nDress code (if any): [DRESS_CODE]\nContact for inquiries: [CONTACT_INFO]\nDesired tone: [FORMAL/CASUAL/EXCITING/PROFESSIONAL_BUT_FRIENDLY]\n\nStructure the invitation clearly and engagingly.",
    tags: ["event planning", "communication", "event marketing"]
  },
  {
    id: 83,
    title: "Post-Event Thank You Note Writer",
    description: "Draft thank you notes for various event stakeholders",
    category: "Event Planning",
    prompt: "Draft a template for a post-event thank you note for a [EVENT_TYPE - e.g., conference, charity fundraiser, workshop].\n\nRecipient type (choose one or ask for variations):\n- Attendees/Guests\n- Speakers/Presenters\n- Sponsors/Donors\n- Volunteers/Staff\n\nKey highlights or successes of the event to mention: [EVENT_HIGHLIGHTS_SUCCESSES]\nSpecific contribution of the recipient type (if applicable): [e.g., for speakers: 'your insightful presentation on X', for sponsors: 'your generous support made Y possible']\nDesired message beyond thanks: [e.g., share resources, announce next event, solicit feedback, reinforce connections]\nCall to action (optional): [e.g., link to photo gallery, survey, next event registration]\nTone: [SINCERE/PROFESSIONAL/WARM/GRATEFUL]\n\nProvide a draft that can be personalized.",
    tags: ["event planning", "communication", "stakeholder relations"]
  },
  {
    id: 84,
    title: "Event Contingency Plan Brainstormer",
    description: "Brainstorm contingency plans for potential event risks",
    category: "Event Planning",
    prompt: "Help brainstorm contingency plans for a [EVENT_TYPE - e.g., outdoor festival, corporate conference, wedding] being held at [VENUE_TYPE_OR_SPECIFIC_VENUE] on [DATE_OR_SEASON].\n\nIdentify potential risks. For each risk, suggest backup plans or mitigation strategies. Consider these categories (and add others if relevant):\n1. Weather-related issues (for outdoor/semi-outdoor events): [e.g., rain, extreme heat/cold, wind]\n   - Potential Risk: [RISK_DESCRIPTION]\n   - Contingency Plan(s): [PLAN_DESCRIPTION]\n2. Vendor problems: [e.g., caterer no-show, AV equipment failure, photographer cancels]\n   - Potential Risk: [RISK_DESCRIPTION]\n   - Contingency Plan(s): [PLAN_DESCRIPTION]\n3. Low attendance/speaker cancellation:\n   - Potential Risk: [RISK_DESCRIPTION]\n   - Contingency Plan(s): [PLAN_DESCRIPTION]\n4. Technical difficulties (AV, internet, power):\n   - Potential Risk: [RISK_DESCRIPTION]\n   - Contingency Plan(s): [PLAN_DESCRIPTION]\n5. Safety/Security issues: [e.g., medical emergency, unexpected disruption]\n   - Potential Risk: [RISK_DESCRIPTION]\n   - Contingency Plan(s): [PLAN_DESCRIPTION]\n\nEvent scale (approx. guest count): [SMALL/MEDIUM/LARGE]\nBudget considerations for contingencies: [LOW/MEDIUM/HIGH_FLEXIBILITY]",
    tags: ["event planning", "risk management", "problem solving"]
  },
  
];