// frontend/src/auth0-provider-with-history.js
import React from 'react';
import { Auth0Provider } from '@auth0/auth0-react';

// A helper component to handle navigation after login/logout if using React Router.
// For now, we'll keep it simple as full React Router isn't implemented for page navigation.
// If you add React Router later, you'd integrate its history/navigate hook here.
const Auth0ProviderWithHistory = ({ children }) => {
  // Replace with your Auth0 Domain, Client ID, and API Audience (Identifier)
  const domain = process.env.REACT_APP_AUTH0_DOMAIN;
  const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID;
  const audience = process.env.REACT_APP_AUTH0_AUDIENCE; // The Identifier of your Auth0 API

  if (!domain || !clientId) {
    throw new Error(
      "Auth0 domain or client ID not found in environment variables. " +
      "Please ensure REACT_APP_AUTH0_DOMAIN and REACT_APP_AUTH0_CLIENT_ID are set in your .env file."
    );
  }
  if (!audience) {
    console.warn(
      "Auth0 audience not found in environment variables (REACT_APP_AUTH0_AUDIENCE). " +
      "API calls might not be authorized correctly if an audience is required by your Auth0 API settings."
    );
  }

  // This function would be used by Auth0Provider to redirect after login.
  // If using React Router v6:
  // import { useNavigate } from 'react-router-dom';
  // const navigate = useNavigate();
  // const onRedirectCallback = (appState) => {
  //   navigate(appState?.returnTo || window.location.pathname);
  // };
  // For now, a simple redirect to the origin is fine.
  const onRedirectCallback = (appState) => {
    window.history.replaceState(
      {},
      document.title,
      appState?.returnTo || window.location.pathname
    );
  };


  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin, // Or your specific callback URL like http://localhost:3000
        audience: audience, // Crucial for getting an Access Token for your API
        // scope: "openid profile email read:prompts" // Optional: request specific scopes
      }}
      onRedirectCallback={onRedirectCallback} // Handles redirect after login
    >
      {children}
    </Auth0Provider>
  );
};

export default Auth0ProviderWithHistory;
