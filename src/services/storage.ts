import { PracticeQuestion, PracticeSession, StudyPlan, UserAccount } from '../types';
import { DEFAULT_QUESTIONS, DEFAULT_USERS, INITIAL_SESSIONS, INITIAL_STUDY_PLAN } from '../data/mockData';

const STORAGE_KEYS = {
  CURRENT_USER_ID: 'speaksmart_current_user_id',
  USERS: 'speaksmart_users',
  SESSIONS: 'speaksmart_sessions',
  QUESTIONS: 'speaksmart_questions',
  STUDY_PLANS: 'speaksmart_study_plans',
};

export const storageService = {
  getUsers(): UserAccount[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USERS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to read users from localStorage', e);
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  },

  getCurrentUser(): UserAccount {
    const users = this.getUsers();
    try {
      const currentId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
      const found = users.find((u) => u.id === currentId);
      if (found) return found;
    } catch (e) {
      console.error('Failed to read current user id', e);
    }
    const defaultUser = users[0] || DEFAULT_USERS[0];
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, defaultUser.id);
    return defaultUser;
  },

  setCurrentUser(userId: string): UserAccount {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, userId);
    return this.getCurrentUser();
  },

  saveUser(user: UserAccount): UserAccount {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === user.id);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return user;
  },

  getSessions(userId?: string): PracticeSession[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      let sessions: PracticeSession[] = stored ? JSON.parse(stored) : INITIAL_SESSIONS;
      if (!stored) {
        localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(INITIAL_SESSIONS));
      }
      if (userId) {
        return sessions.filter((s) => s.userId === userId);
      }
      return sessions;
    } catch (e) {
      console.error('Failed to load sessions', e);
      return INITIAL_SESSIONS;
    }
  },

  saveSession(session: PracticeSession): PracticeSession {
    const sessions = this.getSessions();
    sessions.unshift(session);
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));

    // Update user stats
    const user = this.getCurrentUser();
    if (user && user.id === session.userId) {
      const today = new Date().toISOString().split('T')[0];
      const lastPracticed = user.lastPracticedDate ? user.lastPracticedDate.split('T')[0] : '';
      let newStreak = user.streakDays;
      if (lastPracticed !== today) {
        newStreak += 1;
      }
      const updatedUser: UserAccount = {
        ...user,
        streakDays: newStreak,
        lastPracticedDate: new Date().toISOString(),
        totalSpeakingSeconds: (user.totalSpeakingSeconds || 0) + session.durationSeconds,
      };
      this.saveUser(updatedUser);
    }

    return session;
  },

  getQuestions(): PracticeQuestion[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to load questions', e);
    }
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(DEFAULT_QUESTIONS));
    return DEFAULT_QUESTIONS;
  },

  addQuestion(question: PracticeQuestion): PracticeQuestion {
    const questions = this.getQuestions();
    questions.unshift(question);
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
    return question;
  },

  getStudyPlan(userId: string): StudyPlan {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.STUDY_PLANS);
      if (stored) {
        const plans: Record<string, StudyPlan> = JSON.parse(stored);
        if (plans[userId]) return plans[userId];
      }
    } catch (e) {
      console.error('Failed to load study plan', e);
    }
    return INITIAL_STUDY_PLAN;
  },

  saveStudyPlan(plan: StudyPlan): StudyPlan {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.STUDY_PLANS);
      const plans: Record<string, StudyPlan> = stored ? JSON.parse(stored) : {};
      plans[plan.userId] = plan;
      localStorage.setItem(STORAGE_KEYS.STUDY_PLANS, JSON.stringify(plans));
    } catch (e) {
      console.error('Failed to save study plan', e);
    }
    return plan;
  },

  toggleDrillCompletion(userId: string, weekNumber: number, dayNumber: number): StudyPlan {
    const plan = this.getStudyPlan(userId);
    const week = plan.weeks.find((w) => w.weekNumber === weekNumber);
    if (week) {
      const drill = week.drills.find((d) => d.dayNumber === dayNumber);
      if (drill) {
        drill.completed = !drill.completed;
        this.saveStudyPlan(plan);
      }
    }
    return plan;
  }
};
