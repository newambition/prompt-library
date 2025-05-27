import React, { useState } from 'react';
import { FaTimes, FaPalette } from 'react-icons/fa';

// TAG_THEMES definition (copied from DetailsView for now, consider moving to a shared constants file)
const TAG_THEMES = [
  { name: 'marketing', label: 'Marketing', className: 'tag-marketing' },
  { name: 'ai', label: 'AI', className: 'tag-ai' },
  { name: 'new', label: 'New Tag', className: 'tag-new' }, // Default/Fallback
  { name: 'success', label: 'Success', className: 'tag-success' },
  { name: 'info', label: 'Info', className: 'tag-info' },
  { name: 'warning', label: 'Warning', className: 'tag-warning' },
  { name: 'purple', label: 'Purple', className: 'tag-purple' },
  { name: 'mint', label: 'Mint', className: 'tag-mint' },
  { name: 'orange', label: 'Orange', className: 'tag-orange' },
];

// Basic Tag component (can be enhanced later)
const TagItem = ({ tag, onRemove }) => {
  // Find the theme class, default to tag-new if not found
  const theme = TAG_THEMES.find(t => t.name === tag.color) || TAG_THEMES.find(t => t.name === 'new');
  const tagClassName = theme ? theme.className : 'tag-new';

  return (
    <span className={`${tagClassName} text-sm font-medium px-2.5 py-0.5 rounded flex items-center`}>
      {tag.name}
      <button
        onClick={() => onRemove(tag.name)}
        aria-label={`Remove tag ${tag.name}`}
        className="ml-1.5 hover:text-light"
      >
        &times;
      </button>
    </span>
  );
};

function NewPromptModal({ isOpen, onClose, onSubmit, availableTags = [], templatePromptText = '' }) {
  const [title, setTitle] = useState('');
  const [initialPromptText, setInitialPromptText] = useState('');
  const [initialNotes, setInitialNotes] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [currentTagNameInput, setCurrentTagNameInput] = useState('');
  const [currentTagThemeInput, setCurrentTagThemeInput] = useState(TAG_THEMES[2].name); // Default to 'new' theme
  const [showThemePicker, setShowThemePicker] = useState(false); // State for theme picker

  // Effect to populate initial prompt text when template is used
  React.useEffect(() => {
    if (templatePromptText) {
      setInitialPromptText(templatePromptText);
    }
  }, [templatePromptText]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !initialPromptText.trim()) {
      alert('Title and Initial Prompt Text are required.');
      return;
    }
    onSubmit({
      title: title.trim(),
      initial_version_text: initialPromptText.trim(),
      initial_version_notes: initialNotes.trim(),
      tags: selectedTags, // Pass the array of tag objects
    });
    // Reset form and close
    setTitle('');
    setInitialPromptText('');
    setInitialNotes('');
    setSelectedTags([]);
    setCurrentTagNameInput('');
    onClose();
  };

  const handleAddTag = () => {
    const tagName = currentTagNameInput.trim();
    if (tagName && !selectedTags.find(t => t.name.toLowerCase() === tagName.toLowerCase())) {
      // For now, all new tags from this modal will use a default theme.
      // We can enhance this to use the theme picker from DetailsView later.
      setSelectedTags([...selectedTags, { name: tagName, color: currentTagThemeInput }]);
      setCurrentTagNameInput('');
      // setCurrentTagThemeInput('new'); // Reset theme or keep last used
    }
  };

  const handleRemoveTag = (tagNameToRemove) => {
    setSelectedTags(selectedTags.filter(tag => tag.name !== tagNameToRemove));
  };


  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-dark bg-opacity-80 z-50 p-4 sm:p-4"
      onClick={handleOverlayClick}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="w-full max-w-lg bg-surface glass border-0 sm:border sm:border-light p-2 sm:p-6 rounded-xl sm:rounded-xl shadow-xl relative flex flex-col max-h-[90vh] sm:max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-light-secondary hover:text-primary z-10"
          onClick={onClose}
          aria-label="Close new prompt modal"
        >
          <FaTimes size={20} />
        </button>
        <h2 className="text-lg sm:text-xl font-semibold mb-6 text-light text-center pr-8">Create New Prompt</h2>

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto flex-grow pr-2">
          <div>
            <label htmlFor="new-prompt-title" className="block text-sm font-medium text-light-secondary mb-1">
              Prompt Title <span className="text-danger">*</span>
            </label>
            <input
              id="new-prompt-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full border border-light rounded-md p-2.5 bg-dark text-xs sm:text-base text-light focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
              placeholder="e.g., Generate Marketing Copy"
            />
          </div>

          <div>
            <label htmlFor="new-prompt-text" className="block text-sm font-medium text-light-secondary mb-1">
              Initial Prompt Text (V1) <span className="text-danger">*</span>
            </label>
            <textarea
              id="new-prompt-text"
              value={initialPromptText}
              onChange={(e) => setInitialPromptText(e.target.value)}
              required
              rows="6"
              className="w-full border border-light rounded-md p-2.5 bg-dark text-xs sm:text-base text-light focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary resize-none"
              placeholder="Enter the initial text for your prompt..."
            />
          </div>

          <div>
            <label htmlFor="new-prompt-notes" className="block text-sm font-medium text-light-secondary mb-1">
              Initial Notes (Optional)
            </label>
            <textarea
              id="new-prompt-notes"
              value={initialNotes}
              onChange={(e) => setInitialNotes(e.target.value)}
              rows="3"
              className="w-full border border-light rounded-md p-2.5 bg-dark text-xs sm:text-base text-light focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary resize-none"
              placeholder="Add any notes for this first version..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-light-secondary mb-1">
              Tags (Optional)
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedTags.map(tag => (
                <TagItem key={tag.name} tag={tag} onRemove={handleRemoveTag} />
              ))}
            </div>
            
            {/* Mobile-first responsive tag input section */}
            <div className="space-y-2 sm:space-y-0">
              <input
                type="text"
                value={currentTagNameInput}
                onChange={(e) => setCurrentTagNameInput(e.target.value)}
                onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag();}}}
                placeholder="Enter tag name"
                className="w-full p-2.5 border border-light rounded-md text-xs sm:text-base bg-dark text-light focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
                list="available-tags-datalist-modal"
              />
              <datalist id="available-tags-datalist-modal">
                {availableTags.map(tag => (
                  <option key={tag.name} value={tag.name} />
                ))}
              </datalist>
              
              {/* Color picker and Add button - stacked on mobile, inline on larger screens */}
              <div className="flex gap-2 items-center sm:hidden">
                <div className="relative flex-1">
                  <button
                    type="button"
                    onClick={() => setShowThemePicker((v) => !v)}
                    className={`w-full p-2.5 border border-light rounded-md transition focus:outline-none ${TAG_THEMES.find(t => t.name === currentTagThemeInput)?.className || 'tag-new'} flex items-center justify-center`}
                    title="Select tag color"
                  >
                    <FaPalette />
                  </button>
                  {showThemePicker && (
                    <div className="absolute bottom-full left-0 mb-1 z-50 bg-dark border border-light rounded-md shadow-lg p-2 grid grid-cols-3 gap-1" style={{minWidth: '120px'}}>
                      {TAG_THEMES.map(theme => (
                        <button
                          key={theme.name}
                          type="button"
                          className={`w-7 h-7 rounded-full border-2 transition ${theme.className} ${currentTagThemeInput === theme.name ? 'ring-2 ring-offset-1 ring-offset-dark ring-secondary' : ''}`}
                          onClick={() => { setCurrentTagThemeInput(theme.name); setShowThemePicker(false); }}
                          title={theme.label}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="btn-secondary text-dark font-semibold py-2 px-4 rounded-xl text-sm flex-1"
                >
                  Add Tag
                </button>
              </div>
              
              {/* Desktop layout - hidden on mobile */}
              <div className="hidden sm:flex gap-2 items-center">
                <div className="relative mt-2">
                  <button
                    type="button"
                    onClick={() => setShowThemePicker((v) => !v)}
                    className={`p-2.5 border border-light rounded-md transition focus:outline-none ${TAG_THEMES.find(t => t.name === currentTagThemeInput)?.className || 'tag-new'}`}
                    title="Select tag color"
                  >
                    <FaPalette />
                  </button>
                  {showThemePicker && (
                    <div className="absolute bottom-full left-0 mb-1 z-50 bg-dark border border-light rounded-md shadow-lg p-2 grid grid-cols-3 gap-1" style={{minWidth: '120px'}}>
                      {TAG_THEMES.map(theme => (
                        <button
                          key={theme.name}
                          type="button"
                          className={`w-7 h-7 rounded-full border-2 transition ${theme.className} ${currentTagThemeInput === theme.name ? 'ring-2 ring-offset-1 ring-offset-dark ring-secondary' : ''}`}
                          onClick={() => { setCurrentTagThemeInput(theme.name); setShowThemePicker(false); }}
                          title={theme.label}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="btn-secondary text-dark font-semibold py-2 px-4 mt-2 rounded-xl text-sm"
                >
                  Add Tag
                </button>
              </div>
            </div>
          </div>
        </form>

        <div className="mt-6 flex justify-end gap-3 pt-4 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="bg-dark hover:bg-surface text-light font-medium py-2 px-5 rounded-xl border border-light"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit} // Also allow submit via this button
            className="btn-primary text-light font-medium py-2 px-5 rounded-xl"
          >
            Create Prompt
          </button>
        </div>
      </div>
    </div>
  );
}

export default NewPromptModal; 