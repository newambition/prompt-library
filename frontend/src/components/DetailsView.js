// src/components/DetailsView.js
import React, { useState, useEffect } from 'react';
import { getSortedVersionsArray, getTagClasses, getTagButtonClasses } from '../data';
import { FaPencilAlt } from 'react-icons/fa';

/**
 * DetailsView component displaying versions, notes, and tags for a selected prompt.
 * @param {object} props - Component props.
 * @param {object|null} props.prompt - The currently selected prompt object.
 * @param {string|null} props.selectedVersionId - The ID of the currently selected version.
 * @param {Function} props.onSelectVersion - Callback function when a version is selected.
 * @param {Function} props.onSaveNotes - Callback function to save notes for a version.
 * @param {Function} props.onAddTag - Callback function to add a tag to the prompt.
 * @param {Function} props.onRemoveTag - Callback function to remove a tag from the prompt.
 * @param {Function} props.onDeletePrompt - Callback function to delete the prompt.
 * @param {Function} props.onRenamePrompt - Callback function to rename the prompt.
 */
function DetailsView({ prompt, selectedVersionId, onSelectVersion, onSaveNotes, onAddTag, onRemoveTag, onDeletePrompt, onRenamePrompt }) {
  const [noteText, setNoteText] = useState('');
  const [newTag, setNewTag] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Find the selected version object
  const selectedVersion = prompt?.versions?.[selectedVersionId];
  // Get a sorted array of versions for display
  const versions = prompt ? getSortedVersionsArray(prompt) : [];

  // Update local note text state when the selected version or its notes change
  useEffect(() => {
    setNoteText(selectedVersion?.notes || '');
    setTitleInput(prompt?.title || '');
  }, [selectedVersion, prompt]);

  // Handler for saving notes
  const handleSaveNotes = () => {
      if (prompt && selectedVersionId) {
        onSaveNotes(prompt.id, selectedVersionId, noteText);
        // Optional: Add visual feedback on save
      }
  };

  // Handler for adding a tag
  const handleAddTag = () => {
      if (prompt && newTag.trim()) {
          onAddTag(prompt.id, newTag.trim());
          setNewTag(''); // Clear input after adding
      }
  };

   // Handler for removing a tag
   const handleRemoveTag = (tagToRemove) => {
       if (prompt) {
           onRemoveTag(prompt.id, tagToRemove);
       }
   };

   // Handler for pressing Enter in the tag input
   const handleTagInputKeyPress = (event) => {
       if (event.key === 'Enter') {
           handleAddTag();
       }
   };

  // Handler for renaming prompt
  const handleRename = () => {
    if (prompt && titleInput.trim() && titleInput.trim() !== prompt.title) {
      onRenamePrompt(prompt.id, titleInput.trim());
      setEditingTitle(false);
    } else {
      setEditingTitle(false);
    }
  };

  // If no prompt is selected, show a placeholder message
  if (!prompt || !selectedVersionId || !selectedVersion) {
    return (
      <div className="text-center text-gray-500 mt-10">
        Select a prompt from the list to see its details and versions.
      </div>
    );
  }

  // Render the details content
  return (
    <div className="space-y-6">
      {/* Prompt Title with Inline Edit */}
      <div className="flex items-center gap-2 mb-2">
        {editingTitle ? (
          <input
            type="text"
            value={titleInput}
            autoFocus
            onChange={e => setTitleInput(e.target.value)}
            onBlur={handleRename}
            onKeyDown={e => {
              if (e.key === 'Enter') handleRename();
              if (e.key === 'Escape') setEditingTitle(false);
            }}
            className="text-2xl font-semibold border border-gray-300 rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500"
            style={{ minWidth: '200px' }}
          />
        ) : (
          <>
            <h2 className="text-2xl font-semibold truncate">{prompt.title}</h2>
            <button
              onClick={() => setEditingTitle(true)}
              className="ml-1 text-gray-500 hover:text-blue-600 focus:outline-none"
              title="Edit prompt name"
            >
              <FaPencilAlt size={12} />
            </button>
          </>
        )}
      </div>
      {/* Versions List */}
      <div>
        <h3 className="text-lg font-medium mb-2">Versions</h3>
        <ul className="border border-gray-200 rounded-lg overflow-hidden bg-white">
          {versions.map((version) => (
            <li
              key={version.id}
              onClick={() => onSelectVersion(prompt.id, version.id)} // Select version on click
              className={`border-b border-gray-200 last:border-b-0 p-3 hover:bg-gray-50 cursor-pointer transition duration-150 ease-in-out ${
                version.id === selectedVersionId ? 'bg-sky-50 font-semibold' : '' // Active version style
              }`}
            >
              <div className="flex justify-between items-center">
                <span>
                  Version v{version.id}{' '}
                  {version.id === prompt.latest_version ? '(Latest)' : ''}
                </span>
                <span className="text-xs text-gray-500 font-normal">{version.date}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1 font-normal">
                Note: {version.notes || <span className="italic">No notes for this version.</span>}
              </p>
            </li>
          ))}
           {versions.length === 0 && (
                <li className="p-3 text-sm text-gray-500 italic">No versions available.</li>
            )}
        </ul>
      </div>

      {/* Selected Version Details */}
      <div>
        <h3 className="text-lg font-medium mb-2">
          Selected Version Details ({selectedVersionId})
        </h3>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="font-semibold mb-2">Prompt Text:</h4>
          {/* Using 'pre' for preserving whitespace and line breaks */}
          <pre className="bg-gray-100 p-3 rounded text-sm whitespace-pre-wrap break-words overflow-x-auto">
            {selectedVersion.text}
          </pre>
          <h4 className="font-semibold mt-4 mb-2">Notes for this version:</h4>
          <textarea
            id={`version-notes-${selectedVersionId}`} // Unique ID for accessibility
            rows="3"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Add or edit notes for this version..."
          />
          <button
            onClick={handleSaveNotes}
            className="mt-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-1.5 px-3 rounded-lg transition duration-150 ease-in-out"
          >
            Save Notes
          </button>
        </div>
      </div>

      {/* Tags Section */}
      <div>
        <h3 className="text-lg font-medium mb-2">Tags</h3>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex flex-wrap gap-2 mb-3" aria-live="polite"> {/* aria-live for screen readers */}
            {prompt.tags.map((tag) => (
              <span
                key={tag}
                className={`${getTagClasses(
                  tag
                )} text-sm font-medium px-2.5 py-0.5 rounded flex items-center`}
              >
                {tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  aria-label={`Remove tag ${tag}`}
                  className={`ml-1.5 ${getTagButtonClasses(tag)}`}
                >
                  &times; {/* Multiplication sign used as 'remove' icon */}
                </button>
              </span>
            ))}
            {prompt.tags.length === 0 && (
                <span className="text-sm text-gray-500 italic">No tags assigned.</span>
            )}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              id="new-tag-input"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={handleTagInputKeyPress} // Add tag on Enter key
              placeholder="Add new or existing tag"
              className="flex-grow p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={handleAddTag}
              className="bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium py-1.5 px-3 rounded-lg transition duration-150 ease-in-out"
            >
              Add Tag
            </button>
          </div>
        </div>
      </div>
      {/* Delete Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowDeleteModal(true)}
          className="bg-blue-500 hover:bg-red-600 text-white text-sm font-medium py-1.5 px-4 rounded-lg transition duration-150 ease-in-out"
        >
          Delete Prompt
        </button>
      </div>
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs text-center">
            <p className="mb-4 text-lg">Are you sure you want to delete?</p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-1 px-4 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowDeleteModal(false); onDeletePrompt(prompt.id); }}
                className="bg-red-500 hover:bg-red-600 text-white font-medium py-1 px-4 rounded-lg"
              >
                Delete Prompt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DetailsView;
