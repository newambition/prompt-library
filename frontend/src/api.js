// frontend/src/api.js
// Centralized API functions for backend communication

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Helper to create headers, including Authorization if token is provided
const createHeaders = (token) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Fetch all prompts
export async function fetchPrompts(token) {
  const res = await fetch(`${API_BASE}/prompts`, {
    headers: createHeaders(token),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(`Failed to fetch prompts: ${errorData.detail || res.statusText}`);
  }
  return res.json();
}

// Create a new prompt
export async function createPrompt(promptData, token) {
  const res = await fetch(`${API_BASE}/prompts`, {
    method: 'POST',
    headers: createHeaders(token),
    body: JSON.stringify(promptData),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(`Failed to create prompt: ${errorData.detail || res.statusText}`);
  }
  return res.json();
}

// Update notes for a version
export async function updateVersionNotes(promptId, versionIdStr, notes, token) {
  const res = await fetch(`${API_BASE}/prompts/${promptId}/versions/${versionIdStr}/notes`, {
    method: 'PUT',
    headers: createHeaders(token),
    body: JSON.stringify({ notes }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(`Failed to update notes: ${errorData.detail || res.statusText}`);
  }
  return res.json();
}

// Add a tag to a prompt
export async function addTag(promptId, tagData, token) {
  const res = await fetch(`${API_BASE}/prompts/${promptId}/tags`, {
    method: 'POST',
    headers: createHeaders(token),
    body: JSON.stringify(tagData),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(`Failed to add tag: ${errorData.detail || res.statusText}`);
  }
  return res.json();
}

// Remove a tag from a prompt by name
export async function removeTag(promptId, tagName, token) {
  const res = await fetch(`${API_BASE}/prompts/${promptId}/tags/${encodeURIComponent(tagName)}`, {
    method: 'DELETE',
    headers: createHeaders(token),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(`Failed to remove tag: ${errorData.detail || res.statusText}`);
  }
  return res.json();
}

// Create a new version for a prompt
export async function createVersion(promptId, versionData, token) {
  const res = await fetch(`${API_BASE}/prompts/${promptId}/versions`, {
    method: 'POST',
    headers: createHeaders(token),
    body: JSON.stringify(versionData),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(`Failed to create version: ${errorData.detail || res.statusText}`);
  }
  return res.json();
}

// Delete a prompt
export async function deletePrompt(promptId, token) {
  const res = await fetch(`${API_BASE}/prompts/${promptId}`, {
    method: 'DELETE',
    headers: createHeaders(token),
  });
  if (!res.ok && res.status !== 204) {
    const errorData = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(`Failed to delete prompt: ${errorData.detail || res.statusText}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

// Update a prompt's title or tags
export async function updatePrompt(promptId, updateData, token) {
  const res = await fetch(`${API_BASE}/prompts/${promptId}`, {
    method: 'PUT',
    headers: createHeaders(token),
    body: JSON.stringify(updateData),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(`Failed to update prompt: ${errorData.detail || res.statusText}`);
  }
  return res.json();
}

// Run a prompt in the playground
export async function runPlaygroundTest(promptText, llmProvider, modelId, token) {
  // userApiKey from localStorage is not needed here as the backend uses its own key for Phase 1
  // If the backend were to use a user-provided key, it would be passed in the body or a specific header,
  // but the primary Authorization header should still be the Auth0 Access Token.
  const payload = {
    prompt_text: promptText,
    llm_provider: llmProvider,
    model_id: modelId,
  };
  const res = await fetch(`${API_BASE}/playground/test`, {
    method: 'POST',
    headers: createHeaders(token), // Secure this call to your backend
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: `Request failed with status ${res.status}` }));
    throw new Error(errorData.detail || `Playground test failed: ${res.statusText}`);
  }
  return res.json();
}

// Fetch user's configured API keys
export async function getUserApiKeys(token) {
  const res = await fetch(`${API_BASE}/user/api-keys`, {
    method: 'GET',
    headers: createHeaders(token),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(`Failed to fetch user API keys: ${errorData.detail || res.statusText}`);
  }
  return res.json();
}

// Add a new API key for the user
export async function addUserApiKey(token, llm_provider, api_key_plain) {
  const payload = { llm_provider, api_key_plain };
  const res = await fetch(`${API_BASE}/user/api-keys`, {
    method: 'POST',
    headers: createHeaders(token),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(`Failed to add API key: ${errorData.detail || res.statusText}`);
  }
  return res.json(); // Assuming the backend returns the newly created key (or some confirmation)
}

// Update an existing API key for the user
export async function updateUserApiKey(token, llm_provider, new_api_key_plain) {
  const payload = { new_api_key_plain }; // Backend expects new_api_key_plain in the body
  const res = await fetch(`${API_BASE}/user/api-keys/${encodeURIComponent(llm_provider)}`, {
    method: 'PUT',
    headers: createHeaders(token),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(`Failed to update API key for ${llm_provider}: ${errorData.detail || res.statusText}`);
  }
  return res.json(); // Assuming the backend returns the updated key (or some confirmation)
}

// Delete an API key for the user by its ID
export async function deleteUserApiKey(token, apiKeyId) {
  const res = await fetch(`${API_BASE}/user/api-keys/${encodeURIComponent(apiKeyId)}`, { // Endpoint expects key ID or provider name
    method: 'DELETE',
    headers: createHeaders(token),
  });
  if (!res.ok && res.status !== 204) { // 204 No Content is a success for DELETE
    const errorData = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(`Failed to delete API key: ${errorData.detail || res.statusText}`);
  }
  return null; // For 204 responses, typically we return null or undefined
}

// Mark that the user has seen the paywall/tier selection modal
export async function markPaywallModalSeen(token) {
  const res = await fetch(`${API_BASE}/user/paywall-modal-seen`, {
    method: 'PUT',
    headers: createHeaders(token),
  });
  if (!res.ok && res.status !== 204) {
    const errorData = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(`Failed to update paywall modal preference: ${errorData.detail || res.statusText}`);
  }
  return null; // 204 No Content response
}

// Get user profile data including tier and preferences
export async function getUserProfile(token) {
  const res = await fetch(`${API_BASE}/user/profile`, {
    headers: createHeaders(token),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(`Failed to fetch user profile: ${errorData.detail || res.statusText}`);
  }
  return res.json();
}

// Create Stripe checkout session for subscription upgrade
export async function createCheckoutSession(priceId, successUrl, cancelUrl, token) {
  const payload = {
    price_id: priceId,
    success_url: successUrl,
    cancel_url: cancelUrl
  };
  const res = await fetch(`${API_BASE}/billing/create-checkout-session`, {
    method: 'POST',
    headers: createHeaders(token),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(`Failed to create checkout session: ${errorData.detail || res.statusText}`);
  }
  return res.json();
}