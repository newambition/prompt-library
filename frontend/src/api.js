// src/api.js
// Centralized API functions for backend communication

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Fetch all prompts
export async function fetchPrompts() {
  const res = await fetch(`${API_BASE}/prompts`);
  if (!res.ok) throw new Error('Failed to fetch prompts');
  return res.json();
}

// Create a new prompt
export async function createPrompt(promptData) {
  const res = await fetch(`${API_BASE}/prompts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(promptData),
  });
  if (!res.ok) throw new Error('Failed to create prompt');
  return res.json();
}

// Update notes for a version
export async function updateVersionNotes(promptId, versionId, notes) {
  const res = await fetch(`${API_BASE}/prompts/${promptId}/versions/${versionId}/notes`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notes }),
  });
  if (!res.ok) throw new Error('Failed to update notes');
  return res.json();
}

// Add a tag to a prompt
export async function addTag(promptId, tag) {
  const res = await fetch(`${API_BASE}/prompts/${promptId}/tags`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tag }),
  });
  if (!res.ok) throw new Error('Failed to add tag');
  return res.json();
}

// Remove a tag from a prompt
export async function removeTag(promptId, tag) {
  const res = await fetch(`${API_BASE}/prompts/${promptId}/tags/${encodeURIComponent(tag)}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to remove tag');
  return res.json();
}

// Create a new version for a prompt
export async function createVersion(promptId, versionData) {
  const res = await fetch(`${API_BASE}/prompts/${promptId}/versions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(versionData),
  });
  if (!res.ok) throw new Error('Failed to create version');
  return res.json();
}

// Delete a prompt
export async function deletePrompt(promptId) {
  const res = await fetch(`${API_BASE}/prompts/${promptId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete prompt');
}

// Update a prompt's title or tags
export async function updatePrompt(promptId, updateData) {
  const res = await fetch(`${API_BASE}/prompts/${promptId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateData),
  });
  if (!res.ok) throw new Error('Failed to update prompt');
  return res.json();
} 