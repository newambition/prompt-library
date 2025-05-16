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
    if (modalRef.current && !modalRef.current.contains(e.target)) {
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
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      onMouseDown={handleOverlayClick} // Use onMouseDown for overlay click to prevent conflict with input interaction
    >
      <div
        ref={modalRef}
        className="w-full max-w-md bg-white border border-gray-300 p-6 rounded-lg shadow-xl relative"
        onMouseDown={e => e.stopPropagation()} // Prevent closing when clicking inside modal content
      >
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          onClick={() => setShowSettingsModal(false)}
          aria-label="Close settings"
        >
          <FaTimes size={20} />
        </button>
        <h1 className="text-xl font-semibold mb-4">Settings</h1>
        <div className="mb-4">
          <label htmlFor="api-key-input" className="block text-sm font-medium text-gray-700 mb-1">
            Gemini API Key:
          </label>
          <input
            id="api-key-input"
            type="password" // Use password type for API keys
            placeholder="Enter your Gemini API key"
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
            className="w-full border border-gray-300 rounded p-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Your API key is stored locally in your browser and is only sent to your backend when testing prompts.
          </p>
        </div>
        <div className="flex justify-end">
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition duration-150"
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
