import React, { useRef } from 'react';
import { FaTimes } from 'react-icons/fa';

function SettingsModal({ showSettingsModal, setShowSettingsModal }) {
  const modalRef = useRef();

  if (!showSettingsModal) return null;

  // Close if click outside modal content
  const handleOverlayClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      setShowSettingsModal(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      onMouseDown={handleOverlayClick}
    >
      <div
        ref={modalRef}
        className="w-1/2 bg-white border border-gray-500 p-8 rounded-lg shadow-lg relative"
        onMouseDown={e => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
          onClick={() => setShowSettingsModal(false)}
        >
          <FaTimes />
        </button>
        <h1 className="text-2xl font-bold mb-4">Settings</h1>
        <p className="mb-4">API Key:</p>
        <textarea
          placeholder="Enter your API key"
          className="w-full h-20 border border-gray-300 rounded mb-4 p-2"
        ></textarea>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg"
          onClick={() => setShowSettingsModal(false)}
        >
          Save
        </button>
      </div>
    </div>
  );
}

export default SettingsModal;
