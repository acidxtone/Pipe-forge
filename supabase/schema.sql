-- TradeBench Database Schema for Vercel + Supabase Migration
-- This schema maintains all existing functionality while migrating to Supabase

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  first_name TEXT,
  last_name TEXT,
  selected_year INTEGER DEFAULT 1,
  security_question TEXT,
  security_answer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Questions table (migrated from JSON files)
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  year INTEGER NOT NULL,
  section TEXT,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study Guides table (migrated from JSON files)
CREATE TABLE IF NOT EXISTS public.study_guides (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  year INTEGER NOT NULL,
  section TEXT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Progress table (replaces localStorage)
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  progress_data JSONB NOT NULL DEFAULT '{}',
  exam_readiness JSONB DEFAULT '{}',
  statistics JSONB DEFAULT '{}',
  bookmarks JSONB DEFAULT '[]',
  weak_areas JSONB DEFAULT '[]',
  streak_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, year)
);

-- Quiz Sessions table (for tracking quiz attempts)
CREATE TABLE IF NOT EXISTS public.quiz_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  quiz_mode TEXT NOT NULL,
  questions JSONB NOT NULL,
  answers JSONB DEFAULT '{}',
  score INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  time_taken INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookmarks table (for individual question bookmarks)
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_questions_year ON public.questions(year);
CREATE INDEX IF NOT EXISTS idx_questions_section ON public.questions(section);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON public.questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_study_guides_year ON public.study_guides(year);
CREATE INDEX IF NOT EXISTS idx_study_guides_section ON public.study_guides(section);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_year ON public.user_progress(user_id, year);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_year ON public.quiz_sessions(user_id, year);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_year ON public.bookmarks(user_id, year);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for User Progress
CREATE POLICY "Users can manage own progress" ON public.user_progress
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for Quiz Sessions
CREATE POLICY "Users can manage own quiz sessions" ON public.quiz_sessions
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for Bookmarks
CREATE POLICY "Users can manage own bookmarks" ON public.bookmarks
  FOR ALL USING (auth.uid() = user_id);

-- Public read access for questions and study guides
CREATE POLICY "Questions are publicly viewable" ON public.questions
  FOR SELECT USING (true);

CREATE POLICY "Study guides are publicly viewable" ON public.study_guides
  FOR SELECT USING (true);

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic timestamp updates
CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_questions_updated_at
  BEFORE UPDATE ON public.questions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_study_guides_updated_at
  BEFORE UPDATE ON public.study_guides
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_user_progress_updated_at
  BEFORE UPDATE ON public.user_progress
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to get user progress (maintains localStorage structure)
CREATE OR REPLACE FUNCTION public.get_user_progress(p_user_id UUID, p_year INTEGER)
RETURNS JSONB AS $$
DECLARE
  progress_record RECORD;
BEGIN
  SELECT * INTO progress_record 
  FROM public.user_progress 
  WHERE user_id = p_user_id AND year = p_year;
  
  IF FOUND THEN
    RETURN progress_record.progress_data;
  ELSE
    RETURN '{}';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user progress
CREATE OR REPLACE FUNCTION public.update_user_progress(
  p_user_id UUID, 
  p_year INTEGER, 
  p_progress_data JSONB
)
RETURNS BOOLEAN AS $$
BEGIN
  INSERT INTO public.user_progress (user_id, year, progress_data)
  VALUES (p_user_id, p_year, p_progress_data)
  ON CONFLICT (user_id, year)
  DO UPDATE SET 
    progress_data = p_progress_data,
    updated_at = NOW();
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user statistics
CREATE OR REPLACE FUNCTION public.get_user_statistics(p_user_id UUID, p_year INTEGER)
RETURNS JSONB AS $$
DECLARE
  stats_record RECORD;
BEGIN
  SELECT * INTO stats_record 
  FROM public.user_progress 
  WHERE user_id = p_user_id AND year = p_year;
  
  IF FOUND THEN
    RETURN jsonb_build_object(
      'exam_readiness', stats_record.exam_readiness,
      'statistics', stats_record.statistics,
      'bookmarks', stats_record.bookmarks,
      'weak_areas', stats_record.weak_areas,
      'streak_data', stats_record.streak_data
    );
  ELSE
    RETURN jsonb_build_object(
      'exam_readiness', '{}',
      'statistics', '{}',
      'bookmarks', '[]',
      'weak_areas', '[]',
      'streak_data', '{}'
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
