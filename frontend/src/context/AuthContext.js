// frontend/src/context/AuthContext.js
import React, { createContext, useState, useCallback, useContext, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { getUserProfile as apiGetUserProfile } from '../api'; // Assuming api.js is in src

const AuthContext = createContext(null);

export const useAuthContext = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const {
    isLoading: auth0IsLoading, // Renamed to avoid clash if we have our own isLoading
    isAuthenticated,
    user: auth0User, // Renamed to avoid clash with our userProfile?.user
    loginWithRedirect,
    logout: auth0Logout,
    getAccessTokenSilently,
  } = useAuth0();

  const [userProfile, setUserProfile] = useState(null);
  const [userProfileLoading, setUserProfileLoading] = useState(false);
  const [userProfileError, setUserProfileError] = useState(null);

  const getAuthToken = useCallback(async () => {
    if (!isAuthenticated) return null;
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: process.env.REACT_APP_AUTH0_AUDIENCE,
        },
      });
      return token;
    } catch (e) {
      console.error("Error getting access token from AuthContext", e);
      if (e.error === 'login_required' || e.error === 'consent_required') {
        // It might be better to let the component calling getAuthToken decide to redirect
        // or handle this, rather than AuthContext doing it directly.
        // For now, logging, but not redirecting from here.
      }
      throw e; // Re-throw to allow caller to handle
    }
  }, [getAccessTokenSilently, isAuthenticated]);

  const loadUserProfile = useCallback(async () => {
    if (!isAuthenticated) {
      setUserProfile(null);
      setUserProfileLoading(false);
      setUserProfileError(null);
      return null;
    }
    setUserProfileLoading(true);
    setUserProfileError(null);
    try {
      const token = await getAuthToken(); // Use the context's getAuthToken
      if (!token) {
        setUserProfileLoading(false);
        setUserProfileError("Authentication token not available.");
        return null;
      }
      const profile = await apiGetUserProfile(token);
      setUserProfile(profile);
      return profile;
    } catch (err) {
      console.error('Failed to load user profile in AuthContext:', err.message);
      setUserProfileError(`Failed to load user profile: ${err.message}`);
      setUserProfile(null); // Clear profile on error
      return null;
    } finally {
      setUserProfileLoading(false);
    }
  }, [isAuthenticated, getAuthToken]); // getAuthToken is now a dependency

  // Effect to load user profile when authentication status changes
  useEffect(() => {
    if (isAuthenticated && !auth0IsLoading) {
      loadUserProfile();
    } else if (!isAuthenticated && !auth0IsLoading) {
      // Clear profile if user logs out or was never authenticated
      setUserProfile(null);
      setUserProfileError(null);
    }
  }, [isAuthenticated, auth0IsLoading, loadUserProfile]);


  // Custom logout that might include app-specific cleanup before Auth0 logout
  const logout = useCallback((options) => {
    // Add any app-specific cleanup here if needed
    setUserProfile(null); // Clear profile on logout
    setUserProfileError(null);
    auth0Logout(options);
  }, [auth0Logout]);

  const value = {
    isAuthenticated,
    user: auth0User, // This is the Auth0 user object
    authIsLoading: auth0IsLoading,
    loginWithRedirect,
    logout, // Use our wrapped logout
    getAuthToken,
    userProfile, // This is our backend user profile
    userProfileLoading,
    userProfileError,
    loadUserProfile, // Expose function to reload profile if needed
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
