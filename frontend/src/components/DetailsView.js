// frontend/src/components/DetailsView.js
import React, { useState, useEffect, useMemo } from 'react';
import { FaPalette } from 'react-icons/fa';
// Replace PREDEFINED_TAG_COLORS with tag themes
const TAG_THEMES = [
  { name: 'marketing', label: 'Marketing', className: 'tag-marketing' },
  { name: 'ai', label: 'AI', className: 'tag-ai' },
  { name: 'new', label: 'New Tag', className: 'tag-new' },
  { name: 'success', label: 'Success', className: 'tag-success' },
  { name: 'info', label: 'Info', className: 'tag-info' },
  { name: 'warning', label: 'Warning', className: 'tag-warning' },
  { name: 'purple', label: 'Purple', className: 'tag-purple' },
  { name: 'mint', label: 'Mint', className: 'tag-mint' },
  { name: 'orange', label: 'Orange', className: 'tag-orange' },
  // Add more themes here as needed
];

// Helper to get text color based on background for better contrast
const getTextColorForBackground = (bgColor) => {
  if (!bgColor) return 'text-light';
  if (bgColor.includes('100') || bgColor.includes('200') || bgColor.includes('300') || bgColor.includes('yellow') || bgColor.includes('lime') || bgColor.includes('amber')) {
    return 'text-light';
  }
  return 'text-light';
};

// DetailsView component
function DetailsView({
  prompt,
  selectedVersionId,
  onSelectVersion,
  onSaveNotes,
  onAddTag,
  onRemoveTag,
  onDeletePrompt,
  onRenamePrompt,
  availableTags // Passed from App.js, [{name: "...", color: "..."}, ...]
}) {
  const [noteText, setNoteText] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [newTagTheme, setNewTagTheme] = useState(TAG_THEMES[0].name);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);

  const selectedVersionObject = useMemo(() => {
    if (!prompt || !prompt.versions || !selectedVersionId) return null;
    return prompt.versions[selectedVersionId];
  }, [prompt, selectedVersionId]);

  const versionsForDisplay = useMemo(() => {
    if (!prompt || !prompt.versions) return [];
    return Object.entries(prompt.versions)
      .map(([versionKey, versionData]) => ({
        ...versionData,
        versionKey: versionKey,
      }))
      .sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        if (dateB !== dateA) return dateB - dateA;
        const numA = parseInt(a.versionKey.substring(1), 10);
        const numB = parseInt(b.versionKey.substring(1), 10);
        return numB - numA;
      });
  }, [prompt]);

  useEffect(() => {
    setNoteText(selectedVersionObject?.notes || '');
    setTitleInput(prompt?.title || '');
    if (prompt && !selectedVersionId && prompt.latest_version && prompt.versions && prompt.versions[prompt.latest_version]) {
      onSelectVersion(prompt.id, prompt.latest_version);
    }
  }, [selectedVersionObject, prompt, selectedVersionId, onSelectVersion]);

  // Handler for when the tag name input changes or an option is selected
  const handleTagNameChange = (event) => {
    const name = event.target.value;
    setNewTagName(name);
    // Check if this name matches an existing available tag
    const existingTag = availableTags.find(tag => tag.name.toLowerCase() === name.toLowerCase());
    if (existingTag && existingTag.color) {
      setNewTagTheme(existingTag.color); // Pre-fill theme if existing tag is selected/typed
    } else if (!newTagTheme) {
      setNewTagTheme(TAG_THEMES[0].name);
    }
  };

  const handleSaveNotes = () => {
    if (prompt && selectedVersionId && selectedVersionObject) {
      onSaveNotes(prompt.id, selectedVersionId, noteText);
    }
  };

  const handleAddTag = () => {
    if (prompt && newTagName.trim() && newTagTheme) {
      onAddTag(prompt.id, { name: newTagName.trim(), color: newTagTheme });
      setNewTagName('');
    }
  };

  const handleRemoveTag = (tagNameToRemove) => {
    if (prompt) {
      onRemoveTag(prompt.id, tagNameToRemove);
    }
  };

  const handleTagInputKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleAddTag();
    }
  };

  const handleRename = () => {
    if (prompt && titleInput.trim() && titleInput.trim() !== prompt.title) {
      onRenamePrompt(prompt.id, titleInput.trim());
    }
    setEditingTitle(false);
  };

  if (!prompt) {
    return (
      <div className="text-center text-light-secondary mt-10">
        Select a prompt from the list to see its details.
      </div>
    );
  }

  if (!selectedVersionId || !selectedVersionObject) {
    return (
      <div className="text-center text-light-secondary mt-10">
        Loading version details or no version selected...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Versions List */}
      <div>
        <h3 className="text-lg text-light font-semibold mb-2 flex items-center gap-2">
          Versions
        </h3>
        <div className="h-0.5 w-8 rounded bg-secondary mb-4 -mt-2"></div>
        <ul className="border border-light rounded-xl overflow-hidden bg-surface glass">
          {versionsForDisplay.map((versionItem) => (
            <li
              key={versionItem.versionKey}
              onClick={() => onSelectVersion(prompt.id, versionItem.versionKey)}
              className={`border-light-border last:border-b-0 p-3 hover:bg-dark cursor-pointer transition duration-150 ease-in-out rounded-xl ${
                versionItem.versionKey === selectedVersionId ? 'bg-card font-semibold' : 'bg-dark'
              }`}
            >
              <div className="flex flex-row items-center w-full">
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-light truncate">
                    Version {versionItem.versionKey}
                    {versionItem.versionKey === prompt.latest_version && (
                      <span className="text-secondary font-semibold ml-1">(Latest)</span>
                    )}
                  </span>
                  <p className="text-sm text-light-secondary mt-1 font-normal truncate">
                    Note: {versionItem.notes || <span className="italic">No notes for this version.</span>}
                  </p>
                </div>
                <span className="text-xs text-light font-normal border border-light rounded-md px-2 py-1 flex items-center justify-center ml-4 self-center">
                  {versionItem.date}
                </span>
              </div>
            </li>
          ))}
           {versionsForDisplay.length === 0 && ( <li className="p-3 text-sm text-gray-500 italic">No versions available.</li> )}
        </ul>
      </div>

      {/* Selected Version Details */}
      <div>
        <h3 className="text-lg text-light font-semibold mb-2 flex items-center gap-2">
          Selected Version Details ({selectedVersionId})
        </h3>
        <div className="h-0.5 w-8 rounded bg-secondary mb-4 -mt-2"></div>
        <div className="bg-surface glass p-6 rounded-xl border border-light">
          <h4 className="font-semibold mb-2 text-light">Prompt Text:</h4>
          <pre className="bg-dark text-light p-4 rounded-lg text-sm whitespace-pre-wrap break-words overflow-x-auto border border-light">
            {selectedVersionObject.text}
          </pre>
          <h4 className="font-semibold mt-6 mb-2 text-light">Notes for this version:</h4>
          <textarea
            id={`version-notes-${selectedVersionId}`} rows="3" value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            className="w-full p-3 border border-light rounded-lg text-sm bg-dark text-light focus:ring-secondary focus:border-secondary"
            placeholder="Add or edit notes for this version..."
          />
          <button onClick={handleSaveNotes}
            className="mt-3 btn-secondary text-dark font-semibold py-2 px-5 rounded-xl transition duration-150 ease-in-out shadow-md"
          > Save Notes
          </button>
        </div>
      </div>

      {/* Tags Section */}
      <div>
        <h3 className="text-lg text-light font-semibold mb-2 flex items-center gap-2">Tags</h3>
        <div className="h-0.5 w-8 rounded bg-secondary mb-4 -mt-2"></div>
        <div className="bg-surface glass p-6 rounded-xl border border-light">
          <div className="flex flex-wrap gap-2 mb-3" aria-live="polite">
            {prompt.tags && prompt.tags.map((tag) => (
              <span
                key={tag.name}
                className={`${TAG_THEMES.find(t => t.name === tag.color)?.className || 'tag-new'} text-sm font-medium px-2.5 py-0.5 rounded flex items-center`}
              >
                {tag.name}
                <button
                  onClick={() => handleRemoveTag(tag.name)}
                  aria-label={`Remove tag ${tag.name}`}
                  className="ml-1.5 hover:text-light"
                > &times;
                </button>
              </span>
            ))}
            {(!prompt.tags || prompt.tags.length === 0) && ( <span className="text-sm text-gray-500 italic">No tags assigned.</span> )}
          </div>
          <div className="flex gap-2 items-center relative">
            <input
              type="text"
              id="new-tag-name-input"
              list="available-tags-datalist"
              value={newTagName}
              onChange={handleTagNameChange}
              onKeyPress={handleTagInputKeyPress}
              placeholder="Type or select tag name"
              className="flex-grow p-2 border border-light rounded-md text-sm bg-dark text-light focus:ring-secondary focus:border-secondary"
            />
            <datalist id="available-tags-datalist">
              {availableTags.map(tag => (
                <option key={tag.name} value={tag.name} />
              ))}
            </datalist>
            {/* Pop-out tag theme picker */}
            <button
              type="button"
              onClick={() => setShowThemePicker((v) => !v)}
              className={`p-2 border rounded-md transition focus:outline-none ${TAG_THEMES.find(t => t.name === newTagTheme)?.className || 'tag-new'}`}
              title="Select tag color"
              style={{ position: 'relative' }}
            >
              <FaPalette />
            </button>
            {showThemePicker && (
              <div className="absolute top-full mt-1 right-0 z-10 bg-dark border border-light rounded-md shadow-lg p-2 grid grid-cols-3 gap-2" style={{minWidth: '180px'}}>
                {TAG_THEMES.map(theme => (
                  <button
                    key={theme.name}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 transition ${theme.className} ${newTagTheme === theme.name ? 'ring-2 ring-secondary' : ''}`}
                    onClick={() => { setNewTagTheme(theme.name); setShowThemePicker(false); }}
                    title={theme.label}
                  />
                ))}
              </div>
            )}
            <button
              onClick={handleAddTag}
              className="btn-secondary text-dark font-semibold py-2 px-4 rounded-xl transition duration-150 ease-in-out shadow-md"
            > Add Tag
            </button>
          </div>
        </div>
      </div>

      {/* Delete Prompt Section */}
      <div className="flex justify-start mt-4">
        <button
          onClick={() => setShowDeleteModal(true)}
          className="bg-danger-gradient hover:shadow-danger text-light text-sm font-semibold py-2 px-6 rounded-xl transition duration-150 ease-in-out shadow-md"
        > Delete Prompt
        </button>
      </div>
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
          <div className="bg-surface rounded-xl shadow-lg p-6 w-full max-w-xs text-center border border-light">
            <p className="mb-4 text-lg text-light">Are you sure you want to delete this prompt?</p>
            <div className="flex gap-2 justify-center">
              <button onClick={() => setShowDeleteModal(false)}
                className="bg-dark hover:bg-surface text-light font-medium py-1 px-4 rounded-xl border border-light"
              > Cancel
              </button>
              <button onClick={() => { setShowDeleteModal(false); onDeletePrompt(prompt.id); }}
                className="bg-danger-gradient hover:shadow-danger text-light font-medium py-1 px-4 rounded-xl"
              > Delete Prompt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DetailsView;
