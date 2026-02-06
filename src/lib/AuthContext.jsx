import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);

  const fetchUser = useCallback(async () => {
    try {
      setIsLoadingAuth(true);
      const response = await fetch('/api/auth/user', { credentials: 'include' });

      if (response.status === 401) {
        setUser(null);
        setIsAuthenticated(false);
        setAuthError(null);
        return null;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }

      const userData = await response.json();

      const userObj = {
        id: userData.id,
        email: userData.email,
        full_name: userData.fullName || [userData.firstName, userData.lastName].filter(Boolean).join(' ') || userData.email,
        first_name: userData.firstName,
        last_name: userData.lastName,
        profile_image_url: userData.profileImageUrl,
        selected_year: userData.selectedYear || null,
        role: 'user',
      };

      setUser(userObj);
      setIsAuthenticated(true);
      setAuthError(null);
      return userObj;
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setIsAuthenticated(false);
      setAuthError(null);
      return null;
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const signIn = async (email, password) => {
    try {
      setAuthError(null);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setAuthError({ type: 'auth_failed', message: data.message });
        return { success: false, message: data.message };
      }

      const userObj = await fetchUser();
      return { success: true, user: userObj };
    } catch (error) {
      const message = error.message || 'Sign in failed';
      setAuthError({ type: 'auth_failed', message });
      return { success: false, message };
    }
  };

  const signUp = async (email, password, fullName, securityQuestion, securityAnswer) => {
    try {
      setAuthError(null);
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, fullName, securityQuestion, securityAnswer }),
      });

      const data = await response.json();

      if (!response.ok) {
        setAuthError({ type: 'signup_failed', message: data.message });
        return { success: false, message: data.message };
      }

      const userObj = await fetchUser();
      return { success: true, user: userObj };
    } catch (error) {
      const message = error.message || 'Sign up failed';
      setAuthError({ type: 'signup_failed', message });
      return { success: false, message };
    }
  };

  const updateMe = async (data) => {
    try {
      const response = await fetch('/api/auth/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          selectedYear: data.selected_year,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      const userData = await response.json();

      setUser(prev => prev ? {
        ...prev,
        selected_year: userData.selectedYear || prev.selected_year,
      } : prev);

      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (_) {}
    setUser(null);
    setIsAuthenticated(false);
  };

  const navigateToLogin = () => {};

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings: false,
      authError,
      appPublicSettings: { id: 'custom', public_settings: {} },
      anonymousSessionData: null,
      logout,
      navigateToLogin,
      checkAppState: fetchUser,
      signIn,
      signUp,
      updateMe,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
