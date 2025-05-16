// Mock data for now

export const promptsData = {
    prompt1: {
        id: 'prompt1',
        title: "Generate Blog Post Ideas",
        tags: ["Marketing"],
        versions: {
            v3: { id: 'v3', date: "May 12, 2025", text: "Generate 5 catchy and SEO-friendly blog post titles about sustainable gardening practices for urban dwellers. Keep titles under 60 characters.", notes: "Optimized for shorter blog titles." },
            v2: { id: 'v2', date: "May 10, 2025", text: "Generate 5 blog post titles about sustainable gardening for city residents. Target audience: beginners.", notes: "Added constraint for target audience." },
            v1: { id: 'v1', date: "May 9, 2025", text: "Ideas for blog posts about urban gardening.", notes: "Initial draft." }
        },
        latestVersion: 'v3'
    },
    prompt2: {
        id: 'prompt2',
        title: "Python Code Refactoring",
        tags: ["Code Generation"],
        versions: {
            v1: { id: 'v1', date: "May 11, 2025", text: "Refactor the following Python code to improve readability and efficiency:\n\n[Your Python Code Here]", notes: "Basic refactoring request." }
        },
         latestVersion: 'v1'
    },
    prompt3: {
        id: 'prompt3',
        title: "Summarize Technical Document",
        tags: ["Summarization", "Internal"],
         versions: {
            v5: { id: 'v5', date: "May 12, 2025", text: "Provide a 3-sentence summary of the key findings in the attached technical specification document.", notes: "Focus on key findings only." },
            v4: { id: 'v4', date: "May 9, 2025", text: "Summarize the attached technical document in 100 words.", notes: "Concise summary." },
            // ... other versions
            v1: { id: 'v1', date: "May 1, 2025", text: "Summarize the attached document.", notes: "Initial request." }
        },
         latestVersion: 'v5'
    }
    // Add more prompts as needed
};

// Helper function to get prompts as an array
export const getPromptsArray = () => Object.values(promptsData);

// Helper function to get versions as a sorted array
export const getSortedVersionsArray = (prompt) => {
    if (!prompt || !prompt.versions) return [];
    return Object.values(prompt.versions).sort((a, b) => new Date(b.date) - new Date(a.date));
};

// Helper function to get tag color (basic example)
export const getTagClasses = (tag) => {
    switch (tag.toLowerCase()) {
        case 'marketing': return 'bg-green-100 text-green-800';
        case 'code generation': return 'bg-purple-100 text-purple-800';
        case 'summarization': return 'bg-yellow-100 text-yellow-800';
        case 'internal': return 'bg-blue-100 text-blue-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

export const getTagButtonClasses = (tag) => {
     switch (tag.toLowerCase()) {
        case 'marketing': return 'text-green-600 hover:text-green-800';
        case 'code generation': return 'text-purple-600 hover:text-purple-800';
        case 'summarization': return 'text-yellow-600 hover:text-yellow-800';
        case 'internal': return 'text-blue-600 hover:text-blue-800';
        default: return 'text-gray-600 hover:text-gray-900';
    }
}
