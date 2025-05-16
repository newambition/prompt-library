// frontend/src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import Auth0ProviderWithHistory from './auth0-provider-with-history'; // Import the provider

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Auth0ProviderWithHistory> {/* Wrap App with the Auth0 provider */}
      <App />
    </Auth0ProviderWithHistory>
  </React.StrictMode>
);

reportWebVitals();
