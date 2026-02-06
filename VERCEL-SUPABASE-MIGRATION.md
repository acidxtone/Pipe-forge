# Vercel + Supabase Migration Plan

## Current Architecture
- **Frontend**: React + Express (monolithic)
- **Backend**: Express server with custom auth
- **Database**: PostgreSQL via Drizzle ORM

## Target Architecture
- **Frontend**: React on Vercel
- **Backend**: Supabase (Database + Auth + Functions)
- **API**: Supabase client + Edge Functions

## Migration Steps

### 1. Frontend Changes (Vercel)

#### Environment Variables
```env
# Vercel Environment Variables
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

#### API Client Updates
Replace `localClient.js` with Supabase client:
```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export const api = {
  auth: {
    // Use Supabase Auth instead of custom auth
    signUp: async (email, password, options) => {
      return await supabase.auth.signUp({
        email,
        password,
        options
      })
    },
    signIn: async (email, password) => {
      return await supabase.auth.signInWithPassword({
        email,
        password
      })
    },
    signOut: async () => {
      return await supabase.auth.signOut()
    },
    getUser: async () => {
      return await supabase.auth.getUser()
    }
  },
  questions: {
    // Use Supabase tables instead of JSON files
    getAll: async (year) => {
      let query = supabase.from('questions').select('*')
      if (year) query = query.eq('year', year)
      const { data, error } = await query
      return data || []
    }
  },
  userProgress: {
    // Use Supabase tables instead of localStorage
    get: async (userId, year) => {
      const { data } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('year', year)
      return data?.[0] || null
    },
    update: async (userId, year, progress) => {
      return await supabase
        .from('user_progress')
        .upsert({
          user_id: userId,
          year,
          progress_data: progress
        })
    }
  }
}
```

#### Vercel Configuration
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "env": {
    "VITE_SUPABASE_URL": "@supabase_url",
    "VITE_SUPABASE_ANON_KEY": "@supabase_anon_key"
  }
}
```

### 2. Supabase Setup

#### Database Schema
```sql
-- Users table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  selected_year INTEGER,
  security_question TEXT,
  security_answer TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Questions table
CREATE TABLE public.questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  year INTEGER NOT NULL,
  section TEXT,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  difficulty TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User Progress table
CREATE TABLE public.user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  progress_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, year)
);

-- Study Guides table
CREATE TABLE public.study_guides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  year INTEGER NOT NULL,
  section TEXT,
  title TEXT,
  content TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Row Level Security (RLS)
```sql
-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- Users can only see their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can only manage their own progress
CREATE POLICY "Users can manage own progress" ON public.user_progress
  FOR ALL USING (auth.uid() = user_id);
```

#### Supabase Edge Functions
Replace Express routes with Edge Functions:

```typescript
// supabase/functions/auth-helpers/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const { method } = req

  if (method === 'POST') {
    const { action, data } = await req.json()

    switch (action) {
      case 'update-profile':
        const { error } = await supabase
          .from('profiles')
          .update(data)
          .eq('id', data.id)
        return new Response(JSON.stringify({ error }), {
          headers: { 'Content-Type': 'application/json' }
        })

      // Add other auth helpers as needed
    }
  }

  return new Response('Method not allowed', { status: 405 })
})
```

### 3. Migration Process

#### Step 1: Set up Supabase
1. Create new Supabase project
2. Run database schema migration
3. Set up RLS policies
4. Configure auth settings

#### Step 2: Migrate Data
```javascript
// scripts/migrate-to-supabase.js
const { createClient } = require('@supabase/supabase-js')
const questions = require('../data/questions-massive-comprehensive.json')
const studyGuides = require('../data/study-guides-massive-comprehensive.json')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function migrateQuestions() {
  for (const question of questions) {
    await supabase.from('questions').insert({
      year: question.year,
      section: question.section,
      question_text: question.question_text,
      options: question.options,
      correct_answer: question.correct_answer,
      explanation: question.explanation,
      difficulty: question.difficulty
    })
  }
}

async function migrateStudyGuides() {
  for (const guide of studyGuides) {
    await supabase.from('study_guides').insert({
      year: guide.year,
      section: guide.section,
      title: guide.title,
      content: guide.content
    })
  }
}
```

#### Step 3: Update Frontend
1. Replace API calls with Supabase client
2. Update auth context to use Supabase Auth
3. Remove Express server dependencies
4. Test all functionality

#### Step 4: Deploy to Vercel
1. Push changes to GitHub
2. Connect repository to Vercel
3. Set environment variables
4. Deploy and test

### 4. Benefits of This Architecture

#### Vercel Frontend
- ✅ Global CDN
- ✅ Automatic deployments
- ✅ Preview environments
- ✅ Edge functions support
- ✅ Great performance

#### Supabase Backend
- ✅ Real-time database
- ✅ Built-in authentication
- ✅ Edge functions
- ✅ Auto-generated APIs
- ✅ Easy scaling

### 5. Files to Remove
- `server/` directory (Express backend)
- `drizzle.config.ts`
- Custom auth logic in `src/lib/AuthContext.jsx`
- `localClient.js` (replace with Supabase client)

### 6. Files to Update
- `src/App.jsx` - Remove Express dependencies
- `src/api/localClient.js` - Replace with Supabase client
- `src/lib/AuthContext.jsx` - Use Supabase Auth
- `package.json` - Update dependencies
- `vite.config.js` - Remove server proxy

This migration will give you a modern, scalable architecture with Vercel's frontend hosting and Supabase's backend-as-a-service!
