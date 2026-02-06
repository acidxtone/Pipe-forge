// Anonymous Session Manager for TradeBench
// Stores user progress in LocalStorage for anonymous sessions

const ANONYMOUS_SESSION_KEY = 'tradebench_anonymous_session';
const USER_PROGRESS_KEY = 'tradebench_user_progress';

export const anonymousSession = {
  // Initialize or get existing anonymous session
  init() {
    const existing = localStorage.getItem(ANONYMOUS_SESSION_KEY);
    if (!existing) {
      const sessionId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const session = {
        id: sessionId,
        createdAt: new Date().toISOString(),
        isAnonymous: true,
        progress: {
          answeredQuestions: [],
          currentYear: null,
          problemAreas: [],
          timeSpent: 0,
          sessionsCount: 0
        }
      };
      localStorage.setItem(ANONYMOUS_SESSION_KEY, JSON.stringify(session));
      return session;
    }
    return JSON.parse(existing);
  },

  // Get current session
  getCurrent() {
    return this.init();
  },

  // Update progress
  updateProgress(progress) {
    const session = this.getCurrent();
    session.progress = { ...session.progress, ...progress };
    session.lastActivity = new Date().toISOString();
    localStorage.setItem(ANONYMOUS_SESSION_KEY, JSON.stringify(session));
  },

  // Add answered question
  addAnsweredQuestion(questionId, year, section, isCorrect = false) {
    const session = this.getCurrent();
    const answeredQuestion = {
      questionId,
      year,
      section,
      isCorrect,
      timestamp: new Date().toISOString()
    };
    
    // Avoid duplicates
    session.progress.answeredQuestions = session.progress.answeredQuestions.filter(
      q => q.questionId !== questionId
    );
    session.progress.answeredQuestions.push(answeredQuestion);
    
    // Track problem areas
    if (!isCorrect) {
      const problemArea = `Year ${year} - Section ${section}`;
      if (!session.progress.problemAreas.includes(problemArea)) {
        session.progress.problemAreas.push(problemArea);
      }
    }
    
    this.updateProgress(session.progress);
  },

  // Set current year
  setCurrentYear(year) {
    const session = this.getCurrent();
    session.progress.currentYear = year;
    session.progress.sessionsCount++;
    this.updateProgress(session.progress);
  },

  // Get session stats
  getStats() {
    const session = this.getCurrent();
    return {
      sessionId: session.id,
      isAnonymous: session.isAnonymous,
      totalAnswered: session.progress.answeredQuestions.length,
      correctAnswers: session.progress.answeredQuestions.filter(q => q.isCorrect).length,
      currentYear: session.progress.currentYear,
      problemAreas: session.progress.problemAreas,
      timeSpent: session.progress.timeSpent,
      sessionsCount: session.progress.sessionsCount,
      createdAt: session.createdAt
    };
  },

  // Merge anonymous session with email account
  async mergeWithEmail(email) {
    const session = this.getCurrent();
    if (!session.isAnonymous) return session;

    // Store the merge data for later processing
    const mergeData = {
      anonymousSessionId: session.id,
      email: email,
      progress: session.progress,
      mergeRequestedAt: new Date().toISOString()
    };

    // Store merge request in localStorage for processing after login
    localStorage.setItem('tradebench_merge_request', JSON.stringify(mergeData));
    
    return mergeData;
  },

  // Clear anonymous session
  clear() {
    localStorage.removeItem(ANONYMOUS_SESSION_KEY);
  }
};

// Progress persistence utilities
export const progressUtils = {
  // Save progress to persistent storage
  save(key, data) {
    try {
      localStorage.setItem(`${USER_PROGRESS_KEY}_${key}`, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  },

  // Load progress from persistent storage
  load(key) {
    try {
      const data = localStorage.getItem(`${USER_PROGRESS_KEY}_${key}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to load progress:', error);
      return null;
    }
  },

  // Get all saved progress
  getAll() {
    const keys = Object.keys(localStorage).filter(key => key.startsWith(USER_PROGRESS_KEY));
    const progress = {};
    keys.forEach(key => {
      const cleanKey = key.replace(`${USER_PROGRESS_KEY}_`, '');
      progress[cleanKey] = this.load(cleanKey);
    });
    return progress;
  }
};
