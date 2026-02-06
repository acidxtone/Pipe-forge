import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { api } from '@/api/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [session, setSession] = useState(null);

  const fetchUser = useCallback(async () => {
    try {
      setIsLoadingAuth(true);
      const userData = await api.auth.getUser();

      if (!userData) {
        setUser(null);
        setIsAuthenticated(false);
        setSession(null);
        setAuthError(null);
        return null;
      }

      // Get user profile data
      let profileData = {};
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userData.id)
          .single();
        
        if (profile) {
          profileData = profile;
        }
      } catch (profileError) {
        console.warn('Profile fetch failed:', profileError);
      }

      const userObj = {
        id: userData.id,
        email: userData.email,
        full_name: profileData.full_name || userData.user_metadata?.full_name || userData.email,
        first_name: profileData.first_name || userData.user_metadata?.first_name,
        last_name: profileData.last_name || userData.user_metadata?.last_name,
        profile_image_url: userData.user_metadata?.avatar_url,
        selected_year: profileData.selected_year || 1,
        security_question: profileData.security_question,
        role: 'user',
      };

      setUser(userObj);
      setIsAuthenticated(true);
      setSession(userData);
      setAuthError(null);
      return userObj;
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setIsAuthenticated(false);
      setSession(null);
      setAuthError(null);
      return null;
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  useEffect(() => {
    // Initial auth check
    fetchUser();

    // Listen for auth changes
    const { data: { subscription } } = api.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (event === 'SIGNED_IN' && session) {
        await fetchUser();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAuthenticated(false);
        setSession(null);
        setAuthError(null);
      } else if (event === 'TOKEN_REFRESHED') {
        setSession(session);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchUser]);

  const signIn = useCallback(async (email, password) => {
    try {
      setAuthError(null);
      const result = await api.auth.signIn(email, password);
      
      if (result.session) {
        await fetchUser();
        return { success: true, user: result.user };
      } else {
        throw new Error('Sign in failed');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setAuthError({ type: 'signin', message: error.message });
      return { success: false, error: error.message };
    }
  }, [fetchUser]);

  const signUp = useCallback(async (email, password, userData = {}) => {
    try {
      setAuthError(null);
      const result = await api.auth.signUp(email, password, userData);
      
      if (result.needsVerification) {
        return { success: true, needsVerification: true };
      } else if (result.session) {
        await fetchUser();
        return { success: true, user: result.user };
      } else {
        throw new Error('Sign up failed');
      }
    } catch (error) {
      console.error('Sign up error:', error);
      setAuthError({ type: 'signup', message: error.message });
      return { success: false, error: error.message };
    }
  }, [fetchUser]);

  const signOut = useCallback(async () => {
    try {
      await api.auth.signOut();
      setUser(null);
      setIsAuthenticated(false);
      setSession(null);
      setAuthError(null);
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: error.message };
    }
  }, []);

  const updateProfile = useCallback(async (updates) => {
    try {
      const updatedProfile = await api.auth.updateMe(updates);
      
      // Update local user state
      setUser(prev => ({
        ...prev,
        ...updatedProfile
      }));
      
      return { success: true, profile: updatedProfile };
    } catch (error) {
      console.error('Update profile error:', error);
      setAuthError({ type: 'profile', message: error.message });
      return { success: false, error: error.message };
    }
  }, []);

  const resetPassword = useCallback(async (email, securityAnswer, newPassword) => {
    try {
      setAuthError(null);
      await api.auth.resetPassword(email, securityAnswer, newPassword);
      return { success: true };
    } catch (error) {
      console.error('Reset password error:', error);
      setAuthError({ type: 'reset', message: error.message });
      return { success: false, error: error.message };
    }
  }, []);

  const clearError = useCallback(() => {
    setAuthError(null);
  }, []);

  const value = {
    user,
    session,
    isAuthenticated,
    isLoadingAuth,
    authError,
    signIn,
    signUp,
    signOut,
    updateProfile,
    resetPassword,
    clearError,
    fetchUser
  };

  return (
    <AuthContext.Provider value={value}>
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
