// frontend/src/components/Sidebar.js
import React, { useState, useRef, useEffect } from 'react';
import { FaCog, FaSignInAlt, FaSignOutAlt, FaUserCircle, FaBars, FaTimes, FaLayerGroup } from 'react-icons/fa';
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
  userProfile,
  onLogin,
  onLogout,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  onShowTemplates, // New prop for showing templates
  showTierSelectionModal, // New prop to hide hamburger when tier modal is open
  onShowTierModal // New prop to open tier selection modal
}) 
{
  const [showUserPopout, setShowUserPopout] = useState(false);
  const popoutRef = useRef(null);

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  const handleAvatarClick = () => {
    setShowUserPopout(!showUserPopout);
  };

  const handleLogoutFromPopout = () => {
    setShowUserPopout(false);
    onLogout();
  };

  const handleSettingsFromPopout = () => {
    setShowUserPopout(false);
    setShowSettingsModal();
  };

  // Close popout when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoutRef.current && !popoutRef.current.contains(event.target)) {
        setShowUserPopout(false);
      }
    };

    if (showUserPopout) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserPopout]);

  // Get user tier from backend user profile instead of Auth0 user object
  const userTier = userProfile?.tier || 'free'; // Default to free (lowercase) if not available

  return (
    <>
      {/* Mobile Hamburger Button */}
      {!showTierSelectionModal && (
        <button
          onClick={handleMobileMenuToggle}
          className="block sm:hidden fixed top-4 right-4 z-[999] p-1.5 bg-card border border-light rounded-lg text-light hover:text-primary transition-colors duration-200"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
      )}

      {/* Mobile Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div
          className="sm:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={handleMobileMenuClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        w-1/4 md:w-1/5 bg-card border-light-right flex flex-col h-screen text-light
        sm:relative sm:translate-x-0 
        ${isMobileMenuOpen 
          ? 'fixed top-0 left-0 z-50 w-4/5 transform translate-x-0 transition-transform duration-300 ease-in-out' 
          : 'fixed top-0 left-0 z-50 w-4/5 transform -translate-x-full transition-transform duration-300 ease-in-out sm:transform-none'
        }
        sm:w-1/4 md:w-1/5 
      `}>
        {/* Header Section: This part remains at the top */}
        <div className="p-4 border-light-bottom mb-3">
          <div className="flex flex-col mb-5">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-light relative" style={{lineHeight: '1.2'}}>
                My Prompts
                <span className="block h-0.5 w-8 mt-1 rounded bg-secondary absolute left-0 -bottom-2"></span>
              </h2>
              <div className="flex items-center mt-1 gap-2 relative" ref={popoutRef}>
                {isAuthenticated && user?.picture && (
                  <button
                    onClick={handleAvatarClick}
                    className="focus:outline-none focus:ring-2 focus:ring-primary rounded-full"
                  >
                    <img 
                      src={user.picture} 
                      alt={user.name || 'User'} 
                      className="w-8 h-8 rounded-full border-2 border-primary cursor-pointer hover:border-secondary transition-colors" 
                    />
                  </button>
                )}
                {isAuthenticated && !user?.picture && user?.name && (
                  <button
                    onClick={handleAvatarClick}
                    className="flex items-center text-sm text-light-secondary cursor-pointer hover:text-light transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded"
                    title={user.name}
                  >
                    <FaUserCircle size={24} className="mr-2 text-primary hover:text-secondary transition-colors" />
                      <span className="truncate max-w-[100px]">{user.name.split('@')[0]}</span>
                  </button>
                )}
                
                {/* User Popout */}
                {showUserPopout && isAuthenticated && (
                  <div className={`
                    absolute top-9 z-50 w-48 bg-surface border border-light rounded-lg shadow-lg py-2
                    sm:left-10 sm:right-0
                    right-0 left-auto
                  `}>
                    {/* Tier Display */}
                    <div className="px-4 py-2">
                      <span className="text-xs md:text-base text-light-secondary">Tier:</span>
                      <span className={`ml-2 text-xs sm:text-sm font-semibold ${userTier === 'pro' ? 'text-secondary  ' : 'text-light'}`}>
                        {userTier === 'pro' ? 'Pro' : 'Free'}
                      </span>
                    </div>
                    
                    {/* Settings Button */}
                    <button
                      onClick={handleSettingsFromPopout}
                      className="w-full flex items-center px-4 py-2 text-light-secondary hover:text-light hover:bg-surface transition-colors duration-150 text-left text-xs sm:text-sm"
                    >
                      <FaCog className="mr-3" size={16} />
                      Settings
                    </button>
                    
                    {/* Logout Button */}
                    <button
                      onClick={handleLogoutFromPopout}
                      className="w-full flex items-center px-4 py-2 text-light-secondary hover:text-light hover:bg-surface transition-colors text-left text-xs sm:text-sm"
                    >
                      <FaSignOutAlt className="mr-3" size={16} />
                      Logout
                    </button>
                   </div>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onAddNewPrompt}
            className="w-full btn-primary font-medium py-3 px-4 rounded-xl transition duration-150 ease-in-out shadow-md text-xs mt-2 mb-2"
            style={{minHeight: '44px'}}
          >
            + New Prompt
          </button>
          <button
            onClick={() => {
              onShowTemplates();
              handleMobileMenuClose(); // Close mobile menu when templates is clicked
            }}
            className="w-full btn-secondary font-medium py-3 px-4 rounded-xl transition duration-150 ease-in-out shadow-md text-xs mb-2 flex items-center justify-center"
            style={{minHeight: '44px'}}
          >
            <FaLayerGroup className="mr-2" size={14} />
            Templates
          </button>
          <div className="mt-4"></div>
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

        {/* Scrollable Prompt List Section */}
        <nav className="flex-1 overflow-y-auto min-h-0 prompt-list p-2 space-y-3">
          {prompts.map((prompt) => {
            const isSelected = prompt.id === selectedPromptId;
            return (
              <a
                key={prompt.id}
                href={`/prompt/${prompt.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  onSelectPrompt(prompt.id);
                  // Close mobile menu when selecting a prompt
                  handleMobileMenuClose();
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

        {/* Footer Section: This part remains at the bottom */}
        <div className="p-1 flex gap-2 items-center border-light-top bg-card">
          {!isAuthenticated ? (
            <button
              onClick={onLogin}
              className="flex-1 flex items-center justify-center text-light-secondary hover:text-light font-medium py-2 px-4 rounded-lg transition duration-150 ease-in-out hover:bg-dark"
            >
               <FaSignInAlt className="mr-2" /> Login
            </button>
          ) : (
            <>
              {/* Free Tier: Upgrade Badge with Usage Indicator */}
              {userTier === 'free' && (
                <div className="flex-1">
                  <div 
                    className="w-full flex flex-col sm:flex-row items-center justify-center p-2 rounded-lg bg-gradient-to-r from-orange-500/20 to-accent/20 border border-accent/30 cursor-pointer hover:from-orange-500/30 hover:to-accent/30 transition-all duration-200"
                    onClick={onShowTierModal}
                  >
                    <span className="text-accent font-semibold text-sm">Upgrade to Pro</span>
                    {/* Show usage warning when close to limit (20 - prompts.length <= 5) */}
                    {prompts.length >= 15 && (
                      <span className="text-xs text-light-secondary sm:ml-2 mt-1 sm:mt-0">
                        {20 - prompts.length} Free Prompts Remaining
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Pro Tier: Premium Badge */}
              {userTier === 'pro' && (
                <div 
                  className="flex-1 flex items-center justify-center p-2 rounded-lg bg-gradient-to-r from-secondary/20 to-primary/20 border border-secondary/50 cursor-pointer hover:from-secondary/30 hover:to-primary/30 transition-all duration-200"
                  onClick={() => {/* Will add subscription management logic later */}}
                >
                  <span className="text-secondary font-bold text-sm tracking-wide">✨ PRO TIER ✨</span>
                </div>
              )}
            </>
          )}
        </div>
      </aside>
    </>
  );
}

export default Sidebar;