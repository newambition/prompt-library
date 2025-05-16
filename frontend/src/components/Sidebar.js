// src/components/Sidebar.js
import React from 'react';
import { getTagClasses } from '../data'; // Import helper for tag styling
import { FaCog } from 'react-icons/fa';
import SettingsModal from './SettingsModal';
/**
 * Sidebar component displaying the list of prompts and filters.
 * @param {object} props - Component props.
 * @param {Array} props.prompts - Array of prompt objects.
 * @param {string|null} props.selectedPromptId - The ID of the currently selected prompt.
 * @param {Function} props.onSelectPrompt - Callback function when a prompt is selected.
 * @param {Function} props.onAddNewPrompt - Callback function for the 'New Prompt' button.
 * @param {Function} props.onFilterChange - Callback function when the tag filter changes.
 * @param {Function} props.onLogin - Callback function for the 'Login' button.
 * @param {Function} props.setShowSettingsModal - Callback function for the 'Settings' button.
 * @param {boolean} props.showSettingsModal - Whether the settings modal is shown.
 * @param {Function} props.onShowSettingsModal - Callback function for the 'Settings' button.
 */
function Sidebar({ prompts, selectedPromptId, onSelectPrompt, onAddNewPrompt, onFilterChange, onLogin, setShowSettingsModal, showSettingsModal, onShowSettingsModal }) {
  return (
    <aside className="w-1/4 lg:w-1/5 bg-white border-r border-gray-200 flex flex-col overflow-hidden h-screen">
      {/* Header section with title and new prompt button */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold">My Prompts</h2>
        <button
          onClick={onAddNewPrompt}
          className="mt-3 w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition duration-150 ease-in-out"
        >
          + New Prompt
        </button>
        {/* Tag Filter */}
        <div className="mt-4">
          <label htmlFor="tag-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Tag:
          </label>
          <select
            id="tag-filter"
            name="tag-filter"
            onChange={onFilterChange} // Attach the filter change handler
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 bg-white"
          >
            {/* Placeholder options - replace with dynamic tags */}
            <option value="">All Tags</option>
            <option value="Marketing">Marketing</option>
            <option value="Code Generation">Code Generation</option>
            <option value="Summarization">Summarization</option>
            <option value="Internal">Internal</option>
            {/* TODO: Dynamically generate options based on available tags */}
          </select>
        </div>
      </div>

      {/* Scrollable list of prompts */}
      <nav className="flex-1 overflow-y-auto prompt-list p-2 space-y-1">
        {prompts.map((prompt) => (
          <a
            key={prompt.id}
            href={`/prompt/${prompt.id}`}
            onClick={(e) => {
              e.preventDefault();
              onSelectPrompt(prompt.id); // Call the selection handler
            }}
            // Apply active styles conditionally
            className={`block p-3 rounded-lg hover:bg-gray-100 transition duration-150 ease-in-out ${
              prompt.id === selectedPromptId
                ? 'bg-sky-100 border-l-4 border-sky-500' // Active prompt style
                : ''
            }`}
          >
            <h3 className="font-medium text-gray-900 truncate">{prompt.title}</h3>
            <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-1 items-center">
              <span>Latest: {prompt.latestVersion} | Tags:</span>
              {prompt.tags.map((tag) => (
                <span
                  key={tag}
                  className={`${getTagClasses(tag)} text-xs font-medium px-1.5 py-0.5 rounded`}
                >
                  {tag}
                </span>
              ))}
               {prompt.tags.length === 0 && <span className="italic">No tags</span>}
            </div>
          </a>
        ))}
         {prompts.length === 0 && (
            <p className="p-3 text-sm text-gray-500 italic">No prompts found.</p>
        )}
      </nav>
      <div className="p-4 flex gap-2 border-t border-gray-200">
        <button
          onClick={onLogin}
          className="w-full flex items-center justify-center text-gray-500 hover:text-gray-700 text-sm rounded-lg transition duration-150 ease-in-out"
        >
          Login
        </button>
        <button
          onClick={() => setShowSettingsModal(true)}
          className="w-full flex items-center justify-center text-gray-500 hover:text-gray-700 text-sm rounded-lg transition duration-150 ease-in-out"
        >
          <FaCog className="mr-2" />
        </button>
        <SettingsModal showSettingsModal={showSettingsModal} setShowSettingsModal={setShowSettingsModal} />
       
      </div>
    </aside>
  );
}

export default Sidebar;
