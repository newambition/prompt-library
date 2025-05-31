// frontend/src/components/MainContent.js
import React, { useState } from 'react';
import DetailsView from './DetailsView';
import PlaygroundView from './PlaygroundView';
import PromptTemplates from './PromptTemplates';
import { FaPencilAlt } from 'react-icons/fa';
import { PROMPT_TEMPLATES } from '../constants/promptTemplates';
import { useAuthContext } from '../context/AuthContext'; // Import the context hook

// Props documentation updated to reflect context usage for auth/user data
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
  availableTags,
  // isAuthenticated, // From context
  // onLogin, // From context (loginWithRedirect)
  userApiKeys, // Still passed as prop from App.js
  apiKeysLoading, // Still passed as prop from App.js
  isDetailsViewBusy,
  onUseTemplate,
  // user, // From context (auth0User)
  // userProfile, // From context
  onShowTierModal
}) {
  const {
    isAuthenticated,
    // user: auth0User, // auth0 user object if needed directly
    userProfile
    // loginWithRedirect // if a login button were here
  } = useAuthContext();
  const buttonsDisabled = !selectedPrompt || !selectedVersionId;

  // Inline edit state for prompt title
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(selectedPrompt ? selectedPrompt.title : '');

  // Template category filter state
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Get unique categories for templates
  const categories = ['All', ...new Set(PROMPT_TEMPLATES.map(template => template.category))];

  // Get user tier from backend user profile instead of Auth0 user object
  const userTier = userProfile?.tier || 'free'; // Default to free (lowercase) if not available

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
      <header className="bg-card border-light-bottom p-3 sm:p-4 flex-shrink-0">
        {/* Mobile: title input only */}
        <div className="block sm:hidden w-full">
          <div className="flex items-center w-full px-1">
            <div className="flex-1 min-w-0">
              {currentView === 'templates' ? (
                <div className="pt-2 pl-2 pr-12">
                  <h1 className="text-base text-light font-semibold">Prompt Templates</h1>
                  <p className="text-xs text-light-secondary mt-1">Pre-built templates to get started quickly</p>
                </div>
              ) : selectedPrompt && (
                <div className="flex items-center pt-2 pl-2 pr-12 justify-start gap-2">
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
                      className="text-sm text-light font-semibold border border-gray-300 rounded px-2 py-1 bg-card w-full"
                      style={{ minWidth: '120px' }}
                    />
                  ) : (
                    <>
                      <h1 className="text-base text-light font-semibold truncate">{selectedPrompt.title}</h1>
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
          </div>
        </div>
        {/* Desktop: original header layout */}
        <div className="hidden sm:flex justify-between items-center w-full">
          <div className="flex-1 px-4">
            {currentView === 'templates' ? (
              <div className="flex flex-col">
                <h1 className="text-xl text-light font-semibold">Prompt Templates</h1>
                <div className="h-0.5 w-8 rounded bg-secondary mb-2 mt-1"></div>
                <p className="text-sm text-light-secondary">Pre-built templates to get started quickly</p>
              </div>
            ) : selectedPrompt && (
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
            {currentView === 'templates' ? (
              /* Category Filter for Templates */
              <div className="flex items-center">
                <label htmlFor="category-filter" className="text-sm font-bold text-light-secondary mr-2">
                  Category:
                </label>
                <select
                  id="category-filter"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-surface text-light text-sm p-2 min-w-[140px] rounded-xl"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            ) : (
              /* Details and Playground buttons */
              <>
                {/* Tier Button - Desktop Only */}
                {isAuthenticated && (
                  <div className="hidden sm:block mr-4">
                    {userTier === 'free' && (
                      <button
                        onClick={onShowTierModal}
                        className="font-medium py-2 px-4 rounded-xl transition duration-150 ease-in-out text-xs shadow-sm bg-gradient-to-r from-orange-500/15 to-accent/15 border border-accent/25 text-accent hover:from-orange-500/25 hover:to-accent/25 hover:border-accent/40"
                      >
                        Upgrade to Pro
                      </button>
                    )}
                    {userTier === 'pro' && (
                      <button
                        className="font-medium btn-pro"
                      >
                        ✨ Pro
                      </button>
                    )}
                  </div>
                )}
                
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
              </>
            )}
          </div>
        </div>
      </header>

      {/* Content Area - Renders Details or Playground */}
      <div className={`flex-1 overflow-y-auto dark-gradient-bg pb-20 sm:pb-6 ${
        currentView === 'templates' ? 'py-6 sm:p-6' : 'p-6'
      }`}>
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
            availableTags={availableTags}
            isDetailsViewBusy={isDetailsViewBusy}
          />
        ) : currentView === 'playground' ? (
          <PlaygroundView
            prompt={selectedPrompt}
            selectedVersionId={selectedVersionId}
            onRunTest={onRunTest}
            onSaveAsNewVersion={onSaveAsNewVersion}
            // isAuthenticated, onLogin, userApiKeys, apiKeysLoading will be handled by PlaygroundView via context or passed if still needed
            // For now, assuming PlaygroundView will be updated to use context for auth.
            // If PlaygroundView still needs userApiKeys/apiKeysLoading, App.js must continue to pass them here.
            userApiKeys={userApiKeys}
            apiKeysLoading={apiKeysLoading}
          />
        ) : currentView === 'templates' ? (
          <PromptTemplates
            onUseTemplate={onUseTemplate}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        ) : null}
      </div>

      {/* Mobile Bottom Tab Bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 w-full z-40 bg-card border-t border-light flex justify-around items-center h-14 shadow-lg">
        <button
          id="tab-details"
          onClick={() => onSetView('details')}
          disabled={buttonsDisabled}
          className={`flex-1 flex flex-col items-center justify-center h-full font-medium text-xs transition duration-150 ease-in-out focus:outline-none ${
            currentView === 'details' && !buttonsDisabled
              ? 'bg-primary-gradient text-light shadow-md'
              : 'bg-card text-light-secondary hover:text-primary'
          }`}
          style={{ borderRadius: 0 }}
        >
          {/* Optionally add an icon here */}
          Details
        </button>
        <button
          id="tab-playground"
          onClick={() => onSetView('playground')}
          disabled={buttonsDisabled}
          className={`flex-1 flex flex-col items-center justify-center h-full font-medium text-xs transition duration-150 ease-in-out focus:outline-none ${
            currentView === 'playground' && !buttonsDisabled
              ? 'bg-primary-gradient text-light shadow-md'
              : 'bg-card text-light-secondary hover:text-primary'
          }`}
          style={{ borderRadius: 0 }}
        >
          {/* Optionally add an icon here */}
          Testing Playground
        </button>
      </nav>
    </main>
  );
}

export default MainContent;
