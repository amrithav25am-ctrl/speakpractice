/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header, ActiveTab } from './components/Header';
import { AuthModal } from './components/AuthModal';
import { PracticeArena } from './components/PracticeArena';
import { SpeechFeedbackModal } from './components/SpeechFeedbackModal';
import { ProgressDashboard } from './components/ProgressDashboard';
import { StudyPlanView } from './components/StudyPlanView';
import { QuestionBankView } from './components/QuestionBankView';
import { PracticeQuestion, PracticeSession } from './types';
import { storageService } from './services/storage';

function SpeakSmartApp() {
  const { currentUser } = useAuth();
  
  // State
  const [activeTab, setActiveTab] = useState<ActiveTab>('practice');
  const [questions, setQuestions] = useState<PracticeQuestion[]>(() => storageService.getQuestions());
  const [selectedQuestion, setSelectedQuestion] = useState<PracticeQuestion>(() => {
    const list = storageService.getQuestions();
    return list[0];
  });
  const [sessions, setSessions] = useState<PracticeSession[]>(() => storageService.getSessions());
  
  // Feedback Modal State
  const [activeFeedbackSession, setActiveFeedbackSession] = useState<PracticeSession | null>(null);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  // Sync questions from storage
  const refreshQuestions = () => {
    setQuestions(storageService.getQuestions());
  };

  // Sync sessions from storage
  const refreshSessions = () => {
    setSessions(storageService.getSessions());
  };

  useEffect(() => {
    refreshSessions();
  }, [currentUser.id]);

  const handleAnalysisComplete = (newSession: PracticeSession) => {
    refreshSessions();
    setActiveFeedbackSession(newSession);
    setIsFeedbackOpen(true);
  };

  const handleOpenSessionDetails = (session: PracticeSession) => {
    setActiveFeedbackSession(session);
    setIsFeedbackOpen(true);
  };

  const handleSelectAndPractice = (question: PracticeQuestion) => {
    setSelectedQuestion(question);
    setActiveTab('practice');
  };

  const handleStartDrillPractice = (promptText: string) => {
    // Look for matching question or create on the fly
    const customQ: PracticeQuestion = {
      id: `drill-${Date.now()}`,
      question: promptText,
      category: 'Behavioral & STAR',
      difficulty: 'Intermediate',
      suggestedDurationSeconds: 90,
      coachTip: 'Focus on eliminating filler words and holding deliberate silent pauses between thoughts.',
      framework: 'Pause Substitution Method',
    };
    storageService.addQuestion(customQ);
    refreshQuestions();
    setSelectedQuestion(customQ);
    setActiveTab('practice');
  };

  const handlePracticeFollowUp = (followUpText: string) => {
    const followUpQ: PracticeQuestion = {
      id: `followup-${Date.now()}`,
      question: followUpText,
      category: selectedQuestion.category,
      difficulty: selectedQuestion.difficulty,
      suggestedDurationSeconds: 75,
      coachTip: 'Deliver a concise, direct answer to the interviewer follow-up without restarting your entire narrative.',
      framework: 'Direct Answer + Micro-Example'
    };
    storageService.addQuestion(followUpQ);
    refreshQuestions();
    setSelectedQuestion(followUpQ);
    setActiveTab('practice');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-indigo-500/20">
      
      {/* Top Header */}
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {activeTab === 'practice' && (
          <PracticeArena
            questions={questions}
            selectedQuestion={selectedQuestion}
            onSelectQuestion={setSelectedQuestion}
            onAnalysisComplete={handleAnalysisComplete}
            onOpenStudyPlan={() => setActiveTab('study-plan')}
          />
        )}

        {activeTab === 'questions' && (
          <QuestionBankView
            questions={questions}
            onSelectAndPractice={handleSelectAndPractice}
            onRefreshQuestions={refreshQuestions}
          />
        )}

        {activeTab === 'study-plan' && (
          <StudyPlanView
            onStartDrillPractice={handleStartDrillPractice}
          />
        )}

        {activeTab === 'progress' && (
          <ProgressDashboard
            sessions={sessions}
            onOpenSessionDetails={handleOpenSessionDetails}
            onStartNewPractice={() => setActiveTab('practice')}
          />
        )}

      </main>

      {/* User Accounts & Profile Management Modal */}
      <AuthModal />

      {/* Speech Evaluation & Feedback Modal */}
      {activeFeedbackSession && (
        <SpeechFeedbackModal
          isOpen={isFeedbackOpen}
          onClose={() => setIsFeedbackOpen(false)}
          analysis={activeFeedbackSession.analysis}
          question={{
            id: activeFeedbackSession.questionId,
            question: activeFeedbackSession.questionText,
            category: activeFeedbackSession.category,
            difficulty: 'Intermediate',
            suggestedDurationSeconds: activeFeedbackSession.durationSeconds,
            coachTip: 'Review your pacing and filler word breakdown.'
          }}
          transcript={activeFeedbackSession.transcript}
          durationSeconds={activeFeedbackSession.durationSeconds}
          audioUrl={activeFeedbackSession.audioUrl}
          onRetry={() => {
            setIsFeedbackOpen(false);
            setActiveTab('practice');
          }}
          onPracticeFollowUp={handlePracticeFollowUp}
        />
      )}

      {/* Minimal Footer */}
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            <span className="font-semibold text-slate-700">SpeakSmart</span> — AI Speech & Interview Communication Coach.
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setActiveTab('practice')} className="hover:text-slate-800">Practice Arena</button>
            <button onClick={() => setActiveTab('study-plan')} className="hover:text-slate-800">Study Curriculum</button>
            <button onClick={() => setActiveTab('progress')} className="hover:text-slate-800">Analytics</button>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SpeakSmartApp />
    </AuthProvider>
  );
}
