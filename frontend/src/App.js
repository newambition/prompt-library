// frontend/src/App.js
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
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
  runPlaygroundTest as apiRunPlaygroundTest
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

  useEffect(() => {
    loadPrompts();
  }, [isAuthenticated, loadPrompts]);

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
    try {
      const token = await getAuthToken();
      if (!token) return;
      const updatedVersionData = await apiUpdateVersionNotes(promptId, versionIdStr, notes, token);
      setPromptsData(prev => {
        const newPromptData = { ...prev[promptId] };
        if (newPromptData.versions && newPromptData.versions[versionIdStr]) {
          newPromptData.versions[versionIdStr].notes = updatedVersionData.notes;
        }
        return { ...prev, [promptId]: newPromptData };
      });
    } catch (err) {
      alert(`Failed to save notes: ${err.message}`);
    }
  }, [isAuthenticated, getAuthToken]);

  const handleAddTag = useCallback(async (promptId, tagData) => {
    if (!isAuthenticated) { alert(LOGIN_REQUIRED_FOR_SAVE_MESSAGE); return; }
    try {
      const token = await getAuthToken();
      if (!token) return;
      const updatedPrompt = await apiAddTag(promptId, tagData, token);
      setPromptsData(prev => ({ ...prev, [promptId]: updatedPrompt }));
    } catch (err) {
      alert(`Failed to add tag: ${err.message}`);
    }
  }, [isAuthenticated, getAuthToken]);

  const handleRemoveTag = useCallback(async (promptId, tagName) => {
    if (!isAuthenticated) { alert(LOGIN_REQUIRED_FOR_SAVE_MESSAGE); return; }
    try {
      const token = await getAuthToken();
      if (!token) return;
      const updatedPrompt = await apiRemoveTag(promptId, tagName, token);
      setPromptsData(prev => ({ ...prev, [promptId]: updatedPrompt }));
    } catch (err) {
      alert(`Failed to remove tag: ${err.message}`);
    }
  }, [isAuthenticated, getAuthToken]);

  const handleSaveAsNewVersion = useCallback(async (promptId, newPromptText) => {
    if (!isAuthenticated) { alert(LOGIN_REQUIRED_FOR_SAVE_MESSAGE); return; }
    try {
      const token = await getAuthToken();
      if (!token) return;
      const versionData = { text: newPromptText, notes: `Saved from playground on ${new Date().toLocaleDateString()}` };
      await apiCreateVersion(promptId, versionData, token);
      await loadPrompts(); // Reload prompts
       const currentPromptData = promptsData[promptId] || (await apiFetchPrompts(token)).prompts.find(p => p.id === promptId);
      if (currentPromptData) {
         setSelectedPromptId(promptId);
         setSelectedVersionId(currentPromptData.latest_version);
      }
      setCurrentView('details');
    } catch (err) {
      alert(`Failed to save new version: ${err.message}`);
    }
  }, [isAuthenticated, getAuthToken, loadPrompts, promptsData]);

  const handleAddNewPrompt = useCallback(async () => {
    if (!isAuthenticated) { alert("Please log in to create and save new prompts."); return; }
    const newPromptTitle = prompt('Enter title for the new prompt:', 'New Prompt');
    if (!newPromptTitle || !newPromptTitle.trim()) return;
    try {
      const token = await getAuthToken();
      if (!token) return;
      const promptAPIData = {
        title: newPromptTitle.trim(), tags: [],
        initial_version_text: `Initial prompt text for "${newPromptTitle.trim()}".`,
        initial_version_notes: 'First version created.'
      };
      const newPrompt = await apiCreatePrompt(promptAPIData, token);
      setPromptsData(prev => ({ ...prev, [newPrompt.id]: newPrompt }));
      setSelectedPromptId(newPrompt.id);
      setSelectedVersionId(newPrompt.latest_version);
      setCurrentView('details');
    } catch (err) {
      alert(`Failed to create new prompt: ${err.message}`);
    }
  }, [isAuthenticated, getAuthToken]);

  const handleDeletePrompt = useCallback(async (promptIdToDelete) => {
    if (!isAuthenticated) { alert(LOGIN_REQUIRED_FOR_SAVE_MESSAGE); return; }
    try {
      const token = await getAuthToken();
      if (!token) return;
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
      alert(`Failed to delete prompt: ${err.message}`);
    }
  }, [isAuthenticated, getAuthToken, selectedPromptId]);

  const handleFilterChange = useCallback((event) => {
    setActiveFilterTag(event.target.value);
  }, []);

  const handleRunTest = useCallback(async (promptText) => {
    if (!isAuthenticated) {
      return LOGIN_REQUIRED_FOR_TEST_MESSAGE; // Signal to PlaygroundView
    }
    try {
      const token = await getAuthToken();
      if (!token) return "Authentication error. Please try logging in again.";
      const response = await apiRunPlaygroundTest(promptText, token);
      if (response.error) {
        return `Error from LLM: ${response.error}`;
      }
      return response.output_text || "No output received from LLM.";
    } catch (err) {
      console.error("Playground test API call failed:", err);
      return `Failed to run test: ${err.message}`;
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
      alert(`Failed to rename prompt: ${err.message}`);
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
        loginWithRedirect({ appState: { returnTo: window.location.pathname } }); // Redirect to login
    } else {
        setShowSettingsModal(true);
    }
  }, [isAuthenticated, loginWithRedirect]);


  if (authIsLoading) return <div className="flex items-center justify-center h-screen text-lg">Loading authentication...</div>;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 text-gray-800">
      <Sidebar
        prompts={filteredPrompts} // Show available prompts even if not logged in (will be empty if so)
        selectedPromptId={selectedPromptId}
        onSelectPrompt={handleSelectPrompt}
        onAddNewPrompt={handleAddNewPrompt} // Action will be gated by auth inside handler
        onFilterChange={handleFilterChange}
        availableTags={availableTags} // Show available tags even if not logged in
        setShowSettingsModal={setShowSettingsModal} // Pass the real setter so modal can close
        showSettingsModal={showSettingsModal && isAuthenticated} // Only truly show if authenticated
        isAuthenticated={isAuthenticated}
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />
      {/* Main content area: always render, but content might be restricted based on auth */}
      {dataLoading && isAuthenticated && <div className="flex-1 flex items-center justify-center p-6 text-lg">Loading prompts...</div>}
      {error && <div className="flex-1 flex items-center justify-center p-6 text-lg text-red-500">{error}</div>}
      {(!dataLoading && !error) && (
        <MainContent
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
          isAuthenticated={isAuthenticated} // Pass this down
        />
      )}
    </div>
  );
}

export default App;
