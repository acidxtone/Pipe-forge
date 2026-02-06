import React, { createContext, useState, useContext, useEffect } from 'react';
import { api } from '@/api/supabaseClient';
import { createPageUrl } from '@/utils';
import { anonymousSession } from './AnonymousSession';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings, setAppPublicSettings] = useState(null);
  const [anonymousSessionData, setAnonymousSessionData] = useState(null);

  console.log('AuthProvider: Initializing...');

  // Initialize anonymous session on mount
  useEffect(() => {
    const session = anonymousSession.init();
    setAnonymousSessionData(session);
    console.log('Anonymous session initialized:', session.id);
  }, []);

  const checkAppState = async () => {
    try {
      setIsLoadingPublicSettings(true);
      setIsLoadingAuth(true);
      setAuthError(null);
      
      // Check if user is authenticated (optional - app works without auth)
      try {
        const currentUser = await api.auth.me();
        if (currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);
          setAppPublicSettings({ id: 'supabase', public_settings: {} });
          
          // Log user activity
          await api.appLogs.logUserInApp();
        } else {
          // User not authenticated - this is fine, continue with anonymous session
          setUser(null);
          setIsAuthenticated(false);
          setAuthError(null);
          setAppPublicSettings({ id: 'supabase', public_settings: {} });
        }
      } catch (authError) {
        // User is not authenticated - this is normal for anonymous usage
        console.log('User not authenticated - continuing with anonymous session');
        setUser(null);
        setIsAuthenticated(false);
        setAuthError(null);
        setAppPublicSettings({ id: 'supabase', public_settings: {} });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setAuthError({ type: 'unknown', message: error.message || 'An unexpected error occurred' });
    } finally {
      setIsLoadingPublicSettings(false);
      setIsLoadingAuth(false);
    }
  };

  useEffect(() => {
    console.log('AuthProvider: Starting checkAppState...');
    checkAppState();
    
    // Set up auth state listener
    const { data: { subscription } } = api.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthProvider: Auth state changed:', event);
        
        // Ignore INITIAL_SESSION event to prevent re-initialization loop
        if (event === 'INITIAL_SESSION') {
          console.log('AuthProvider: Ignoring INITIAL_SESSION event');
          return;
        }
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          try {
            const currentUser = await api.auth.me();
            setUser(currentUser);
            setIsAuthenticated(true);
            setAuthError(null);
          } catch (error) {
            console.error('Auth state change error:', error);
            setAuthError({ type: 'unknown', message: error.message || 'Authentication error' });
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAuthenticated(false);
          setAuthError(null);
        }
        setIsLoadingAuth(false);
      }
    );

    return () => {
      console.log('AuthProvider: Cleaning up subscription...');
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    try {
      setAuthError(null);
      const result = await api.auth.signIn(email, password);
      
      if (result.user) {
        const currentUser = await api.auth.me();
        setUser(currentUser);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        setAuthError({ type: 'auth_failed', message: result.error || 'Sign in failed' });
        return { success: false, message: result.error || 'Sign in failed' };
      }
    } catch (error) {
      const message = error.message || 'Sign in failed';
      setAuthError({ type: 'auth_failed', message });
      return { success: false, message };
    }
  };

  const signInWithMagicLink = async (email) => {
    try {
      setAuthError(null);
      const result = await api.auth.signInWithMagicLink(email);
      
      return { 
        success: true, 
        message: 'Magic link sent! Check your email to continue.' 
      };
    } catch (error) {
      const message = error.message || 'Failed to send magic link';
      setAuthError({ type: 'auth_failed', message });
      return { success: false, message };
    }
  };

  const signUp = async (email, password, fullName) => {
    try {
      setAuthError(null);
      const result = await api.auth.signUp(email, password, fullName);
      
      if (result.user) {
        return { success: true, message: 'Account created! You can now sign in.' };
      } else {
        setAuthError({ type: 'signup_failed', message: result.error || 'Sign up failed' });
        return { success: false, message: result.error || 'Sign up failed' };
      }
    } catch (error) {
      const message = error.message || 'Sign up failed';
      setAuthError({ type: 'signup_failed', message });
      return { success: false, message };
    }
  };

  const logout = (shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);
    api.auth.logout();
    if (shouldRedirect) {
      window.location.reload();
    }
  };

  const navigateToLogin = () => {
    // Don't use window.location.href as it causes full page reload
    // Instead, component will handle the navigation
    console.log('navigateToLogin called - component should handle navigation');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      anonymousSessionData,
      logout,
      navigateToLogin,
      checkAppState,
      signIn,
      signInWithMagicLink,
      signUp
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
