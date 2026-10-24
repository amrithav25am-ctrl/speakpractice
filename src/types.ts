export type QuestionCategory = 
  | 'Behavioral & STAR'
  | 'Technical & System'
  | 'Leadership & Conflict'
  | 'Presentation & Keynote'
  | 'Academic & Scholarship'
  | 'Elevator Pitch & Intro';

export type QuestionDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface PracticeQuestion {
  id: string;
  question: string;
  category: QuestionCategory;
  difficulty: QuestionDifficulty;
  suggestedDurationSeconds: number;
  coachTip: string;
  framework?: string;
  keyTalkingPoints?: string[];
  role?: string;
}

export interface FillerWordBreakdown {
  word: string;
  count: number;
  tip?: string;
}

export interface SpeechAnalysis {
  overallScore: number;
  clarityScore: number;
  fillerScore: number;
  paceScore: number;
  structureScore: number;
  vocabularyScore: number;
  wpm: number;
  paceAssessment: string;
  totalFillerCount: number;
  fillerPercentage?: number;
  fillerBreakdown: FillerWordBreakdown[];
  strengths: string[];
  improvementTips: string[];
  executiveRewrite: string;
  structureEvaluation?: string;
  followUpQuestion?: string;
  wordCount?: number;
  durationSeconds?: number;
}

export interface PracticeSession {
  id: string;
  userId: string;
  date: string; // ISO date
  questionId: string;
  questionText: string;
  category: QuestionCategory;
  transcript: string;
  durationSeconds: number;
  analysis: SpeechAnalysis;
  audioUrl?: string; // local blob or recorded object url if available
}

export interface DailyDrill {
  dayNumber: number;
  title: string;
  timeMinutes: number;
  drillType: 'Vocal Warmup' | 'Filler Elimination' | 'Pacing Meter' | 'Mock Question' | string;
  instructions: string;
  exercisePrompt: string;
  successMetric: string;
  completed?: boolean;
}

export interface WeekPlan {
  weekNumber: number;
  theme: string;
  goal: string;
  drills: DailyDrill[];
}

export interface StudyPlan {
  id: string;
  userId: string;
  createdAt: string;
  planTitle: string;
  summary: string;
  estimatedImprovement: string;
  focusAreas: string[];
  weeks: WeekPlan[];
  targetRole: string;
  dailyMinutes: number;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  avatarSeed?: string;
  targetRole: string;
  experienceLevel: 'Student' | 'Recent Grad' | 'Mid-Career' | 'Executive';
  focusGoal: string;
  streakDays: number;
  lastPracticedDate?: string;
  totalSpeakingSeconds: number;
  joinedDate: string;
}

export interface UserStats {
  totalSessions: number;
  avgOverallScore: number;
  avgWpm: number;
  totalFillerWords: number;
  avgFillerDensity: number; // fillers per minute
  scoreTrend: { date: string; score: number }[];
  fillerWordFrequency: { word: string; count: number }[];
  weakAreas: string[];
  topPace: number;
  totalSpeakingMinutes: number;
}
