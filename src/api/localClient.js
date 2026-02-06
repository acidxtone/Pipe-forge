/**
 * Local API client — auth, questions, user progress (no external backend).
 * Questions: /data/questions.json. UserProgress & auth: localStorage.
 */

const STORAGE_KEYS = {
  selectedYear: 'tradebench_selected_year',
  userProgress: 'tradebench_user_progress',
};

const GUEST_USER_EMAIL = 'guest@local';

let questionsCache = null;
let studyGuidesCache = null;

async function loadQuestions() {
  if (questionsCache) return questionsCache;
  try {
    const res = await fetch('/data/questions-massive-comprehensive.json');
    if (res.ok) {
      const data = await res.json();
      questionsCache = Array.isArray(data) ? data : data.questions || [];
    } else {
      questionsCache = [];
    }
  } catch {
    questionsCache = [];
  }
  return questionsCache;
}

async function loadStudyGuides() {
  if (studyGuidesCache) return studyGuidesCache;
  try {
    const res = await fetch('/data/study-guides-massive-comprehensive.json');
    if (res.ok) {
      const data = await res.json();
      studyGuidesCache = Array.isArray(data) ? data : data.guides || [];
    } else {
      studyGuidesCache = [];
    }
  } catch {
    studyGuidesCache = [];
  }
  return studyGuidesCache;
}

const auth = {
  async me() {
    const selectedYear = parseInt(localStorage.getItem(STORAGE_KEYS.selectedYear), 10);
    return {
      email: GUEST_USER_EMAIL,
      full_name: 'Guest',
      selected_year: Number.isFinite(selectedYear) ? selectedYear : null,
      role: 'user',
    };
  },

  async updateMe({ selected_year }) {
    if (selected_year != null) {
      localStorage.setItem(STORAGE_KEYS.selectedYear, String(selected_year));
    }
    return auth.me();
  },

  logout() {
    localStorage.removeItem(STORAGE_KEYS.selectedYear);
    localStorage.removeItem(STORAGE_KEYS.userProgress);
  },

  redirectToLogin() {},
};

const entities = {
  Question: {
    async filter({ year, section }) {
      const all = await loadQuestions();
      let list = all;
      if (year != null) list = list.filter((q) => q.year === year);
      if (section != null) list = list.filter((q) => q.section === section);
      return list;
    },
  },

  UserProgress: {
    async filter({ created_by }) {
      const raw = localStorage.getItem(STORAGE_KEYS.userProgress);
      if (!raw) return [];
      try {
        const data = JSON.parse(raw);
        if (data.created_by === created_by) return [data];
        return [];
      } catch {
        return [];
      }
    },

    async create(payload) {
      const id = `local-${Date.now()}`;
      const record = { id, created_by: GUEST_USER_EMAIL, ...payload };
      localStorage.setItem(STORAGE_KEYS.userProgress, JSON.stringify(record));
      return record;
    },

    async update(id, payload) {
      const raw = localStorage.getItem(STORAGE_KEYS.userProgress);
      if (!raw) return null;
      try {
        const record = JSON.parse(raw);
        if (record.id !== id) return record;
        const updated = { ...record, ...payload };
        localStorage.setItem(STORAGE_KEYS.userProgress, JSON.stringify(updated));
        return updated;
      } catch {
        return null;
      }
    },

    async delete() {
      localStorage.removeItem(STORAGE_KEYS.userProgress);
    },
  },
};

const appLogs = {
  logUserInApp() {
    return Promise.resolve();
  },
};

const studyGuides = {
  async getByYear(year) {
    const guides = await loadStudyGuides();
    return guides.filter((g) => g.year === year);
  },
  async getByYearAndSection(year, section) {
    const guides = await loadStudyGuides();
    return guides.filter((g) => g.year === year && g.section === section);
  },
};

export const api = {
  auth,
  entities,
  appLogs,
  studyGuides,
};
