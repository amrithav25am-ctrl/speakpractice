import React, { useState } from 'react';
import { PracticeSession, UserAccount } from '../types';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storage';
import { 
  BarChart3, 
  TrendingUp, 
  Flame, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Gauge, 
  ChevronRight,
  Eye,
  Filter
} from 'lucide-react';

interface ProgressDashboardProps {
  sessions: PracticeSession[];
  onOpenSessionDetails: (session: PracticeSession) => void;
  onStartNewPractice: () => void;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  sessions,
  onOpenSessionDetails,
  onStartNewPractice
}) => {
  const { currentUser } = useAuth();
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  // Compute analytics
  const userSessions = sessions.filter((s) => s.userId === currentUser.id);
  const activeSessions = userSessions.length > 0 ? userSessions : sessions;

  const filteredSessions = categoryFilter === 'All'
    ? activeSessions
    : activeSessions.filter((s) => s.category === categoryFilter);

  const totalSessions = activeSessions.length;
  const totalMinutes = Math.round(
    activeSessions.reduce((acc, s) => acc + s.durationSeconds, 0) / 60
  );

  const avgOverallScore = totalSessions > 0
    ? Math.round(activeSessions.reduce((acc, s) => acc + s.analysis.overallScore, 0) / totalSessions)
    : 0;

  const avgWpm = totalSessions > 0
    ? Math.round(activeSessions.reduce((acc, s) => acc + s.analysis.wpm, 0) / totalSessions)
    : 0;

  const totalFillers = activeSessions.reduce(
    (acc, s) => acc + s.analysis.totalFillerCount, 0
  );

  const avgFillersPerSession = totalSessions > 0
    ? (totalFillers / totalSessions).toFixed(1)
    : '0';

  // Aggregate filler words
  const fillerWordMap: Record<string, number> = {};
  activeSessions.forEach((s) => {
    s.analysis.fillerBreakdown.forEach((f) => {
      fillerWordMap[f.word] = (fillerWordMap[f.word] || 0) + f.count;
    });
  });

  const sortedFillers = Object.entries(fillerWordMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const maxFillerCount = sortedFillers.length > 0 ? sortedFillers[0][1] : 1;

  // Pace breakdown
  const slowCount = activeSessions.filter((s) => s.analysis.wpm < 125).length;
  const optimalCount = activeSessions.filter((s) => s.analysis.wpm >= 125 && s.analysis.wpm <= 165).length;
  const fastCount = activeSessions.filter((s) => s.analysis.wpm > 165).length;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>{currentUser.name}</span>
            <span aria-hidden="true">·</span>
            <span>Target: {currentUser.targetRole}</span>
          </div>
          <h1 className="font-heading text-xl font-bold text-slate-900">
            Communication Progress & Speech Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time tracking of filler word reduction, speaking pace stability, and mock interview scores.
          </p>
        </div>

        <button
          onClick={onStartNewPractice}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-indigo-200 transition-colors shrink-0"
        >
          + Record New Practice Session
        </button>
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            Avg Score
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-heading font-extrabold text-slate-900 tabular-nums">
              {avgOverallScore}
            </span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            +14% this month
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            Speaking Time
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-heading font-extrabold text-slate-900 tabular-nums">
              {totalMinutes}
            </span>
            <span className="text-xs text-slate-400">minutes</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {totalSessions} recorded sessions
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            Average Pace
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-heading font-extrabold text-indigo-600 tabular-nums">
              {avgWpm}
            </span>
            <span className="text-xs text-slate-400">WPM</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Target: 130–165 WPM
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            Avg Fillers / Session
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-heading font-extrabold text-amber-600 tabular-nums">
              {avgFillersPerSession}
            </span>
            <span className="text-xs text-slate-400">words</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            ↓ 42% filler reduction
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm col-span-2 lg:col-span-1">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            Practice Streak
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-heading font-extrabold text-amber-600 tabular-nums">
              {currentUser.streakDays}
            </span>
            <span className="text-xs text-slate-400">days</span>
          </div>
          <div className="text-[11px] text-amber-700 flex items-center gap-1 font-medium mt-1">
            <Flame className="w-3 h-3 fill-amber-500 text-amber-600" />
            Keep streak alive today!
          </div>
        </div>

      </div>

      {/* Middle Section: Score Trend Line & Filler Word Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Score Evolution Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading text-sm font-bold text-slate-900">
                Score Trajectory & Growth
              </h3>
              <p className="text-xs text-slate-500">
                Overall communication scores plotted across consecutive practice sessions
              </p>
            </div>
            <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg">
              Latest: {activeSessions[0]?.analysis.overallScore || 0}/100
            </span>
          </div>

          {/* Clean SVG Progress Graph */}
          <div className="relative pt-4 pb-2">
            <div className="h-48 w-full flex items-end gap-3 sm:gap-6 pt-6 px-4 border-b border-slate-100">
              {activeSessions.slice().reverse().map((s, idx) => {
                const score = s.analysis.overallScore;
                const heightPct = Math.max(15, (score / 100) * 100);
                const dateLabel = new Date(s.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

                return (
                  <div key={s.id} className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer" onClick={() => onOpenSessionDetails(s)}>
                    <div className="text-[10px] font-bold text-slate-600 mb-1 opacity-0 group-hover:opacity-100 transition-opacity tabular-nums">
                      {score}
                    </div>
                    <div 
                      className={`w-full max-w-[42px] rounded-t-lg transition-all ${
                        score >= 85 ? 'bg-emerald-500 group-hover:bg-emerald-600' :
                        score >= 70 ? 'bg-indigo-600 group-hover:bg-indigo-700' :
                        'bg-amber-500 group-hover:bg-amber-600'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                    <div className="text-[10px] text-slate-400 mt-2 truncate max-w-[60px] text-center">
                      {dateLabel}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center text-[11px] text-slate-400 px-2 pt-2">
              <span>Earlier Sessions</span>
              <span>Recent Delivery</span>
            </div>
          </div>
        </div>

        {/* Filler Word Reduction Frequency */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-heading text-sm font-bold text-slate-900 mb-1">
              Top Detected Filler Words
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Words you unconsciously rely on while searching for thoughts
            </p>

            {sortedFillers.length > 0 ? (
              <div className="space-y-3">
                {sortedFillers.map(([word, count]) => {
                  const pct = Math.round((count / maxFillerCount) * 100);
                  return (
                    <div key={word} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="font-mono text-slate-800">"{word}"</span>
                        <span className="text-slate-500 tabular-nums">{count} occurrences</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-amber-500 h-full rounded-full" 
                          style={{ width: `${pct}%` }} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic py-8 text-center">
                No filler words detected yet. Record your speech to analyze habits.
              </div>
            )}
          </div>

          <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200/60 text-xs text-amber-900">
            <span className="font-bold">Coach Rule:</span> Replace your top filler with 1 beat of calm nasal inhalation.
          </div>
        </div>

      </div>

      {/* Pace Distribution & Session Log */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-heading text-base font-bold text-slate-900">
              Practice History Log
            </h3>
            <p className="text-xs text-slate-500">
              Review transcripts, speech metrics, and individual session coaching
            </p>
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {['All', 'Behavioral & STAR', 'Technical & System', 'Presentation & Keynote', 'Elevator Pitch & Intro'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                  categoryFilter === cat
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Sessions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Question Prompt</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Pace</th>
                <th className="py-3 px-4">Fillers</th>
                <th className="py-3 px-4">Overall</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredSessions.map((session) => {
                const dateFormatted = new Date(session.date).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });
                const score = session.analysis.overallScore;

                return (
                  <tr key={session.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{dateFormatted}</td>
                    <td className="py-3 px-4 font-medium text-slate-900 max-w-xs truncate">
                      {session.questionText}
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {session.category}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums whitespace-nowrap">
                      {session.durationSeconds}s
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums whitespace-nowrap">
                      {session.analysis.wpm} WPM
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums whitespace-nowrap text-amber-700 font-bold">
                      {session.analysis.totalFillerCount}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                        score >= 85 ? 'bg-emerald-100 text-emerald-800' :
                        score >= 70 ? 'bg-indigo-100 text-indigo-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {score}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => onOpenSessionDetails(session)}
                        className="px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Review
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
