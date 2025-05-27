// frontend/src/components/PlaygroundView.js
import React, { useState, useEffect, useMemo } from 'react';

const LOGIN_REQUIRED_FOR_TEST_MESSAGE = "LOGIN_REQUIRED_FOR_TEST"; // Ensure this matches App.js

// Define LLM_PROVIDERS for mapping (can be imported if centralized)
const LLM_PROVIDERS_MAP = {
  'gemini': 'Gemini',
  'openai': 'OpenAI',
  'anthropic': 'Anthropic',
  // Add other providers here if you have more display names
};

// Define available models for each provider
const AVAILABLE_MODELS_BY_PROVIDER = {
  gemini: [
    { value: 'gemini-1.5-flash-latest', label: 'Gemini 1.5 Flash (Latest)' },
    { value: 'gemini-1.5-pro-latest', label: 'Gemini 1.5 Pro (Latest)' },
    // { value: 'gemini-pro', label: 'Gemini Pro (Legacy)' }, // Corrected: Use specific, current API model IDs
    // Example of a more specific version if needed:
    // { value: 'models/gemini-1.5-pro-001', label: 'Gemini 1.5 Pro 001'}
    { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' }
  ],
  openai: [
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
    { value: 'gpt-4', label: 'GPT-4' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
    // Add other OpenAI models. Check OpenAI docs for exact model IDs.
  ],
  anthropic: [
    { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus' },
    { value: 'claude-3-sonnet-20240229', label: 'Claude 3 Sonnet' },
    { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku' },
    // Add other Anthropic models. Check Anthropic docs for exact model IDs.
  ],
  // Add other providers and their models here
};

function PlaygroundView({ 
  prompt, 
  selectedVersionId, 
  onRunTest, 
  onSaveAsNewVersion, 
  isAuthenticated, 
  onLogin,
  userApiKeys,      // <-- Added prop from MainContent
  apiKeysLoading    // <-- Added prop from MainContent
}) { 
  const [editedPromptText, setEditedPromptText] = useState('');
  const [aiOutput, setAiOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLlmProvider, setSelectedLlmProvider] = useState(''); // State for selected provider
  const [selectedModelId, setSelectedModelId] = useState(''); // State for selected model ID
  const [isSavingNewVersion, setIsSavingNewVersion] = useState(false); // Added for save loading state

  const selectedVersion = prompt?.versions?.[selectedVersionId];

  const availableProviders = useMemo(() => {
    if (!userApiKeys) return [];
    return userApiKeys.map(key => ({
        value: key.llm_provider,
        label: LLM_PROVIDERS_MAP[key.llm_provider.toLowerCase()] || key.llm_provider.toUpperCase()
    }));
  }, [userApiKeys]);

  useEffect(() => {
    setEditedPromptText(selectedVersion?.text || '');
    setAiOutput('');
    setIsLoading(false);
    // Set initial selected provider based on available keys
    if (userApiKeys && userApiKeys.length > 0) {
      const firstProvider = userApiKeys[0].llm_provider;
      setSelectedLlmProvider(firstProvider);
      // Also set the initial model for this provider
      const modelsForProvider = AVAILABLE_MODELS_BY_PROVIDER[firstProvider.toLowerCase()];
      if (modelsForProvider && modelsForProvider.length > 0) {
        setSelectedModelId(modelsForProvider[0].value);
      } else {
        setSelectedModelId('');
      }
    } else {
      setSelectedLlmProvider('');
      setSelectedModelId('');
    }
  }, [selectedVersion, userApiKeys]); // Add userApiKeys to dependency array

  const handleProviderChange = (newProviderValue) => {
    setSelectedLlmProvider(newProviderValue);
    const modelsForNewProvider = AVAILABLE_MODELS_BY_PROVIDER[newProviderValue.toLowerCase()];
    if (modelsForNewProvider && modelsForNewProvider.length > 0) {
      setSelectedModelId(modelsForNewProvider[0].value); // Default to first model of new provider
    } else {
      setSelectedModelId(''); // No models for this provider (or provider not in map)
    }
  };

  const handleRunTest = async () => {
    if (!editedPromptText.trim()) {
        setAiOutput("Please enter some prompt text to test.");
        return;
    }
    if (!isAuthenticated) { // Check auth first
      setAiOutput(
        <>
          Please <button onClick={onLogin} className="text-blue-500 hover:underline">Login or Create an Account</button> to enter your API Key and run tests.
        </>
      );
      return;
    }
    if (!selectedLlmProvider) {
      setAiOutput("Please select an LLM provider to use for the test.");
      return;
    }
    if (!selectedModelId) { // Check if a model is selected
      setAiOutput("Please select a specific model to use for the test.");
      return;
    }

    setIsLoading(true);
    setAiOutput('Running test...');
    try {
      // Pass the selectedLlmProvider and selectedModelId to onRunTest
      const result = await onRunTest(editedPromptText, selectedLlmProvider, selectedModelId); 
      if (result === LOGIN_REQUIRED_FOR_TEST_MESSAGE) {
        setAiOutput(
          <>
            Please <button onClick={onLogin} className="text-blue-500 hover:underline">Login or Create an Account</button> to enter your API Key and run tests.
          </>
        );
      } else {
        setAiOutput(result || 'No output received.');
      }
    } catch (error) {
      console.error("Error running test:", error);
      setAiOutput(`An error occurred while running the test: ${error.message || 'Please try again or check your API key.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => { // Made async
    if (!isAuthenticated) {
        alert("Please log in to save changes."); 
        if (onLogin) onLogin(); 
        return;
    }
    if (prompt && editedPromptText && editedPromptText !== selectedVersion?.text) {
      setIsSavingNewVersion(true); // Set loading true
      try {
        // Pass selectedLlmProvider and selectedModelId to onSaveAsNewVersion
        await onSaveAsNewVersion(prompt.id, editedPromptText, selectedLlmProvider, selectedModelId);
        // Optionally, reset editedPromptText to the newly saved version's text if desired,
        // or rely on App.js to reload and re-render.
        // For now, we assume App.js handles the refresh.
      } catch (error) {
        // Error is usually handled by an alert in onSaveAsNewVersion in App.js
        // If not, or if specific modal feedback is needed here:
        // console.error("Error saving new version from PlaygroundView:", error);
        // alert(`Failed to save new version: ${error.message}`);
      } finally {
        setIsSavingNewVersion(false); // Set loading false
      }
    } else {
        alert("Prompt text has not been changed or is empty.");
    }
  };

  if (!prompt || !selectedVersionId || !selectedVersion) {
    return (
      <div className="text-center text-light-secondary mt-10 text-xs sm:text-sm">
        Select a prompt and a version from the 'Details' view to start testing.
      </div>
    );
  }

  return (
    <div className="h-auto sm:h-full flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-base sm:text-lg font-medium text-light">
          Testing: <span className="font-semibold text-secondary">{prompt.title}</span> - {' '}
          <span className="font-semibold text-light-secondary">{selectedVersionId}</span>
        </h3>
        {/* Desktop: Dropdowns above grid, right-aligned */}
        {isAuthenticated && (
          <div className="hidden sm:flex  flex-row justify-end items-end gap-2 ml-4 flex-1">
            <div>
              <label htmlFor="llm-provider-select-desktop" className="mr-2 text-xs sm:text-sm font-medium text-light-secondary mb-1 text-right">
                Provider:
              </label>
              {apiKeysLoading ? (
                <span className="text-xs sm:text-sm text-light-secondary italic">Loading keys...</span>
              ) : availableProviders.length > 0 ? (
                <select 
                  id="llm-provider-select-desktop"
                  value={selectedLlmProvider}
                  onChange={(e) => handleProviderChange(e.target.value)}
                  className=" rounded-md border-light shadow-sm focus:border-primary focus:ring-primary text-xs sm:text-sm p-2 bg-surface mb-2 text-light min-w-[140px]"
                  disabled={isLoading}
                >
                  {availableProviders.map(provider => (
                    <option key={provider.value} value={provider.value}>{provider.label}</option>
                  ))}
                </select>
              ) : (
                <span className="text-xs sm:text-sm text-light-secondary italic">No API keys configured.</span>
              )}
            </div>
            {/* Model Dropdown - Shown if a provider is selected and has models */}
            {selectedLlmProvider && AVAILABLE_MODELS_BY_PROVIDER[selectedLlmProvider.toLowerCase()] && (
              <div>
                <label htmlFor="llm-model-select-desktop" className="mx-2 text-xs sm:text-sm font-medium text-light-secondary mb-1 text-right">
                  Model:
                </label>
                <select
                  id="llm-model-select-desktop"
                  value={selectedModelId}
                  onChange={(e) => setSelectedModelId(e.target.value)}
                  className="rounded-md border-light shadow-sm focus:border-primary focus:ring-primary text-xs sm:text-sm p-2 bg-surface mb-2 text-light min-w-[180px]"
                  disabled={isLoading || !selectedLlmProvider}
                >
                  {(AVAILABLE_MODELS_BY_PROVIDER[selectedLlmProvider.toLowerCase()] || []).map(model => (
                    <option key={model.value} value={model.value}>{model.label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex-1  grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-visible">
        <div className="flex flex-col bg-surface glass p-3 sm:p-6 rounded-xl border border-light overflow-hidden">
          <label htmlFor="editable-prompt" className="block text-xs sm:text-sm font-medium text-light-secondary  mb-2">
            Edit Prompt:
          </label>
          <textarea
            id="editable-prompt"
            name="editable-prompt"
            value={editedPromptText}
            onChange={(e) => setEditedPromptText(e.target.value)}
            className="flex-1 w-full p-8 border border-light rounded-lg whitespace-pre-wrap overflow-y-auto text-xs sm:text-sm bg-dark text-light focus:ring-secondary focus:border-secondary resize-none mb-3"
            placeholder="Enter or edit your prompt text here..."
          />
          <div className="mt-auto flex flex-col gap-3 pt-3 border-light-top">
            <div className="flex gap-2 w-full">
              <button
                onClick={handleRunTest}
                disabled={isLoading || !editedPromptText.trim() || (isAuthenticated && (!selectedLlmProvider || !selectedModelId) && !apiKeysLoading)}
                className={`btn-secondary font-medium py-2 px-4 rounded-xl transition duration-150 ease-in-out shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm w-1/2 ${isLoading ? 'animate-pulse' : ''}`}
              >
                {isLoading ? 'Running...' : 'Run Test'}
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading || isSavingNewVersion || !editedPromptText.trim() || editedPromptText === selectedVersion.text}
                className="btn-accent font-medium py-2 px-4 rounded-xl transition duration-150 ease-in-out shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm w-1/2"
              >
                {isSavingNewVersion ? 'Saving...' : 'Save as New Version'}
              </button>
            </div>
            {/* Mobile: Dropdowns below buttons */}
            {isAuthenticated && (
              <div className="flex flex-col gap-2 mt-2 sm:hidden">
                <div>
                  <label htmlFor="llm-provider-select" className="block text-xs sm:text-sm font-medium text-light-secondary mb-1">
                    Provider:
                  </label>
                  {apiKeysLoading ? (
                    <span className="text-xs sm:text-sm text-light-secondary italic">Loading keys...</span>
                  ) : availableProviders.length > 0 ? (
                    <select 
                      id="llm-provider-select"
                      value={selectedLlmProvider}
                      onChange={(e) => handleProviderChange(e.target.value)}
                      className="block w-full rounded-md border-light shadow-sm focus:border-primary focus:ring-primary text-xs sm:text-sm p-2 bg-surface mb-2 text-light"
                      disabled={isLoading}
                    >
                      {availableProviders.map(provider => (
                        <option key={provider.value} value={provider.value}>{provider.label}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-xs sm:text-sm text-light-secondary italic">No API keys configured.</span>
                  )}
                </div>
                {/* Model Dropdown - Shown if a provider is selected and has models */}
                {selectedLlmProvider && AVAILABLE_MODELS_BY_PROVIDER[selectedLlmProvider.toLowerCase()] && (
                  <div>
                    <label htmlFor="llm-model-select" className="block text-xs sm:text-sm font-medium text-light-secondary mb-1">
                      Model:
                    </label>
                    <select
                      id="llm-model-select"
                      value={selectedModelId}
                      onChange={(e) => setSelectedModelId(e.target.value)}
                      className="block w-full rounded-md border-light shadow-sm focus:border-primary focus:ring-primary text-xs sm:text-sm p-2 bg-surface mb-2 text-light"
                      disabled={isLoading || !selectedLlmProvider}
                    >
                      {(AVAILABLE_MODELS_BY_PROVIDER[selectedLlmProvider.toLowerCase()] || []).map(model => (
                        <option key={model.value} value={model.value}>{model.label}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col bg-surface glass p-3 sm:p-6 rounded-xl border border-light overflow-hidden">
          <label htmlFor="ai-output" className="block text-xs sm:text-sm font-medium text-light-secondary mb-2">
            AI Output:
          </label>
          <div id="ai-output" className="flex-1 w-full p-3 border border-light bg-dark text-light rounded-lg text-xs sm:text-sm overflow-y-auto whitespace-pre-wrap break-words">
            {aiOutput || <span className="text-light-tertiary italic">Click 'Run Test' to see the AI output...</span>}
          </div>
        </div>
      </div>
      <div className="bg-surface glass p-3 sm:p-6 rounded-xl border border-light mt-4 flex-shrink-0">
        <h4 className="font-semibold mb-2 text-light text-xs sm:text-base">Original Prompt ({selectedVersionId}):</h4>
        <pre className="bg-dark p-3 rounded text-xs sm:text-sm text-light whitespace-pre-wrap break-words overflow-x-auto border border-light">
          {selectedVersion.text}
        </pre>
      </div>
    </div>
  );
}

export default PlaygroundView;
