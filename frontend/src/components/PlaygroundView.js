// src/components/PlaygroundView.js
import React, { useState, useEffect } from 'react';

/**
 * PlaygroundView component for editing and testing prompts side-by-side.
 * @param {object} props - Component props.
 * @param {object|null} props.prompt - The currently selected prompt object.
 * @param {string|null} props.selectedVersionId - The ID of the currently selected version.
 * @param {Function} props.onRunTest - Callback function to execute the prompt test.
 * @param {Function} props.onSaveAsNewVersion - Callback function to save the edited prompt as a new version.
 */
function PlaygroundView({ prompt, selectedVersionId, onRunTest, onSaveAsNewVersion }) {
  const [editedPromptText, setEditedPromptText] = useState('');
  const [aiOutput, setAiOutput] = useState(''); // State to hold AI output
  const [isLoading, setIsLoading] = useState(false); // State for loading indicator

  // Find the selected version object
  const selectedVersion = prompt?.versions?.[selectedVersionId];

  // Update the editable prompt text when the selected version changes
  useEffect(() => {
    setEditedPromptText(selectedVersion?.text || '');
    setAiOutput(''); // Clear previous output when version changes
    setIsLoading(false); // Reset loading state
  }, [selectedVersion]);

  // Handler for the 'Run Test' button
  const handleRunTest = async () => {
    if (!editedPromptText) return;
    setIsLoading(true);
    setAiOutput('Running test...'); // Placeholder message
    try {
      // Simulate API call or call the actual test function
      const result = await onRunTest(editedPromptText); // Assume onRunTest returns the AI output
      setAiOutput(result || 'No output received.'); // Display result or fallback message
    } catch (error) {
      console.error("Error running test:", error);
      setAiOutput(`Error: ${error.message || 'Failed to run test.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for the 'Save as New Version' button
  const handleSave = () => {
    if (prompt && editedPromptText && editedPromptText !== selectedVersion?.text) {
      onSaveAsNewVersion(prompt.id, editedPromptText);
      // Optional: Provide feedback to the user (e.g., confirmation message)
      // Maybe switch back to details view or update version list?
    } else {
        // Optional: Notify user that text hasn't changed or prompt is empty
        alert("Prompt text has not been changed or is empty.");
    }
  };

  // If no prompt/version is selected, show placeholder
  if (!prompt || !selectedVersionId || !selectedVersion) {
    return (
      <div className="text-center text-gray-500 mt-10">
        Select a prompt and a version from the 'Details' view to start testing.
      </div>
    );
  }

  // Render the playground content
  return (
    <div className="h-full flex flex-col space-y-4">
      <h3 className="text-lg font-medium">
        Testing: <span className="font-semibold">{prompt.title}</span> -{' '}
        <span className="font-semibold">{selectedVersionId}</span>
      </h3>
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden">
        {/* Left Side: Editing Area */}
        <div className="flex flex-col bg-white p-4 rounded-lg border border-gray-200 overflow-hidden">
          <label htmlFor="editable-prompt" className="block text-sm font-medium text-gray-700 mb-2">
            Edit Prompt:
          </label>
          <textarea
            id="editable-prompt"
            name="editable-prompt"
            value={editedPromptText}
            onChange={(e) => setEditedPromptText(e.target.value)}
            className="flex-1 w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 resize-none mb-3"
            placeholder="Enter or edit your prompt here..."
          />
          <div className="mt-auto flex justify-between items-center pt-3 border-t border-gray-200"> {/* Ensure buttons are at bottom */}
            <button
              onClick={handleRunTest}
              disabled={isLoading || !editedPromptText.trim()} // Disable if loading or empty
              className={`bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed ${isLoading ? 'animate-pulse' : ''}`}
            >
              {isLoading ? 'Running...' : 'Run Test'}
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading || !editedPromptText.trim() || editedPromptText === selectedVersion.text} // Disable if loading, empty, or unchanged
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save as New Version
            </button>
          </div>
        </div>

        {/* Right Side: AI Output Area */}
        <div className="flex flex-col bg-white p-4 rounded-lg border border-gray-200 overflow-hidden">
          <label htmlFor="ai-output" className="block text-sm font-medium text-gray-700 mb-2">
            AI Output:
          </label>
          {/* Use 'pre' for potentially formatted AI output */}
          <pre id="ai-output" className="flex-1 w-full p-2 border border-gray-200 bg-gray-50 rounded-md text-sm overflow-y-auto whitespace-pre-wrap break-words">
            {aiOutput || <span className="text-gray-400 italic">Click 'Run Test' to see the AI output...</span>}
          </pre>
        </div>
      </div>

      {/* Comparison Area (Original Prompt) */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mt-4 flex-shrink-0"> {/* Prevent shrinking */}
        <h4 className="font-semibold mb-2">Original Prompt ({selectedVersionId}):</h4>
        <pre className="bg-gray-100 p-3 rounded text-sm whitespace-pre-wrap break-words overflow-x-auto">
          {selectedVersion.text}
        </pre>
      </div>
    </div>
  );
}

export default PlaygroundView;
