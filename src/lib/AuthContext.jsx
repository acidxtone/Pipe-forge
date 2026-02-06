import React, { createContext, useState, useContext, useEffect } from 'react';
import { isSupabaseConfigured } from '@/lib/supabase';
import { createPageUrl } from '@/utils';
import { anonymousSession } from './AnonymousSession';

let apiModule;
if (isSupabaseConfigured) {
  apiModule = await import('@/api/supabaseClient');
} else {
  apiModule = await import('@/api/localClient');
}
const { api } = apiModule;

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings, setAppPublicSettings] = useState(null);
  const [anonymousSessionData, setAnonymousSessionData] = useState(null);

  useEffect(() => {
    const session = anonymousSession.init();
    setAnonymousSessionData(session);
  }, []);

  const checkAppState = async () => {
    try {
      setIsLoadingPublicSettings(true);
      setIsLoadingAuth(true);
      setAuthError(null);
      
      try {
        const currentUser = await api.auth.me();
        if (currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);
          setAppPublicSettings({ id: isSupabaseConfigured ? 'supabase' : 'local', public_settings: {} });
          
          await api.appLogs.logUserInApp();
        } else {
          setUser(null);
          setIsAuthenticated(false);
          setAuthError(null);
          setAppPublicSettings({ id: isSupabaseConfigured ? 'supabase' : 'local', public_settings: {} });
        }
      } catch (authError) {
        setUser(null);
        setIsAuthenticated(false);
        setAuthError(null);
        setAppPublicSettings({ id: isSupabaseConfigured ? 'supabase' : 'local', public_settings: {} });
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
    checkAppState();
    
    if (isSupabaseConfigured && api.auth.onAuthStateChange) {
      const { data: { subscription } } = api.auth.onAuthStateChange(
        async (event, session) => {
          if (event === 'INITIAL_SESSION') {
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
        subscription.unsubscribe();
      };
    }
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
