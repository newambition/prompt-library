// frontend/src/components/SettingsModal.js
import React, { useRef, useState, useEffect } from 'react';
import { FaTimes, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { addUserApiKey, updateUserApiKey, deleteUserApiKey } from '../api';
import { useAuthContext } from '../context/AuthContext'; // Import the context hook

// Define LLM providers for the dropdown
const LLM_PROVIDERS = [
  { value: 'gemini', label: 'Gemini' },
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic' },
];

function SettingsModal({ 
  showSettingsModal, 
  setShowSettingsModal, 
  // getAuthToken, // Will come from context
  // isAuthenticated, // Will come from context
  userApiKeys = [],
  apiKeysLoading,
  apiKeysError,
  refreshApiKeys
}) {
  const { getAuthToken, isAuthenticated } = useAuthContext(); // Use context
  const modalRef = useRef();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // State for adding a new key
  const [newProvider, setNewProvider] = useState(LLM_PROVIDERS[0].value);
  const [newApiKeyInput, setNewApiKeyInput] = useState('');
  const [isAdding, setIsAdding] = useState(false); // To show/hide the add form

  // State for editing an existing key
  const [isEditing, setIsEditing] = useState(false);
  const [editingKey, setEditingKey] = useState(null); // Stores { id, llm_provider, masked_api_key }
  const [editApiKeyInput, setEditApiKeyInput] = useState('');

  // State for delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [keyToDelete, setKeyToDelete] = useState(null); // Stores the full key object for confirmation message

  const resetMessages = () => {
    setSuccessMessage(null);
    setErrorMessage(null); // Use local errorMessage for modal-specific errors
  };

  // Effect to reset form states and messages when the modal is opened/closed
  useEffect(() => {
    if (showSettingsModal) {
      setIsAdding(false);
      setNewProvider(LLM_PROVIDERS[0].value);
      setNewApiKeyInput('');
      setIsEditing(false);
      setEditingKey(null);
      setEditApiKeyInput('');
      setShowDeleteConfirm(false);
      setKeyToDelete(null);
      resetMessages(); 
    } else {
      setIsAdding(false);
      setIsEditing(false);
      setShowDeleteConfirm(false);
      resetMessages();
    }
  }, [showSettingsModal]);

  if (!showSettingsModal || !isAuthenticated) return null; // Also check isAuthenticated from context

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !showDeleteConfirm && !isSubmitting) setShowSettingsModal(false);
  };

  const handleInitiateAddKey = () => {
    resetMessages();
    setIsAdding(true);
    setIsEditing(false);
    setEditingKey(null);
    setShowDeleteConfirm(false);
    setKeyToDelete(null);
    setNewProvider(LLM_PROVIDERS[0].value);
    setNewApiKeyInput('');
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
    setNewApiKeyInput('');
  };

  const handleAddNewKey = async () => {
    resetMessages();
    if (!newProvider || !newApiKeyInput.trim()) {
      setErrorMessage("Provider and API Key cannot be empty.");
      return;
    }
    setIsSubmitting(true);
    try {
      const token = await getAuthToken(); // From context
      if (!token) {
        setErrorMessage('Authentication error. Please log in again.');
        setIsSubmitting(false);
        return;
      }
      await addUserApiKey(token, newProvider, newApiKeyInput.trim());
      setSuccessMessage(`API key for ${newProvider.toUpperCase()} added successfully!`);
      setNewApiKeyInput('');
      setNewProvider(LLM_PROVIDERS[0].value);
      setIsAdding(false);
      await refreshApiKeys(true);
    } catch (err) {
      setErrorMessage(`Failed to add API key: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInitiateEditKey = (keyToEdit) => {
    resetMessages();
    setIsEditing(true);
    setIsAdding(false);
    setEditingKey(keyToEdit);
    setShowDeleteConfirm(false);
    setKeyToDelete(null);
    setEditApiKeyInput('');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingKey(null);
    setEditApiKeyInput('');
  };

  const handleUpdateKey = async () => {
    resetMessages();
    if (!editingKey || !editApiKeyInput.trim()) {
      setErrorMessage("New API Key cannot be empty.");
      return;
    }
    setIsSubmitting(true);
    try {
      const token = await getAuthToken(); // From context
      if (!token) {
        setErrorMessage('Authentication error. Please log in again.');
        setIsSubmitting(false);
        return;
      }
      await updateUserApiKey(token, editingKey.llm_provider, editApiKeyInput.trim());
      setSuccessMessage(`API key for ${editingKey.llm_provider.toUpperCase()} updated successfully!`);
      setEditApiKeyInput('');
      setIsEditing(false);
      setEditingKey(null);
      await refreshApiKeys(true); 
    } catch (err) {
      setErrorMessage(`Failed to update API key: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInitiateDeleteKey = (keyForDeletion) => {
    resetMessages();
    setKeyToDelete(keyForDeletion); // Store the whole key object
    setShowDeleteConfirm(true);
    setIsAdding(false); // Ensure other forms are closed
    setIsEditing(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setKeyToDelete(null);
  };

  const handleConfirmDeleteKey = async () => {
    resetMessages();
    if (!keyToDelete) {
      setErrorMessage("No key selected for deletion.");
      return;
    }
    setIsSubmitting(true);
    try {
      const token = await getAuthToken(); // From context
      if (!token) {
        setErrorMessage('Authentication error. Please log in again.');
        setIsSubmitting(false);
        return;
      }
      await deleteUserApiKey(token, keyToDelete.id);
      setSuccessMessage(`API key for ${keyToDelete.llm_provider.toUpperCase()} deleted successfully!`);
      setShowDeleteConfirm(false);
      setKeyToDelete(null);
      await refreshApiKeys(true);
    } catch (err) {
      setErrorMessage(`Failed to delete API key: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-dark bg-opacity-80 z-50 p-4"
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        className={`w-full max-w-lg bg-surface glass border border-light p-6 rounded-xl shadow-xl relative flex flex-col max-h-[90vh] ${showDeleteConfirm || isSubmitting ? 'filter blur-sm' : ''}`}
        onClick={e => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-light-secondary hover:text-primary"
          onClick={() => setShowSettingsModal(false)}
          aria-label="Close settings"
          disabled={showDeleteConfirm || isSubmitting}
        >
          <FaTimes size={20} />
        </button>
        <h1 className="text-xl font-semibold mb-6 text-light text-center">Manage API Keys</h1>

        {/* Global Success/Error Messages Area */} 
        {successMessage && <p className="text-success bg-success/10 p-2 rounded-md text-sm text-center mb-3">{successMessage}</p>}
        {/* Display local error message from form submissions */}
        {errorMessage && <p className="text-danger bg-danger/10 p-2 rounded-md text-sm text-center mb-3">{errorMessage}</p>}
        {/* Display API loading error from App.js */}
        {apiKeysError && !errorMessage && <p className="text-danger bg-danger/10 p-2 rounded-md text-sm text-center mb-3">{apiKeysError}</p>}

        {/* API Key List Area */}
        <div className="overflow-y-auto flex-grow mb-4 pr-2">
          {apiKeysLoading && <p className="text-light-secondary text-center">Loading API keys...</p>}
          {!apiKeysLoading && userApiKeys.length === 0 && !isAdding && !isEditing && (
            <p className="text-light-secondary text-center italic">No API keys configured yet. Click "Add New Key" to start.</p>
          )}
          {!apiKeysLoading && userApiKeys.length > 0 && !isAdding && !isEditing && (
            <ul className="space-y-3 mb-4">
              {userApiKeys.map(key => (
                <li key={key.id} className="bg-dark p-3 rounded-lg border border-light flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-light">{key.llm_provider.toUpperCase()}</span>
                    <p className="text-sm text-light-secondary">{key.masked_api_key}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleInitiateEditKey(key)} 
                      className="text-light-secondary hover:text-secondary p-1"
                      title="Edit API Key"
                      disabled={isSubmitting}
                    >
                      <FaEdit size={16}/>
                    </button>
                    <button 
                      onClick={() => handleInitiateDeleteKey(key)} 
                      className="text-light-secondary hover:text-danger p-1"
                      title="Delete API Key"
                      disabled={isSubmitting}
                    >
                      <FaTrash size={16}/>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Add New Key Form Area - Toggled by button */} 
          {isAdding && (
            <div className="bg-dark p-4 rounded-lg border border-light mt-4">
              <h2 className="text-md font-semibold text-light mb-3">Add New API Key</h2>
              <div className="space-y-3">
                <div>
                  <label htmlFor="llm-provider" className="block text-sm font-medium text-light-secondary mb-1">
                    LLM Provider:
                  </label>
                  <select 
                    id="llm-provider" 
                    value={newProvider}
                    onChange={(e) => setNewProvider(e.target.value)}
                    className="w-full border border-light rounded-md p-2 bg-dark text-light focus:ring-secondary focus:border-secondary"
                    disabled={isSubmitting}
                  >
                    {LLM_PROVIDERS.map(provider => (
                      <option key={provider.value} value={provider.value}>{provider.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="new-api-key-input" className="block text-sm font-medium text-light-secondary mb-1">
                    API Key:
                  </label>
                  <input 
                    id="new-api-key-input" 
                    type="password" 
                    placeholder="Enter your API key"
                    value={newApiKeyInput}
                    onChange={(e) => setNewApiKeyInput(e.target.value)}
                    className="w-full border border-light rounded-md p-2 bg-dark text-light focus:ring-secondary focus:border-secondary"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button 
                    type="button"
                    onClick={handleCancelAdd} 
                    className="btn-secondary text-dark font-semibold py-2 px-4 rounded-xl text-sm"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button"
                    onClick={handleAddNewKey} 
                    className={`btn-primary font-medium py-2 px-4 rounded-xl text-sm ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={!newApiKeyInput.trim() || !newProvider || isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : 'Save Key'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {isEditing && editingKey && (
            <div className="bg-dark p-4 rounded-lg border border-light mt-4">
              <h2 className="text-md font-semibold text-light mb-3">Edit API Key for {editingKey.llm_provider.toUpperCase()}</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-light-secondary mb-1">Provider:</label>
                  <p className="text-light p-2 bg-dark-card rounded-md border border-light">{editingKey.llm_provider.toUpperCase()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-light-secondary mb-1">Current Masked Key:</label>
                  <p className="text-light-secondary p-2 bg-dark-card rounded-md border border-light">{editingKey.masked_api_key}</p>
                </div>
                <div>
                  <label htmlFor="edit-api-key-input" className="block text-sm font-medium text-light-secondary mb-1">New API Key:</label>
                  <input id="edit-api-key-input" type="password" placeholder="Enter new API key" value={editApiKeyInput} onChange={(e) => setEditApiKeyInput(e.target.value)} className="w-full border border-light rounded-md p-2 bg-dark text-light focus:ring-secondary focus:border-secondary" disabled={isSubmitting}/>
                   <p className="text-xs text-light-tertiary mt-1">Enter the complete new key. The old key will be replaced.</p>
                </div>
                <div className="flex justify-end space-x-2">
                  <button type="button" onClick={handleCancelEdit} className="btn-secondary text-dark font-semibold py-2 px-4 rounded-xl text-sm" disabled={isSubmitting}>Cancel</button>
                  <button type="button" onClick={handleUpdateKey} className={`btn-primary font-medium py-2 px-4 rounded-xl text-sm ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={!editApiKeyInput.trim() || isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Changes'}</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions Area */} 
        <div className="flex justify-between items-center pt-4 border-t border-light-border">
          {!isAdding && !isEditing && (
             <button
                className="btn-primary font-medium py-2 px-4 rounded-xl transition duration-150 flex items-center text-sm"
                onClick={handleInitiateAddKey}
                disabled={showDeleteConfirm || isSubmitting}
              >
                <FaPlus className="mr-2"/> Add New Key
              </button>
          )}
          <div className={(isAdding || isEditing) ? 'w-full flex justify-end' : ''}>
            <button
              className={`bg-dark hover:bg-surface text-light font-medium py-2 px-5 rounded-xl border border-light text-sm ${(isAdding || isEditing) ? 'ml-auto' : ''}`}
              onClick={() => setShowSettingsModal(false)}
              disabled={showDeleteConfirm || isSubmitting}
            >
              Close
            </button>
          </div>
        </div>
      </div>
      {/* Delete Confirmation Modal (Dialog) */}
      {showDeleteConfirm && keyToDelete && (
        <div className="fixed inset-0 flex items-center justify-center z-[60] bg-dark bg-opacity-50" onClick={isSubmitting ? undefined : handleCancelDelete}> {/* Higher z-index and different overlay click */} 
          <div className="bg-surface rounded-xl shadow-lg p-6 w-full max-w-sm text-center border border-light" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-light mb-2">Confirm Deletion</h3>
            <p className="text-light-secondary mb-1">Are you sure you want to delete the API key for</p>
            <p className="text-primary font-semibold mb-1">{keyToDelete.llm_provider.toUpperCase()}</p>
            <p className="text-light-secondary mb-4">({keyToDelete.masked_api_key})?</p>
            <div className="flex gap-3 justify-center">
              <button onClick={handleCancelDelete} className="btn-secondary text-dark font-medium py-2 px-4 rounded-xl text-sm" disabled={isSubmitting}>
                Cancel
              </button>
              <button onClick={handleConfirmDeleteKey} className={`btn-danger font-medium py-2 px-4 rounded-xl text-sm ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={isSubmitting}>
                {isSubmitting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SettingsModal;
