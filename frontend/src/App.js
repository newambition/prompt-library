// frontend/src/App.js
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import NewPromptModal from './components/NewPromptModal';
import SettingsModal from './components/SettingsModal';
import InitialViewAnimation from './components/InitialViewAnimation';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth0 } from '@auth0/auth0-react';
import {
  fetchPrompts as apiFetchPrompts,
  createPrompt as apiCreatePrompt,
  updateVersionNotes as apiUpdateVersionNotes,
  addTag as apiAddTag,
  removeTag as apiRemoveTag,
  createVersion as apiCreateVersion,
  deletePrompt as apiDeletePrompt,
  updatePrompt as apiUpdatePrompt,
  runPlaygroundTest as apiRunPlaygroundTest,
  getUserApiKeys as apiGetUserApiKeys
} from './api';

const LOGIN_REQUIRED_FOR_TEST_MESSAGE = "LOGIN_REQUIRED_FOR_TEST";
const LOGIN_REQUIRED_FOR_SAVE_MESSAGE = "Please log in to save your changes.";
const LOGIN_REQUIRED_FOR_SETTINGS_MESSAGE = "Please log in to access settings.";


function App() {
  const {
    isLoading: authIsLoading,
    isAuthenticated,
    user,
    loginWithRedirect,
    logout,
    getAccessTokenSilently
  } = useAuth0();

  const [promptsData, setPromptsData] = useState({});
  const [selectedPromptId, setSelectedPromptId] = useState(null);
  const [selectedVersionId, setSelectedVersionId] = useState(null);
  const [currentView, setCurrentView] = useState('details');
  const [activeFilterTag, setActiveFilterTag] = useState('');
  const [dataLoading, setDataLoading] = useState(false); // Initially false, true only during actual fetch
  const [error, setError] = useState(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showNewPromptModal, setShowNewPromptModal] = useState(false);
  const [userApiKeys, setUserApiKeys] = useState([]);
  const [apiKeysLoading, setApiKeysLoading] = useState(false);
  const [apiKeysError, setApiKeysError] = useState(null);
  const [isDetailsViewBusy, setIsDetailsViewBusy] = useState(false);
  const [templatePromptText, setTemplatePromptText] = useState('');

  // Mobile menu state for responsive sidebar
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getAuthToken = useCallback(async () => {
    if (!isAuthenticated) return null; // Don't attempt if not authenticated
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: process.env.REACT_APP_AUTH0_AUDIENCE,
        },
      });
      return token;
    } catch (e) {
      console.error("Error getting access token", e);
      if (e.error === 'login_required' || e.error === 'consent_required') {
        loginWithRedirect(); // Prompt user to re-login if token cannot be obtained silently
      }
      throw e;
    }
  }, [getAccessTokenSilently, isAuthenticated, loginWithRedirect]);

  const loadPrompts = useCallback(async () => {
    if (!isAuthenticated) {
      setPromptsData({}); // Clear prompts for logged-out users
      setDataLoading(false);
      setSelectedPromptId(null); // Deselect prompt
      setSelectedVersionId(null); // Deselect version
      return;
    }
    setDataLoading(true);
    setError(null);
    try {
      const token = await getAuthToken();
      if (!token) { // Should not happen if isAuthenticated is true, but as a safeguard
        setDataLoading(false);
        return;
      }
      const data = await apiFetchPrompts(token);
      const promptsObj = {};
      (data.prompts || []).forEach(p => {
        promptsObj[p.id] = p;
      });
      setPromptsData(promptsObj);
    } catch (err) {
      setError(`Failed to load prompts: ${err.message}.`);
      setPromptsData({});
    } finally {
      setDataLoading(false);
    }
  }, [isAuthenticated, getAuthToken]);

  // Function to load user API keys - lifted from SettingsModal
  const loadUserApiKeys = useCallback(async (showSuccessMessageInModal = false) => {
    if (!isAuthenticated) {
      setUserApiKeys([]);
      setApiKeysLoading(false);
      return null; // Explicitly return null or an empty array for keys
    }
    setApiKeysLoading(true);
    setApiKeysError(null);
    try {
      const token = await getAuthToken();
      if (!token) {
        setApiKeysLoading(false);
        setApiKeysError('Authentication error for API keys.');
        return null;
      }
      const keys = await apiGetUserApiKeys(token);
      setUserApiKeys(keys || []);
      // Success message display is now handled within SettingsModal using its own state
      // if (showSuccessMessageInModal) { /* Call a prop to show success in modal if needed */ }
      return keys || []; // Return the keys
    } catch (err) {
      setApiKeysError(`Failed to load API keys: ${err.message}`);
      setUserApiKeys([]);
      return null;
    } finally {
      setApiKeysLoading(false);
    }
  }, [isAuthenticated, getAuthToken]);

  useEffect(() => {
    loadPrompts();
    if (isAuthenticated) { // Load API keys if authenticated on initial load/auth change
        loadUserApiKeys();
    }
  }, [isAuthenticated, loadPrompts, loadUserApiKeys]);
  
   // Reload keys if settings modal is shown (to catch updates made within it)
  useEffect(() => {
    if (showSettingsModal && isAuthenticated) {
      loadUserApiKeys();
    }
  }, [showSettingsModal, isAuthenticated, loadUserApiKeys]);

  const selectedPrompt = useMemo(() => {
    return selectedPromptId ? promptsData[selectedPromptId] : null;
  }, [selectedPromptId, promptsData]);

  const availableTags = useMemo(() => {
    const allTags = new Map();
    Object.values(promptsData).forEach(prompt => {
      if (prompt.tags) {
        prompt.tags.forEach(tag => {
          if (tag && tag.name && !allTags.has(tag.name)) {
            allTags.set(tag.name, tag);
          }
        });
      }
    });
    return Array.from(allTags.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [promptsData]);

  const filteredPrompts = useMemo(() => {
    const allPromptsArray = Object.values(promptsData);
    if (!activeFilterTag) return allPromptsArray;
    return allPromptsArray.filter(prompt =>
      prompt.tags && prompt.tags.some(tag => tag.name === activeFilterTag)
    );
  }, [promptsData, activeFilterTag]);

  const handleSelectPrompt = useCallback((promptId) => {
    // Allow selecting prompts even if not authenticated, to view structure
    const newSelectedPrompt = promptsData[promptId] || Object.values(promptsData).find(p => p.id === promptId);
    // If not authenticated and promptsData is empty, this won't find anything, which is fine.
    // If we had sample data for unauthenticated users, this would work with that.

    if (newSelectedPrompt) {
      setSelectedPromptId(promptId);
      setSelectedVersionId(newSelectedPrompt.latest_version);
      setCurrentView('details');
    } else if (!isAuthenticated && Object.keys(promptsData).length === 0) {
        // If not authenticated and no prompts loaded, do nothing or show a message
        // console.log("No prompts to select for unauthenticated user.");
    } else {
      setSelectedPromptId(null);
      setSelectedVersionId(null);
    }
  }, [promptsData, isAuthenticated]);

  const handleSelectVersion = useCallback((promptId, versionIdStr) => {
    // Allow selecting versions even if not authenticated
    if (selectedPrompt && promptId === selectedPrompt.id) { // Check against current selectedPrompt
      setSelectedVersionId(versionIdStr);
    }
  }, [selectedPrompt]);


  const handleSetView = useCallback((viewName) => {
    // Allow view switching if a prompt is selected (even if not authenticated)
    if (selectedPromptId && selectedVersionId) {
      setCurrentView(viewName);
    }
  }, [selectedPromptId, selectedVersionId]);

  // --- Gated CRUD Handlers ---
  const handleSaveNotes = useCallback(async (promptId, versionIdStr, notes) => {
    if (!isAuthenticated) { alert(LOGIN_REQUIRED_FOR_SAVE_MESSAGE); return; }
    setIsDetailsViewBusy(true);
    try {
      const token = await getAuthToken();
      if (!token) { setIsDetailsViewBusy(false); return; } // Reset on early exit
      const updatedVersionData = await apiUpdateVersionNotes(promptId, versionIdStr, notes, token);
      setPromptsData(prev => {
        const newPromptData = { ...prev[promptId] };
        if (newPromptData.versions && newPromptData.versions[versionIdStr]) {
          newPromptData.versions[versionIdStr].notes = updatedVersionData.notes;
        }
        return { ...prev, [promptId]: newPromptData };
      });
    } catch (err) {
      alert(`An error occurred while saving notes: ${err.message}. Please try again.`);
    } finally {
      setIsDetailsViewBusy(false);
    }
  }, [isAuthenticated, getAuthToken]);

  const handleAddTag = useCallback(async (promptId, tagData) => {
    if (!isAuthenticated) { alert(LOGIN_REQUIRED_FOR_SAVE_MESSAGE); return; }
    setIsDetailsViewBusy(true);
    try {
      const token = await getAuthToken();
      if (!token) { setIsDetailsViewBusy(false); return; }
      const updatedPrompt = await apiAddTag(promptId, tagData, token);
      setPromptsData(prev => ({ ...prev, [promptId]: updatedPrompt }));
    } catch (err) {
      alert(`An error occurred while adding the tag: ${err.message}. Please try again.`);
    } finally {
      setIsDetailsViewBusy(false);
    }
  }, [isAuthenticated, getAuthToken]);

  const handleRemoveTag = useCallback(async (promptId, tagName) => {
    if (!isAuthenticated) { alert(LOGIN_REQUIRED_FOR_SAVE_MESSAGE); return; }
    setIsDetailsViewBusy(true);
    try {
      const token = await getAuthToken();
      if (!token) { setIsDetailsViewBusy(false); return; }
      const updatedPrompt = await apiRemoveTag(promptId, tagName, token);
      setPromptsData(prev => ({ ...prev, [promptId]: updatedPrompt }));
    } catch (err) {
      alert(`An error occurred while removing the tag: ${err.message}. Please try again.`);
    } finally {
      setIsDetailsViewBusy(false);
    }
  }, [isAuthenticated, getAuthToken]);

  const handleSaveAsNewVersion = useCallback(async (promptId, newPromptText, llm_provider, model_id_used) => {
    if (!isAuthenticated) { alert(LOGIN_REQUIRED_FOR_SAVE_MESSAGE); return; }
    if (!selectedPromptId) { alert("No prompt selected to save a new version for."); return; }

    // Construct versionData for the API call
    const versionData = {
      text: newPromptText, // The text comes from the playground
      notes: "", // Initialize with empty notes, or prompt user, or carry from current version?
                   // For now, empty notes for a new version from playground.
      llm_provider: llm_provider, // Pass through from PlaygroundView
      model_id_used: model_id_used  // Pass through from PlaygroundView
    };

    setIsDetailsViewBusy(true); // Reuse details view busy state or create a playground busy state
    try {
      const token = await getAuthToken();
      if (!token) { setIsDetailsViewBusy(false); return; }
      
      // Use promptId from arguments, which should be the currently selectedPromptId
      const newVersion = await apiCreateVersion(promptId, versionData, token);
      
      setPromptsData(prev => {
        const updatedPrompt = { ...prev[promptId] };
        if (updatedPrompt.versions) {
          updatedPrompt.versions[newVersion.version_id] = newVersion;
          updatedPrompt.latest_version = newVersion.version_id;
        }
        return { ...prev, [promptId]: updatedPrompt };
      });
      setSelectedVersionId(newVersion.version_id); // Select the new version
      setCurrentView('details'); // Switch to details view to see the new version
      alert("New version saved successfully!");
    } catch (err) {
      alert(`An error occurred while saving the new version: ${err.message}. Please try again.`);
    } finally {
      setIsDetailsViewBusy(false);
    }
  }, [isAuthenticated, getAuthToken, selectedPromptId]);

  const handleAddNewPrompt = useCallback(async () => {
    if (!isAuthenticated) {
      // For unauthenticated users, we could still open the modal and handle it client-side
      // Or show a login prompt first. For now, let's allow opening for client-side mock handling.
      // alert(LOGIN_REQUIRED_FOR_SAVE_MESSAGE); // Consider if this alert is still needed here or in modal submit
      // return;
    }
    setShowNewPromptModal(true);
  }, [isAuthenticated]);

  const handleSubmitNewPrompt = useCallback(async (formData) => {
    // formData will be an object like { title, initial_version_text, initial_version_notes, tags }
    if (!isAuthenticated) {
      // Handle client-side creation for unauthenticated users (same as old logic but with more fields)
      const tempId = `temp-${Date.now()}`;
      const newPrompt = {
        id: tempId,
        title: formData.title,
        tags: formData.tags, // Assuming tags are {name: string, color: string} objects
        versions: {
          v1: {
            text: formData.initial_version_text,
            notes: formData.initial_version_notes || 'First version created.',
            date: new Date().toISOString().split('T')[0],
          }
        },
        latest_version: 'v1'
      };
      setPromptsData(prev => ({ ...prev, [tempId]: newPrompt }));
      setSelectedPromptId(tempId);
      setSelectedVersionId('v1');
      setCurrentView('details');
      setShowNewPromptModal(false);
      return;
    }

    // Authenticated: save to backend
    setIsDetailsViewBusy(true); // Assuming this modal submission is part of "DetailsView busy" concept
    try {
      const token = await getAuthToken();
      if (!token) { setIsDetailsViewBusy(false); return; } // Should ideally not happen if isAuthenticated

      // The backend expects tags as an array of strings or objects {name: string, color: string}
      // The current api.js createPrompt sends `tags: []` in `promptAPIData`.
      // We need to ensure the backend can handle the new tag structure if `formData.tags` is populated.
      // For now, let's assume backend expects `tags` as part of the main prompt body if it can handle it,
      // or it might need a separate step/different structure.
      // The existing `apiCreatePrompt` was: `promptAPIData = { title, tags: [], initial_version_text, initial_version_notes }`
      // Let's adapt to send the full formData structure.
      const promptAPIData = {
        title: formData.title,
        initial_version_text: formData.initial_version_text,
        initial_version_notes: formData.initial_version_notes,
        tags: formData.tags, // Pass the tags from the modal
      };

      const newPrompt = await apiCreatePrompt(promptAPIData, token);
      setPromptsData(prev => ({ ...prev, [newPrompt.id]: newPrompt }));
      setSelectedPromptId(newPrompt.id);
      setSelectedVersionId(newPrompt.latest_version); // This should be set by the backend
      setCurrentView('details');
      setShowNewPromptModal(false);
    } catch (err) {
      alert(`An error occurred while creating the new prompt: ${err.message}. Please try again.`);
      // Potentially leave modal open or provide other feedback
    } finally {
      setIsDetailsViewBusy(false);
    }
  }, [isAuthenticated, getAuthToken]);

  const handleDeletePrompt = useCallback(async (promptIdToDelete) => {
    if (!isAuthenticated) { alert(LOGIN_REQUIRED_FOR_SAVE_MESSAGE); return; }
    setIsDetailsViewBusy(true);
    try {
      const token = await getAuthToken();
      if (!token) { setIsDetailsViewBusy(false); return; }
      await apiDeletePrompt(promptIdToDelete, token);
      setPromptsData(prev => {
        const newData = { ...prev };
        delete newData[promptIdToDelete];
        return newData;
      });
      if (selectedPromptId === promptIdToDelete) {
        setSelectedPromptId(null);
        setSelectedVersionId(null);
      }
    } catch (err) {
      alert(`An error occurred while deleting the prompt: ${err.message}. Please try again.`);
    } finally {
      setIsDetailsViewBusy(false);
    }
  }, [isAuthenticated, getAuthToken, selectedPromptId]);

  const handleFilterChange = useCallback((event) => {
    setActiveFilterTag(event.target.value);
  }, []);

  // Updated to accept llmProvider
  const handleRunTest = useCallback(async (promptText, llmProvider, modelId) => {
    if (!isAuthenticated) {
      return LOGIN_REQUIRED_FOR_TEST_MESSAGE; 
    }
    // Ensure llmProvider is provided
    if (!llmProvider) {
        // This case should ideally be prevented by UI selecting a default or disabling run test
        return "LLM Provider not selected. Please select a provider in Playground.";
    }
    if (!modelId) {
      return "Model not selected. Please select a model in Playground.";
    }
    try {
      const token = await getAuthToken();
      if (!token) return "Authentication error. Please try logging in again.";
      // Pass llmProvider and modelId to the API call
      const response = await apiRunPlaygroundTest(promptText, llmProvider, modelId, token);
      if (response.error) {
        return `Error from LLM (${llmProvider} - ${modelId}): ${response.error}`;
      }
      return response.output_text || "No output received from LLM.";
    } catch (err) {
      console.error("Playground test API call failed:", err);
      return `Failed to run test with ${llmProvider} (${modelId}): ${err.message}`;
    }
  }, [isAuthenticated, getAuthToken]);

  const handleRenamePrompt = useCallback(async (promptIdToRename, newTitle) => {
    if (!isAuthenticated) { alert(LOGIN_REQUIRED_FOR_SAVE_MESSAGE); return; }
    try {
      const token = await getAuthToken();
      if (!token) return;
      const updatedPrompt = await apiUpdatePrompt(promptIdToRename, { title: newTitle }, token);
      setPromptsData(prev => ({ ...prev, [promptIdToRename]: updatedPrompt }));
    } catch (err) {
      alert(`An error occurred while renaming the prompt: ${err.message}. Please try again.`);
    }
  }, [isAuthenticated, getAuthToken]);

  const handleLogin = useCallback(() => {
    loginWithRedirect();
  }, [loginWithRedirect]);

  const handleLogout = useCallback(() => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  }, [logout]);

  const handleShowSettings = useCallback(() => {
    if (!isAuthenticated) {
        alert(LOGIN_REQUIRED_FOR_SETTINGS_MESSAGE);
        loginWithRedirect({ appState: { returnTo: window.location.pathname } }); 
    } else {
        setShowSettingsModal(true);
        // API keys will be loaded by the useEffect that watches showSettingsModal
    }
  }, [isAuthenticated, loginWithRedirect]);

  const handleShowTemplates = useCallback(() => {
    setCurrentView('templates');
    setSelectedPromptId(null);
    setSelectedVersionId(null);
  }, []);

  const handleUseTemplate = useCallback((template) => {
    // Store the template prompt text and open the modal
    setTemplatePromptText(template.prompt);
    setShowNewPromptModal(true);
  }, []);


  if (authIsLoading) return <div className="flex items-center justify-center h-screen text-lg">Loading authentication...</div>;

  // Condition to show the initial animation
  const showInitialAnimation = 
    !authIsLoading && 
    !dataLoading && 
    !selectedPrompt && 
    !error &&
    currentView !== 'templates';

  return (
    <div className="flex h-screen overflow-hidden bg-cartoon-bg-light text-cartoon-text">
      <Sidebar
        prompts={filteredPrompts}
        selectedPromptId={selectedPromptId}
        onSelectPrompt={handleSelectPrompt}
        onAddNewPrompt={handleAddNewPrompt}
        onFilterChange={handleFilterChange}
        availableTags={availableTags}
        setShowSettingsModal={handleShowSettings}
        showSettingsModal={showSettingsModal && isAuthenticated}
        isAuthenticated={isAuthenticated}
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        onShowTemplates={handleShowTemplates}
      />
      
      {/* Main content container - responsive width and padding for mobile */}
      <div className="flex-1 flex flex-col overflow-hidden sm:ml-0">
        <AnimatePresence mode="wait">
          {showInitialAnimation && (
            <motion.div key="initial-animation-container" className="flex-1 flex flex-col overflow-hidden">
              <InitialViewAnimation />
            </motion.div>
          )}

          {/* Main content area: always render, but content might be restricted based on auth */}
          {dataLoading && isAuthenticated && !showInitialAnimation && (
              <motion.div key="loading-prompts" className="flex-1 flex items-center justify-center p-6 text-lg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                   Loading prompts...
              </motion.div>
          )}
          {error && !showInitialAnimation && (
              <motion.div key="error-message" className="flex-1 flex items-center justify-center p-6 text-lg text-danger" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {error}
              </motion.div>
          )}
          {(!dataLoading && !error && !showInitialAnimation && (selectedPrompt || currentView === 'templates')) && (
            <MainContent
              key={selectedPrompt ? selectedPrompt.id : 'main-content'}
              currentView={currentView}
              selectedPrompt={selectedPrompt}
              selectedVersionId={selectedVersionId}
              onSetView={handleSetView}
              onSelectVersion={handleSelectVersion}
              onSaveNotes={handleSaveNotes}
              onAddTag={handleAddTag}
              onRemoveTag={handleRemoveTag}
              onRunTest={handleRunTest}
              onSaveAsNewVersion={handleSaveAsNewVersion}
              onDeletePrompt={handleDeletePrompt}
              onRenamePrompt={handleRenamePrompt}
              availableTags={availableTags}
              isAuthenticated={isAuthenticated}
              userApiKeys={userApiKeys}
              apiKeysLoading={apiKeysLoading}
              isDetailsViewBusy={isDetailsViewBusy}
              onUseTemplate={handleUseTemplate}
            />
          )}
          {(!dataLoading && !error && !showInitialAnimation && !selectedPrompt && isAuthenticated && currentView !== 'templates') && (
            <motion.div key="select-prompt-auth" className="flex-1 flex items-center justify-center p-6 text-lg text-light-secondary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              Select a prompt from the list to see its details, or create a new one.
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <NewPromptModal
        isOpen={showNewPromptModal}
        onClose={() => {
          setShowNewPromptModal(false);
          setTemplatePromptText(''); // Clear template text when modal closes
        }}
        onSubmit={handleSubmitNewPrompt}
        availableTags={availableTags}
        templatePromptText={templatePromptText}
      />
      {showSettingsModal && isAuthenticated && (
        <SettingsModal
          showSettingsModal={showSettingsModal}
          setShowSettingsModal={setShowSettingsModal}
          getAuthToken={getAuthToken}
          isAuthenticated={isAuthenticated}
          userApiKeys={userApiKeys}
          apiKeysLoading={apiKeysLoading}
          apiKeysError={apiKeysError}
          refreshApiKeys={loadUserApiKeys}
        />
      )}
    </div>
  );
}

export default App;
