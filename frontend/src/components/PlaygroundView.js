// frontend/src/components/PlaygroundView.js
import React, { useState, useEffect } from 'react';

const LOGIN_REQUIRED_FOR_TEST_MESSAGE = "LOGIN_REQUIRED_FOR_TEST"; // Ensure this matches App.js

function PlaygroundView({ prompt, selectedVersionId, onRunTest, onSaveAsNewVersion, isAuthenticated, onLogin }) { // Added isAuthenticated and onLogin
  const [editedPromptText, setEditedPromptText] = useState('');
  const [aiOutput, setAiOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const selectedVersion = prompt?.versions?.[selectedVersionId];

  useEffect(() => {
    setEditedPromptText(selectedVersion?.text || '');
    setAiOutput('');
    setIsLoading(false);
  }, [selectedVersion]);

  const handleRunTest = async () => {
    if (!editedPromptText.trim()) {
        setAiOutput("Please enter some prompt text to test.");
        return;
    }
    setIsLoading(true);
    setAiOutput('Running test...');
    try {
      const result = await onRunTest(editedPromptText); // onRunTest comes from App.js
      if (result === LOGIN_REQUIRED_FOR_TEST_MESSAGE) {
        // Display the custom message and potentially a login button
        setAiOutput(
          <>
            Please <button onClick={onLogin} className="text-blue-500 hover:underline">Login or Create an Account</button> to enter your API Key and run tests.
          </>
        );
      } else {
        setAiOutput(result || 'No output received.');
      }
    } catch (error) {
      console.error("Error running test:", error);
      setAiOutput(`Error: ${error.message || 'Failed to run test.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    if (!isAuthenticated) {
        alert("Please log in to save changes."); // Use the constant from App.js or pass it as prop
        if (onLogin) onLogin(); // Optionally trigger login
        return;
    }
    if (prompt && editedPromptText && editedPromptText !== selectedVersion?.text) {
      onSaveAsNewVersion(prompt.id, editedPromptText);
    } else {
        alert("Prompt text has not been changed or is empty.");
    }
  };

  if (!prompt || !selectedVersionId || !selectedVersion) {
    return (
      <div className="text-center text-gray-500 mt-10">
        Select a prompt and a version from the 'Details' view to start testing.
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      <h3 className="text-lg font-medium text-light">
        Testing: <span className="font-semibold text-secondary">{prompt.title}</span> -{' '}
        <span className="font-semibold text-light-secondary">{selectedVersionId}</span>
      </h3>
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden">
        <div className="flex flex-col bg-surface glass p-6 rounded-xl border border-light overflow-hidden">
          <label htmlFor="editable-prompt" className="block text-sm font-medium text-light-secondary mb-2">
            Edit Prompt:
          </label>
          <textarea
            id="editable-prompt"
            name="editable-prompt"
            value={editedPromptText}
            onChange={(e) => setEditedPromptText(e.target.value)}
            className="flex-1 w-full p-3 border border-light rounded-lg text-sm bg-dark text-light focus:ring-secondary focus:border-secondary resize-none mb-3"
            placeholder="Enter or edit your prompt here..."
          />
          <div className="mt-auto flex justify-between items-center pt-3 border-light-top">
            <button
              onClick={handleRunTest}
              disabled={isLoading || !editedPromptText.trim()}
              className={`btn-secondary font-medium py-2 px-4 rounded-xl transition duration-150 ease-in-out shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm ${isLoading ? 'animate-pulse' : ''}`}
            >
              {isLoading ? 'Running...' : 'Run Test'}
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading || !editedPromptText.trim() || editedPromptText === selectedVersion.text}
              className="btn-accent font-medium py-2 px-4 rounded-xl transition duration-150 ease-in-out shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Save as New Version
            </button>
          </div>
        </div>
        <div className="flex flex-col bg-surface glass p-6 rounded-xl border border-light overflow-hidden">
          <label htmlFor="ai-output" className="block text-sm font-medium text-light-secondary mb-2">
            AI Output:
          </label>
          <div id="ai-output" className="flex-1 w-full p-3 border border-light bg-dark text-light rounded-lg text-sm overflow-y-auto whitespace-pre-wrap break-words">
            {aiOutput || <span className="text-light-tertiary italic">Click 'Run Test' to see the AI output...</span>}
          </div>
        </div>
      </div>
      <div className="bg-surface glass p-6 rounded-xl border border-light mt-4 flex-shrink-0">
        <h4 className="font-semibold mb-2 text-light">Original Prompt ({selectedVersionId}):</h4>
        <pre className="bg-dark p-3 rounded text-sm text-light whitespace-pre-wrap break-words overflow-x-auto border border-light">
          {selectedVersion.text}
        </pre>
      </div>
    </div>
  );
}

export default PlaygroundView;
