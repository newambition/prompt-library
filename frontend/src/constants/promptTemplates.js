export const PROMPT_TEMPLATES = [
  {
    id: 1,
    title: "Marketing Copy Generator",
    description: "Create compelling marketing copy for products and services",
    category: "Marketing",
    prompt: "Create engaging marketing copy for [PRODUCT/SERVICE].\n\nInclude a catchy headline, key benefits, and a strong call-to-action.\n\nTarget audience: [TARGET_AUDIENCE].\n\nTone: [TONE - professional/casual/exciting].",
    tags: ["marketing"]
  },
  {
    id: 2,
    title: "Code Review Assistant",
    description: "Get detailed code reviews and improvement suggestions",
    category: "Development",
    prompt: "Please review the following code and provide feedback on:\n1. Code quality and best practices\n2. Potential bugs or issues\n3. Performance improvements\n4. Security considerations\n5. Readability and maintainability\n\nCode:\n[PASTE_CODE_HERE]",
    tags: ["coding", "development"]
  },
  {
    id: 3,
    title: "Email Writer",
    description: "Craft professional emails for various purposes",
    category: "Communication",
    prompt: "Write a professional email for [PURPOSE].\n\nRecipient: [RECIPIENT].\n\nKey points to include: [KEY_POINTS].\n\nTone should be [TONE - formal/friendly/urgent].\n\nInclude appropriate subject line.",
    tags: ["email", "professional"]
  },
  {
    id: 4,
    title: "Creative Story Starter",
    description: "Generate creative story beginnings and plot ideas",
    category: "Creative",
    prompt: "Create an engaging story beginning with the following elements:\n\n- Genre: [GENRE]\n- Main character: [CHARACTER_DESCRIPTION]\n- Setting: [SETTING]\n- Conflict/Challenge: [CONFLICT]\n\nWrite the opening 2-3 paragraphs that hook the reader.",
    tags: ["creative", "writing"]
  },
  {
    id: 5,
    title: "Data Analysis Helper",
    description: "Analyze data patterns and generate insights",
    category: "Analytics",
    prompt: "Analyze the following data and provide insights:\n\nData: [PASTE_DATA_HERE]\n\nPlease provide:\n1. Key patterns and trends\n2. Notable outliers or anomalies\n3. Actionable insights\n4. Recommendations for next steps\n5. Potential areas for further investigation",
    tags: ["data", "analysis"]
  },
  {
    id: 6,
    title: "Meeting Summarizer",
    description: "Create concise summaries of meetings and discussions",
    category: "Productivity",
    prompt: "Summarize the following meeting notes into a clear, actionable format:\n\nMeeting: [MEETING_TITLE]\nDate: [DATE]\nAttendees: [ATTENDEES]\n\nNotes: [PASTE_NOTES_HERE]\n\nPlease provide:\n- Key decisions made\n- Action items with owners\n- Next steps\n- Important discussion points",
    tags: ["meetings", "productivity"]
  },
  {
    id: 7,
    title: "Social Media Post Creator",
    description: "Generate engaging social media content",
    category: "Social Media",
    prompt: "Create engaging social media posts for [PLATFORM - Instagram/Twitter/LinkedIn/Facebook] about [TOPIC].\n\nInclude:\n- Compelling caption\n- Relevant hashtags\n- Call-to-action\n- Tone: [TONE]\n\nTarget audience: [AUDIENCE]",
    tags: ["social media", "content", "engagement"]
  },
  {
    id: 8,
    title: "Learning Tutor",
    description: "Get explanations and help with learning new concepts",
    category: "Education",
    prompt: "Explain [CONCEPT/TOPIC] in simple terms.\n\nI am a [SKILL_LEVEL - beginner/intermediate/advanced] learner.\n\nPlease:\n1. Provide a clear definition\n2. Give practical examples\n3. Explain why it's important\n4. Suggest next steps for learning\n5. Include any common misconceptions to avoid",
    tags: ["education", "learning", "explanation"]
  },
  {
    id: 9,
    title: "Problem Solver",
    description: "Break down complex problems into manageable solutions",
    category: "Problem Solving",
    prompt: "Help me solve this problem: [DESCRIBE_PROBLEM]\n\nPlease:\n1. Break down the problem into smaller parts\n2. Identify potential root causes\n3. Suggest multiple solution approaches\n4. Evaluate pros and cons of each approach\n5. Recommend the best solution with implementation steps",
    tags: ["problem solving", "analysis", "strategy"]
  },
  {
    id: 10,
    title: "Recipe Creator",
    description: "Create custom recipes based on ingredients and preferences",
    category: "Cooking",
    prompt: "Create a recipe using these ingredients: [LIST_INGREDIENTS]\n\nPreferences:\n- Dietary restrictions: [RESTRICTIONS]\n- Cooking time: [TIME_AVAILABLE]\n- Skill level: [BEGINNER/INTERMEDIATE/ADVANCED]\n- Cuisine style: [CUISINE_TYPE]\n\nProvide step-by-step instructions, cooking tips, and serving suggestions.",
    tags: ["cooking", "recipe", "food"]
  },
  {
    id: 11,
    title: "Business Plan Generator",
    description: "Create comprehensive business plans and strategies",
    category: "Business",
    prompt: "Create a business plan for [BUSINESS_IDEA]. Include:\n\n1. Executive Summary\n2. Market Analysis\n3. Target Audience: [TARGET_MARKET]\n4. Revenue Model\n5. Marketing Strategy\n6. Financial Projections (3-year)\n7. Risk Assessment\n8. Implementation Timeline\n\nBusiness Type: [SERVICE/PRODUCT/TECH/etc.]\nStartup Budget: [BUDGET_RANGE]",
    tags: ["business", "planning", "strategy"]
  },
  {
    id: 12,
    title: "Resume Builder",
    description: "Craft professional resumes tailored to specific roles",
    category: "Career",
    prompt: "Create a professional resume for:\n\nPosition: [JOB_TITLE]\nIndustry: [INDUSTRY]\nExperience Level: [ENTRY/MID/SENIOR]\n\nBackground:\n- Current Role: [CURRENT_POSITION]\n- Years of Experience: [YEARS]\n- Key Skills: [SKILLS_LIST]\n- Education: [EDUCATION_BACKGROUND]\n- Notable Achievements: [ACHIEVEMENTS]\n\nFormat the resume with strong action verbs, quantified achievements, and ATS-friendly keywords.",
    tags: ["career", "resume", "professional"]
  },
  {
    id: 13,
    title: "Language Translator",
    description: "Translate text with cultural context and nuance",
    category: "Language",
    prompt: "Translate the following text from [SOURCE_LANGUAGE] to [TARGET_LANGUAGE]:\n\n[TEXT_TO_TRANSLATE]\n\nPlease provide:\n1. Direct translation\n2. Cultural context explanation if needed\n3. Alternative translations for key phrases\n4. Tone: [FORMAL/INFORMAL/BUSINESS/CASUAL]\n\nEnsure the translation maintains the original meaning and appropriate cultural sensitivity.",
    tags: ["translation", "language", "communication"]
  },
  {
    id: 14,
    title: "Workout Planner",
    description: "Design personalized fitness routines and exercise plans",
    category: "Health & Fitness",
    prompt: "Create a personalized workout plan:\n\nGoals: [WEIGHT_LOSS/MUSCLE_GAIN/ENDURANCE/STRENGTH]\nFitness Level: [BEGINNER/INTERMEDIATE/ADVANCED]\nTime Available: [MINUTES_PER_SESSION]\nFrequency: [DAYS_PER_WEEK]\nEquipment: [HOME/GYM/BODYWEIGHT_ONLY]\nLimitations: [INJURIES_OR_RESTRICTIONS]\n\nProvide:\n- Weekly schedule\n- Specific exercises with sets/reps\n- Progression plan\n- Recovery recommendations",
    tags: ["fitness", "health", "exercise"]
  },
  {
    id: 15,
    title: "Travel Itinerary Planner",
    description: "Plan detailed travel itineraries with recommendations",
    category: "Travel",
    prompt: "Create a detailed travel itinerary for:\n\nDestination: [CITY/COUNTRY]\nDuration: [NUMBER_OF_DAYS]\nTravel Dates: [DATES]\nBudget: [BUDGET_RANGE]\nTravel Style: [LUXURY/MID-RANGE/BUDGET/BACKPACKING]\nInterests: [CULTURE/FOOD/ADVENTURE/RELAXATION/HISTORY]\nGroup: [SOLO/COUPLE/FAMILY/FRIENDS]\n\nInclude:\n- Daily schedules\n- Must-see attractions\n- Restaurant recommendations\n- Transportation options\n- Budget breakdown\n- Local tips and cultural notes",
    tags: ["travel", "planning", "vacation"]
  },
  {
    id: 16,
    title: "Interview Preparation",
    description: "Prepare comprehensive answers for job interviews",
    category: "Career",
    prompt: "Help me prepare for a job interview:\n\nPosition: [JOB_TITLE]\nCompany: [COMPANY_NAME]\nIndustry: [INDUSTRY]\nInterview Type: [PHONE/VIDEO/IN-PERSON/PANEL]\n\nMy Background:\n- Current Role: [CURRENT_POSITION]\n- Relevant Experience: [EXPERIENCE]\n- Key Strengths: [STRENGTHS]\n- Areas for Growth: [WEAKNESSES]\n\nProvide:\n1. Common interview questions with sample answers\n2. Questions to ask the interviewer\n3. Company research talking points\n4. STAR method examples\n5. Salary negotiation tips",
    tags: ["interview", "career", "preparation"]
  },
  {
    id: 17,
    title: "Budget Planner",
    description: "Create personal or business budgets and financial plans",
    category: "Finance",
    prompt: "Create a comprehensive budget plan:\n\nBudget Type: [PERSONAL/BUSINESS/PROJECT]\n\nMonthly Income: [AMOUNT]\n\nCurrent Expenses: [LIST_EXPENSES]\n\nFinancial Goals: [GOALS]\n\nTimeframe: [MONTHS/YEARS]\n\nPriorities: [DEBT_PAYOFF/SAVINGS/INVESTMENT]\n\nProvide:\n- Detailed budget breakdown\n- Expense categorization\n- Savings recommendations\n- Debt reduction strategy\n- Emergency fund planning\n- Investment suggestions",
    tags: ["finance", "budgeting", "money"]
  },
  {
    id: 18,
    title: "Product Description Writer",
    description: "Write compelling product descriptions for e-commerce",
    category: "E-commerce",
    prompt: "Write a compelling product description for:\n\nProduct: [PRODUCT_NAME]\n\nCategory: [PRODUCT_CATEGORY]\n\nTarget Audience: [TARGET_CUSTOMER]\n\nKey Features: [FEATURES_LIST]\n\nBenefits: [BENEFITS_LIST]\n\nPrice Point: [PRICE_RANGE]\n\nBrand Voice: [PROFESSIONAL/CASUAL/LUXURY/FUN]\n\nInclude:\n- Attention-grabbing headline\n- Feature highlights\n- Benefit-focused copy\n- Technical specifications\n- Call-to-action\n- SEO keywords\n- Social proof elements",
    tags: ["ecommerce", "copywriting", "marketing"]
  },
  {
    id: 19,
    title: "Study Guide Creator",
    description: "Generate comprehensive study materials and guides",
    category: "Education",
    prompt: "Create a study guide for:\n\nSubject: [SUBJECT_NAME]\n\nTopic: [SPECIFIC_TOPIC]\n\nEducation Level: [HIGH_SCHOOL/COLLEGE/GRADUATE/PROFESSIONAL]\n\nExam Date: [DATE]\n\nStudy Time Available: [HOURS_PER_DAY]\n\nLearning Style: [VISUAL/AUDITORY/KINESTHETIC/READING]\n\nInclude:\n- Key concepts and definitions\n- Study schedule\n- Practice questions\n- Memory techniques\n- Review strategies\n- Resource recommendations\n- Self-assessment checklist",
    tags: ["education", "studying", "learning"]
  },
  {
    id: 20,
    title: "Event Planning Assistant",
    description: "Plan and organize events with detailed checklists",
    category: "Event Planning",
    prompt: "Help me plan an event:\n\nEvent Type: [WEDDING/BIRTHDAY/CORPORATE/CONFERENCE/etc.]\nDate: [EVENT_DATE]\nGuest Count: [NUMBER_OF_GUESTS]\nBudget: [BUDGET_AMOUNT]\nVenue: [INDOOR/OUTDOOR/SPECIFIC_LOCATION]\nTheme/Style: [THEME_DESCRIPTION]\nSpecial Requirements: [DIETARY/ACCESSIBILITY/etc.]\n\nProvide:\n- Timeline and checklist\n- Budget breakdown\n- Vendor recommendations\n- Menu suggestions\n- Decoration ideas\n- Entertainment options\n- Contingency planning",
    tags: ["events", "planning", "organization"]
  }
]; 