// src/App.js
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import {
  fetchPrompts,
  createPrompt,
  updateVersionNotes,
  addTag,
  removeTag,
  createVersion,
  deletePrompt,
  updatePrompt
} from './api';

function App() {
  // State for the entire prompts data structure (object keyed by promptId)
  const [promptsData, setPromptsData] = useState({});
  const [selectedPromptId, setSelectedPromptId] = useState(null);
  const [selectedVersionId, setSelectedVersionId] = useState(null);
  const [currentView, setCurrentView] = useState('details');
  const [activeFilterTag, setActiveFilterTag] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Fetch prompts from backend on mount
  useEffect(() => {
    async function loadPrompts() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchPrompts();
        // Convert array to object keyed by promptId for easier access
        const promptsObj = {};
        (data.prompts || []).forEach(p => {
          promptsObj[p.id] = p;
        });
        setPromptsData(promptsObj);
      } catch (err) {
        setError('Failed to load prompts.');
      } finally {
        setLoading(false);
      }
    }
    loadPrompts();
  }, []);

  // Memoized derived state
  const selectedPrompt = useMemo(() => {
    return selectedPromptId ? promptsData[selectedPromptId] : null;
  }, [selectedPromptId, promptsData]);

  const filteredPrompts = useMemo(() => {
    const allPrompts = Object.values(promptsData);
    if (!activeFilterTag) return allPrompts;
    return allPrompts.filter(prompt => prompt.tags.includes(activeFilterTag));
  }, [promptsData, activeFilterTag]);

  // --- Callback Handlers ---

  const handleSelectPrompt = useCallback((promptId) => {
    const newSelectedPrompt = promptsData[promptId];
    if (newSelectedPrompt) {
      setSelectedPromptId(promptId);
      setSelectedVersionId(newSelectedPrompt.latest_version);
      setCurrentView('details');
    } else {
      setSelectedPromptId(null);
      setSelectedVersionId(null);
    }
  }, [promptsData]);

  const handleSelectVersion = useCallback((promptId, versionId) => {
    if (promptId === selectedPromptId) {
      setSelectedVersionId(versionId);
    }
  }, [selectedPromptId]);

  const handleSetView = useCallback((viewName) => {
    if (selectedPromptId && selectedVersionId) {
      setCurrentView(viewName);
    }
  }, [selectedPromptId, selectedVersionId]);

  // Save notes for a version
  const handleSaveNotes = useCallback(async (promptId, versionId, notes) => {
    try {
      const updatedVersion = await updateVersionNotes(promptId, versionId, notes);
      setPromptsData(prev => {
        const newData = { ...prev };
        if (newData[promptId] && newData[promptId].versions[versionId]) {
          newData[promptId].versions[versionId].notes = updatedVersion.notes;
        }
        return newData;
      });
      alert('Notes saved.');
    } catch (err) {
      alert('Failed to save notes.');
    }
  }, []);

  // Add a tag
  const handleAddTag = useCallback(async (promptId, tag) => {
    try {
      const updatedPrompt = await addTag(promptId, tag);
      setPromptsData(prev => ({ ...prev, [promptId]: updatedPrompt }));
      alert(`Tag "${tag}" added.`);
    } catch (err) {
      alert('Failed to add tag.');
    }
  }, []);

  // Remove a tag
  const handleRemoveTag = useCallback(async (promptId, tag) => {
    try {
      const updatedPrompt = await removeTag(promptId, tag);
      setPromptsData(prev => ({ ...prev, [promptId]: updatedPrompt }));
      alert(`Tag "${tag}" removed.`);
    } catch (err) {
      alert('Failed to remove tag.');
    }
  }, []);

  // Save as new version
  const handleSaveAsNewVersion = useCallback(async (promptId, newPromptText) => {
    try {
      const versionData = { text: newPromptText, notes: `Saved from playground on ${new Date().toLocaleDateString()}` };
      const newVersion = await createVersion(promptId, versionData);
      // Refetch prompts to update state (simplest way to sync)
      const data = await fetchPrompts();
      const promptsObj = {};
      (data.prompts || []).forEach(p => { promptsObj[p.id] = p; });
      setPromptsData(promptsObj);
      setSelectedVersionId(newVersion.version_id);
      setCurrentView('details');
      alert('Saved as new version.');
    } catch (err) {
      alert('Failed to save new version.');
    }
  }, []);

  // Add a new prompt
  const handleAddNewPrompt = useCallback(async () => {
    const newPromptTitle = prompt('Enter title for the new prompt:', 'New Prompt');
    if (!newPromptTitle || !newPromptTitle.trim()) return;
    try {
      const promptData = {
        title: newPromptTitle.trim(),
        tags: [],
        initial_version_text: `Initial prompt text for "${newPromptTitle.trim()}".`,
        initial_version_notes: 'First version created.'
      };
      const newPrompt = await createPrompt(promptData);
      setPromptsData(prev => ({ ...prev, [newPrompt.id]: newPrompt }));
      setSelectedPromptId(newPrompt.id);
      setSelectedVersionId(newPrompt.latest_version);
      setCurrentView('details');
      alert(`New prompt "${newPromptTitle.trim()}" created.`);
    } catch (err) {
      alert('Failed to create new prompt.');
    }
  }, []);

  // Delete a prompt
  const handleDeletePrompt = useCallback(async (promptId) => {
    if (!window.confirm('Are you sure you want to delete this prompt?')) return;
    try {
      await deletePrompt(promptId);
      setPromptsData(prev => {
        const newData = { ...prev };
        delete newData[promptId];
        return newData;
      });
      setSelectedPromptId(null);
      setSelectedVersionId(null);
      setCurrentView('details');
      alert('Prompt deleted.');
    } catch (err) {
      alert('Failed to delete prompt.');
    }
  }, []);

  // Handler for tag filter change
  const handleFilterChange = useCallback((event) => {
    setActiveFilterTag(event.target.value);
  }, []);

  // Handler for running a test (mocked for now)
  const handleRunTest = useCallback(async (promptText) => {
    // You can implement a real backend call here if needed
    await new Promise(resolve => setTimeout(resolve, 1500));
    return `Mock AI Output for:\n"${promptText.substring(0, 100)}..."\n\n1. Result item one.\n2. Result item two.\n3. Another point generated based on the prompt.`;
  }, []);

  // Handler to rename a prompt
  const handleRenamePrompt = useCallback(async (promptId, newTitle) => {
    try {
      const updatedPrompt = await updatePrompt(promptId, { title: newTitle });
      setPromptsData(prev => ({ ...prev, [promptId]: updatedPrompt }));
      // Optionally update sidebar selection if needed
    } catch (err) {
      alert('Failed to rename prompt.');
    }
  }, []);

  // Render
  if (loading) return <div className="p-8 text-lg">Loading prompts...</div>;
  if (error) return <div className="p-8 text-lg text-red-600">{error}</div>;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 text-gray-800">
      <Sidebar
        prompts={filteredPrompts}
        selectedPromptId={selectedPromptId}
        onSelectPrompt={handleSelectPrompt}
        onAddNewPrompt={handleAddNewPrompt}
        onFilterChange={handleFilterChange}
        setShowSettingsModal={setShowSettingsModal}
        showSettingsModal={showSettingsModal}
      />
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
      />
    </div>
  );
}

export default App;

