/**
 * Supabase API Client for TradeBench
 * Replaces localClient.js with Supabase integration
 * Maintains all existing functionality and API structure
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration. Please check environment variables.');
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Storage keys for backward compatibility
const STORAGE_KEYS = {
  selectedYear: 'tradebench_selected_year',
  userProgress: 'tradebench_user_progress',
};

function progressKey(year) {
  return year ? `tradebench_user_progress_y${year}` : STORAGE_KEYS.userProgress;
}

// Main API client - maintains exact same interface as localClient
export const api = {
  // Authentication - replaces custom auth with Supabase Auth
  auth: {
    async signUp(email, password, options = {}) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: options.fullName,
              security_question: options.securityQuestion,
              security_answer: options.securityAnswer,
            }
          }
        });

        if (error) throw error;

        // Create profile if user was created
        if (data.user && !data.session) {
          // User created but email verification required
          return { user: data.user, session: null, needsVerification: true };
        }

        return { user: data.user, session: data.session, needsVerification: false };
      } catch (error) {
        console.error('Sign up error:', error);
        throw error;
      }
    },

    async signIn(email, password) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;

        return { user: data.user, session: data.session };
      } catch (error) {
        console.error('Sign in error:', error);
        throw error;
      }
    },

    async signOut() {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        return true;
      } catch (error) {
        console.error('Sign out error:', error);
        throw error;
      }
    },

    async getUser() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        return user;
      } catch (error) {
        console.error('Get user error:', error);
        return null;
      }
    },

    async updateMe(updates) {
      try {
        const user = await this.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', user.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Update profile error:', error);
        throw error;
      }
    },

    async resetPassword(email, securityAnswer, newPassword) {
      try {
        // Get user by email
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('id, security_answer')
          .eq('email', email.toLowerCase())
          .single();

        if (error || !profiles) {
          throw new Error('User not found');
        }

        // Verify security answer (case-insensitive)
        const { data: isValid } = await supabase.rpc('verify_security_answer', {
          p_user_id: profiles.id,
          p_answer: securityAnswer.toLowerCase()
        });

        if (!isValid) {
          throw new Error('Invalid security answer');
        }

        // Update password
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          profiles.id,
          { password: newPassword }
        );

        if (updateError) throw updateError;
        return true;
      } catch (error) {
        console.error('Reset password error:', error);
        throw error;
      }
    },

    // Session management
    onAuthStateChange(callback) {
      return supabase.auth.onAuthStateChange(callback);
    }
  },

  // Questions - replaces JSON file reading with database queries
  questions: {
    async getAll(year = null, section = null, difficulty = null) {
      try {
        let query = supabase
          .from('questions')
          .select('*')
          .order('year, section');

        if (year) {
          query = query.eq('year', year);
        }
        if (section) {
          query = query.eq('section', section);
        }
        if (difficulty) {
          query = query.eq('difficulty', difficulty);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Get questions error:', error);
        return [];
      }
    },

    async getByYear(year) {
      return this.getAll(year);
    },

    async getBySection(year, section) {
      return this.getAll(year, section);
    },

    async getById(id) {
      try {
        const { data, error } = await supabase
          .from('questions')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Get question by ID error:', error);
        return null;
      }
    }
  },

  // Study Guides - replaces JSON file reading with database queries
  studyGuides: {
    async getAll(year = null, section = null) {
      try {
        let query = supabase
          .from('study_guides')
          .select('*')
          .order('year, section');

        if (year) {
          query = query.eq('year', year);
        }
        if (section) {
          query = query.eq('section', section);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Get study guides error:', error);
        return [];
      }
    },

    async getByYear(year) {
      return this.getAll(year);
    },

    async getBySection(year, section) {
      return this.getAll(year, section);
    },

    async getById(id) {
      try {
        const { data, error } = await supabase
          .from('study_guides')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Get study guide by ID error:', error);
        return null;
      }
    }
  },

  // User Progress - replaces localStorage with database
  userProgress: {
    async get(userId, year) {
      try {
        const { data, error } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', userId)
          .eq('year', year)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = not found
          throw error;
        }

        return data || {
          user_id: userId,
          year,
          progress_data: {},
          exam_readiness: {},
          statistics: {},
          bookmarks: [],
          weak_areas: [],
          streak_data: {}
        };
      } catch (error) {
        console.error('Get user progress error:', error);
        return null;
      }
    },

    async update(userId, year, progressData) {
      try {
        const { data, error } = await supabase
          .from('user_progress')
          .upsert({
            user_id: userId,
            year,
            progress_data: progressData.progress_data || {},
            exam_readiness: progressData.exam_readiness || {},
            statistics: progressData.statistics || {},
            bookmarks: progressData.bookmarks || [],
            weak_areas: progressData.weak_areas || [],
            streak_data: progressData.streak_data || {}
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Update user progress error:', error);
        throw error;
      }
    },

    async reset(userId, year) {
      try {
        const { data, error } = await supabase
          .from('user_progress')
          .update({
            progress_data: {},
            exam_readiness: {},
            statistics: {},
            bookmarks: [],
            weak_areas: [],
            streak_data: {}
          })
          .eq('user_id', userId)
          .eq('year', year)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Reset user progress error:', error);
        throw error;
      }
    }
  },

  // Bookmarks - replaces localStorage with database
  bookmarks: {
    async add(userId, questionId, year) {
      try {
        const { data, error } = await supabase
          .from('bookmarks')
          .insert({
            user_id: userId,
            question_id: questionId,
            year
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Add bookmark error:', error);
        throw error;
      }
    },

    async remove(userId, questionId) {
      try {
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', userId)
          .eq('question_id', questionId);

        if (error) throw error;
        return true;
      } catch (error) {
        console.error('Remove bookmark error:', error);
        throw error;
      }
    },

    async getAll(userId, year) {
      try {
        const { data, error } = await supabase
          .from('bookmarks')
          .select(`
            *,
            questions (
              id,
              year,
              section,
              question_text,
              options,
              correct_answer,
              difficulty
            )
          `)
          .eq('user_id', userId)
          .eq('year', year);

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Get bookmarks error:', error);
        return [];
      }
    }
  },

  // Quiz Sessions - new functionality for tracking quiz attempts
  quizSessions: {
    async create(userId, year, quizMode, questions) {
      try {
        const { data, error } = await supabase
          .from('quiz_sessions')
          .insert({
            user_id: userId,
            year,
            quiz_mode: quizMode,
            questions,
            total_questions: questions.length
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Create quiz session error:', error);
        throw error;
      }
    },

    async update(sessionId, answers, score, timeTaken) {
      try {
        const { data, error } = await supabase
          .from('quiz_sessions')
          .update({
            answers,
            score,
            time_taken: timeTaken,
            completed_at: new Date().toISOString()
          })
          .eq('id', sessionId)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Update quiz session error:', error);
        throw error;
      }
    },

    async getHistory(userId, year, limit = 10) {
      try {
        const { data, error } = await supabase
          .from('quiz_sessions')
          .select('*')
          .eq('user_id', userId)
          .eq('year', year)
          .eq('completed_at', null, 'neq') // Only completed sessions
          .order('completed_at', { ascending: false })
          .limit(limit);

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Get quiz history error:', error);
        return [];
      }
    }
  }
};

// Export supabase client for direct access if needed
export { supabase };

// Export default for compatibility
export default api;
