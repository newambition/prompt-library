// src/components/MainContent.js
import React from 'react';
import DetailsView from './DetailsView';
import PlaygroundView from './PlaygroundView';

/**
 * MainContent component holding the header and the active view (Details or Playground).
 * @param {object} props - Component props.
 * @param {string} props.currentView - The current active view ('details' or 'playground').
 * @param {object|null} props.selectedPrompt - The currently selected prompt object.
 * @param {string|null} props.selectedVersionId - The ID of the currently selected version.
 * @param {Function} props.onSetView - Callback function to change the active view.
 * @param {Function} props.onSelectVersion - Callback function when a version is selected in DetailsView.
 * @param {Function} props.onSaveNotes - Callback function to save notes.
 * @param {Function} props.onAddTag - Callback function to add a tag.
 * @param {Function} props.onRemoveTag - Callback function to remove a tag.
 * @param {Function} props.onRunTest - Callback function to run a test in PlaygroundView.
 * @param {Function} props.onSaveAsNewVersion - Callback function to save a new version from PlaygroundView.
 * @param {Function} props.onDeletePrompt - Callback function to delete a prompt.
 * @param {Function} props.onRenamePrompt - Callback function to rename a prompt.
 */
function MainContent({
  currentView,
  selectedPrompt,
  selectedVersionId,
  onSetView,
  onSelectVersion,
  onSaveNotes,
  onAddTag,
  onRemoveTag,
  onRunTest,
  onSaveAsNewVersion,
  onDeletePrompt,
  onRenamePrompt
}) {
  // Determine if buttons should be disabled (no prompt selected)
  const buttonsDisabled = !selectedPrompt || !selectedVersionId;

  return (
    <main className="flex-1 flex flex-col overflow-hidden h-screen">
      {/* Header Bar */}
      <header className="bg-white border-b border-gray-200 p-4 flex justify-between items-center flex-shrink-0">
        <h1 className="text-2xl font-semibold truncate pr-4">
          {selectedPrompt ? selectedPrompt.title : 'Select a Prompt'}
        </h1>
        {/* View Switcher Buttons */}
        <div>
          <button
            id="view-details-btn"
            onClick={() => onSetView('details')}
            disabled={buttonsDisabled}
            // Apply conditional styling for active/inactive state
            className={`font-medium py-2 px-4 rounded-l-lg transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed ${
              currentView === 'details' && !buttonsDisabled
                ? 'bg-gray-200 hover:bg-gray-300 text-gray-800 ring-1 ring-inset ring-gray-300' // Active style for Details
                : 'bg-blue-500 hover:bg-blue-600 text-white' // Inactive style for Details (or default when disabled)
            }`}
          >
            Details
          </button>
          <button
            id="view-playground-btn"
            onClick={() => onSetView('playground')}
            disabled={buttonsDisabled}
            // Apply conditional styling for active/inactive state
            className={`font-medium py-2 px-4 rounded-r-lg transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed ${
              currentView === 'playground' && !buttonsDisabled
                ? 'bg-gray-200 hover:bg-gray-300 text-gray-800 ring-1 ring-inset ring-gray-300' // Active style for Playground
                : 'bg-blue-500 hover:bg-blue-600 text-white' // Inactive style for Playground (or default when disabled)
            }`}
          >
            Testing Playground
          </button>
        </div>
      </header>

      {/* Content Area - Renders Details or Playground */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        {currentView === 'details' ? (
          <DetailsView
            prompt={selectedPrompt}
            selectedVersionId={selectedVersionId}
            onSelectVersion={onSelectVersion}
            onSaveNotes={onSaveNotes}
            onAddTag={onAddTag}
            onRemoveTag={onRemoveTag}
            onDeletePrompt={onDeletePrompt}
            onRenamePrompt={onRenamePrompt}
          />
        ) : (
          <PlaygroundView
            prompt={selectedPrompt}
            selectedVersionId={selectedVersionId}
            onRunTest={onRunTest}
            onSaveAsNewVersion={onSaveAsNewVersion}
          />
        )}
      </div>
    </main>
  );
}

export default MainContent;
