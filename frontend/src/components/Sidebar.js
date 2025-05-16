// frontend/src/components/Sidebar.js
import React from 'react';
import { FaCog, FaSignInAlt, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';
import SettingsModal from './SettingsModal'; // Keep this import

function Sidebar({
  prompts,
  selectedPromptId,
  onSelectPrompt,
  onAddNewPrompt, // This will be called, App.js will handle auth check
  onFilterChange,
  availableTags,
  setShowSettingsModal, // This is now the gatekeeper function from App.js
  showSettingsModal,    // To control modal visibility if user is authenticated
  isAuthenticated,
  user,
  onLogin,
  onLogout
}) {
  return (
    <aside className="w-1/4 lg:w-1/5 bg-card border-light-right flex flex-col overflow-hidden h-screen text-light">
      <div className="p-4  border-light-bottom mb-3">
        <div className="flex flex-col mb-5">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-light relative" style={{lineHeight: '1.2'}}>
              My Prompts
              <span className="block h-0.5 w-8 mt-1 rounded bg-secondary absolute left-0 -bottom-2"></span>
            </h2>
            {isAuthenticated && user?.picture && (
              <img src={user.picture} alt={user.name || 'User'} className="w-8 h-8 rounded-full border-2 border-primary" />
            )}
            {isAuthenticated && !user?.picture && user?.name && (
               <div className="flex items-center text-sm text-light-secondary" title={user.name}>
                  <FaUserCircle size={24} className="mr-2 text-primary" />
                  <span className="truncate max-w-[100px]">{user.name.split('@')[0]}</span>
               </div>
            )}
          </div>
        </div>
        <button
          onClick={onAddNewPrompt}
          className="w-full btn-primary font-medium py-3 px-4 rounded-xl transition duration-150 ease-in-out shadow-md text-xs mt-2 mb-2"
          style={{minHeight: '44px'}}
        >
          + New Prompt
        </button>
        <div className="mt-4">
          <label htmlFor="tag-filter" className="block text-sm font-medium text-light-secondary mb-1">
            Filter by Tag:
          </label>
          <select
            id="tag-filter"
            name="tag-filter"
            onChange={onFilterChange}
            className="block w-full rounded-md border-light shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 bg-surface mb-2 text-light"
            style={{minHeight: '36px'}}
          >
            <option value="">All Tags</option>
            {availableTags.map((tag) => (
              <option key={tag.name} value={tag.name}>
                {tag.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto prompt-list p-2 space-y-3">
        {prompts.map((prompt) => {
          const isSelected = prompt.id === selectedPromptId;
          return (
            <a
              key={prompt.id}
              href={`/prompt/${prompt.id}`}
              onClick={(e) => {
                e.preventDefault();
                onSelectPrompt(prompt.id);
              }}
              className={`block p-3 rounded-xl transition duration-150 ease-in-out bg-surface ${
                isSelected
                  ? 'border-l-4 border-primary-left shadow-primary shadow-lg border-solid'
                  : 'border-l-4 border-transparent border-solid'
              } cursor-pointer`}
              style={{minHeight: '64px'}}
            >
              <h3 className={`font-semibold truncate text-base ${isSelected ? 'text-secondary' : 'text-light'}`}>{prompt.title}</h3>
              <div className="text-xs text-light-secondary mt-1 flex flex-wrap gap-1 items-center">
                <span>Latest: {prompt.latest_version} | Tags:</span>
                {prompt.tags && prompt.tags.map((tag) => (
                  <span
                    key={tag.name}
                    className={`tag-${tag.color || 'new'} px-1.5 py-0.5 rounded text-xs font-medium`}
                  >
                    {tag.name}
                  </span>
                ))}
                 {(!prompt.tags || prompt.tags.length === 0) && <span className="italic">No tags</span>}
              </div>
            </a>
          );
        })}
         {prompts.length === 0 && isAuthenticated && (
            <p className="p-3 text-sm text-light-secondary italic">No prompts found. Click "+ New Prompt" to create one.</p>
        )}
        {prompts.length === 0 && !isAuthenticated && (
            <p className="p-3 text-sm text-light-secondary italic">Log in to see and save your prompts.</p>
        )}
      </nav>
      <div className="p-4 flex gap-2  items-center border-light-top">
        {isAuthenticated ? (
          <button
            onClick={onLogout}
            className="flex-1 flex items-center justify-left text-light-secondary hover:text-light font-medium py-2 px-4 rounded-lg transition duration-150 ease-in-out hover:bg-dark"
          >
            <FaSignOutAlt className="mr-2" /> Logout
          </button>
        ) : (
          <button
            onClick={onLogin}
            className="flex-1 flex items-center justify-left text-light-secondary hover:text-light font-medium py-2 px-4 rounded-lg transition duration-150 ease-in-out hover:bg-dark"
          >
             <FaSignInAlt className="mr-2" /> Login
          </button>
        )}
        <button
          onClick={setShowSettingsModal}
          className="p-2 text-light-secondary hover:text-primary rounded-lg transition duration-150 ease-in-out hover:bg-dark"
          title="Settings"
        >
          <FaCog size={20} />
        </button>
        {isAuthenticated && showSettingsModal && <SettingsModal showSettingsModal={showSettingsModal} setShowSettingsModal={setShowSettingsModal} />}
      </div>
    </aside>
  );
}

export default Sidebar;
