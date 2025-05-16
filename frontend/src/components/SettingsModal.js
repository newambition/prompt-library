// frontend/src/components/SettingsModal.js
import React, { useRef, useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';

const API_KEY_STORAGE_KEY = 'gemini_api_key'; // Key for localStorage

function SettingsModal({ showSettingsModal, setShowSettingsModal }) {
  const modalRef = useRef();
  const [apiKeyInput, setApiKeyInput] = useState('');

  // Load existing key from localStorage when modal opens
  useEffect(() => {
    if (showSettingsModal) {
      const storedApiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
      if (storedApiKey) {
        setApiKeyInput(storedApiKey);
      }
    }
  }, [showSettingsModal]);

  if (!showSettingsModal) return null;

  const handleOverlayClick = (e) => {
    // Only close if the click is directly on the overlay (not inside modal)
    if (e.target === e.currentTarget) {
      setShowSettingsModal(false);
    }
  };

  const handleSaveApiKey = () => {
    if (apiKeyInput.trim()) {
      localStorage.setItem(API_KEY_STORAGE_KEY, apiKeyInput.trim());
      alert('API Key saved!'); // Simple feedback
    } else {
      localStorage.removeItem(API_KEY_STORAGE_KEY); // Clear if input is empty
      alert('API Key cleared.');
    }
    setShowSettingsModal(false);
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-dark bg-opacity-80 z-50"
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        className="w-full max-w-md bg-surface glass border border-light p-6 rounded-xl shadow-xl relative"
        onClick={e => e.stopPropagation()}
      >
        <button
          className="absolute top-3 right-3 text-light-secondary hover:text-primary"
          onClick={() => setShowSettingsModal(false)}
          aria-label="Close settings"
        >
          <FaTimes size={20} />
        </button>
        <h1 className="text-xl font-semibold mb-4 text-light">Settings</h1>
        <div className="mb-4">
          <label htmlFor="api-key-input" className="block text-sm font-medium text-light-secondary mb-1">
            Gemini API Key:
          </label>
          <input
            id="api-key-input"
            type="password"
            placeholder="Enter your Gemini API key"
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
            className="w-full border border-light rounded-md p-2 bg-dark text-light focus:ring-secondary focus:border-secondary"
          />
          <p className="text-xs text-light-tertiary mt-1">
            Your API key is stored locally in your browser and is only sent to your backend when testing prompts.
          </p>
        </div>
        <div className="flex justify-end">
          <button
            className="btn-primary font-medium py-2 px-4 rounded-xl transition duration-150"
            onClick={handleSaveApiKey}
          >
            Save Key
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;
