// frontend/src/components/MainContent.js
import React, { useState } from 'react';
import DetailsView from './DetailsView';
import PlaygroundView from './PlaygroundView';
import { FaPencilAlt } from 'react-icons/fa';

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
 * @param {Array} props.availableTags - Array of unique tag objects for the tag input datalist.
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
  onRenamePrompt,
  availableTags // Receive availableTags
}) {
  const buttonsDisabled = !selectedPrompt || !selectedVersionId;

  // Inline edit state for prompt title
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(selectedPrompt ? selectedPrompt.title : '');

  // Keep titleInput in sync with selectedPrompt
  React.useEffect(() => {
    setTitleInput(selectedPrompt ? selectedPrompt.title : '');
    setEditingTitle(false);
  }, [selectedPrompt]);

  const handleRename = () => {
    if (selectedPrompt && titleInput.trim() && titleInput.trim() !== selectedPrompt.title) {
      onRenamePrompt(selectedPrompt.id, titleInput.trim());
    }
    setEditingTitle(false);
  };

  return (
    <main className="flex-1 flex flex-col overflow-hidden h-screen">
      {/* Header Bar */}
      <header className="bg-card border-light-bottom p-4 flex justify-between items-center flex-shrink-0">
        <div className="flex-1 px-4">
          {selectedPrompt && (
            <div className="flex items-center gap-2">
              {editingTitle ? (
                <input
                  type="text"
                  value={titleInput}
                  autoFocus
                  onChange={e => setTitleInput(e.target.value)}
                  onBlur={handleRename}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleRename();
                    if (e.key === 'Escape') { setEditingTitle(false); setTitleInput(selectedPrompt.title); }
                  }}
                  className="text-lg text-light font-semibold border border-gray-300 rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500 bg-card"
                  style={{ minWidth: '200px' }}
                />
              ) : (
                <>
                  <h1 className="text-xl text-light font-semibold truncate">{selectedPrompt.title}</h1>
                  <button
                    onClick={() => { setTitleInput(selectedPrompt.title); setEditingTitle(true); }}
                    className="ml-1 text-light-secondary hover:text-green-300 focus:outline-none"
                    title="Edit prompt name"
                  >
                    <FaPencilAlt size={12} />
                  </button>
                </>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-3 pr-2">
          <button
            id="view-details-btn"
            onClick={() => onSetView('details')}
            disabled={buttonsDisabled}
            className={`font-medium py-2 px-5 rounded-xl transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-md ${
              currentView === 'details' && !buttonsDisabled
                ? 'bg-primary-gradient text-light border-none'
                : 'bg-card text-light-secondary border-2 border-light glass hover:border-primary'
            }`}
          >
            Details
          </button>
          <button
            id="view-playground-btn"
            onClick={() => onSetView('playground')}
            disabled={buttonsDisabled}
            className={`font-medium py-2 px-5 rounded-xl transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-md ${
              currentView === 'playground' && !buttonsDisabled
                ? 'bg-primary-gradient text-light border-none'
                : 'bg-card text-light-secondary border-2 border-light glass hover:border-primary'
            }`}
          >
            Testing Playground
          </button>
        </div>
      </header>

      {/* Content Area - Renders Details or Playground */}
      <div className="flex-1 overflow-y-auto p-6 dark-gradient-bg">
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
            availableTags={availableTags} // Pass availableTags to DetailsView
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
