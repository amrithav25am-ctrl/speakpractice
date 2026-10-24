import React, { useState } from 'react';
import { StudyPlan } from '../types';
import { VOCAL_WARMUPS } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storage';
import { apiService } from '../services/api';
import { 
  CalendarCheck, 
  Sparkles, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Flame, 
  Target, 
  ChevronRight, 
  RotateCcw,
  Volume2,
  BookOpen
} from 'lucide-react';

interface StudyPlanViewProps {
  onStartDrillPractice: (promptText: string) => void;
}

export const StudyPlanView: React.FC<StudyPlanViewProps> = ({ onStartDrillPractice }) => {
  const { currentUser } = useAuth();
  const [studyPlan, setStudyPlan] = useState<StudyPlan>(() => storageService.getStudyPlan(currentUser.id));
  const [activeWeek, setActiveWeek] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [dailyMinutes, setDailyMinutes] = useState(15);
  const [targetGoal, setTargetGoal] = useState(currentUser.focusGoal || 'Eliminate filler words and stabilize speaking pace');

  const handleToggleDrill = (weekNumber: number, dayNumber: number) => {
    const updatedPlan = storageService.toggleDrillCompletion(currentUser.id, weekNumber, dayNumber);
    setStudyPlan({ ...updatedPlan });
  };

  const handleRegeneratePlan = async () => {
    setIsGenerating(true);
    setShowConfigModal(false);

    try {
      const sessions = storageService.getSessions(currentUser.id);
      const totalFillers = sessions.reduce((acc, s) => acc + s.analysis.totalFillerCount, 0);
      const avgScore = sessions.length > 0 
        ? Math.round(sessions.reduce((acc, s) => acc + s.analysis.overallScore, 0) / sessions.length) 
        : 72;
      const avgWpm = sessions.length > 0 
        ? Math.round(sessions.reduce((acc, s) => acc + s.analysis.wpm, 0) / sessions.length) 
        : 145;

      const generatedPlan = await apiService.generateStudyPlan({
        userStats: {
          userId: currentUser.id,
          avgScore,
          avgWpm,
          totalFillers,
          sessionCount: sessions.length,
          weakAreas: ['Filler words (like, um)', 'Maintaining conversational cadence under pressure']
        },
        targetRole: currentUser.targetRole,
        dailyMinutes,
        targetGoal
      });

      storageService.saveStudyPlan(generatedPlan);
      setStudyPlan(generatedPlan);
      setActiveWeek(1);
    } catch (e) {
      console.error('Failed to regenerate plan', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const currentWeekPlan = studyPlan.weeks.find((w) => w.weekNumber === activeWeek) || studyPlan.weeks[0];

  // Calculate completion percentage
  let totalDrills = 0;
  let completedDrills = 0;
  studyPlan.weeks.forEach((w) => {
    w.drills.forEach((d) => {
      totalDrills += 1;
      if (d.completed) completedDrills += 1;
    });
  });
  const progressPercent = totalDrills > 0 ? Math.round((completedDrills / totalDrills) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Plan Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>Personalized for {currentUser.name}</span>
              <span aria-hidden="true">·</span>
              <span>{studyPlan.targetRole}</span>
              <span aria-hidden="true">·</span>
              <span>{studyPlan.dailyMinutes} min/day</span>
            </div>
            <h1 className="font-heading text-xl sm:text-2xl font-bold text-slate-900">
              {studyPlan.planTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              {studyPlan.summary}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={() => setShowConfigModal(true)}
              disabled={isGenerating}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-xl border border-indigo-200/60 transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              {isGenerating ? 'AI Building Plan...' : 'Regenerate Study Plan'}
            </button>
          </div>
        </div>

        {/* Focus Areas & Progress Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              Target Competencies
            </span>
            <div className="flex flex-wrap gap-1.5">
              {studyPlan.focusAreas.map((area, idx) => (
                <span key={idx} className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-medium">
                  {area}
                </span>
              ))}
            </div>
          </div>

          <div className="md:text-right">
            <div className="flex md:justify-end items-center gap-2 text-xs font-semibold text-slate-700 mb-1">
              <span>Curriculum Progress:</span>
              <span className="text-indigo-600 font-bold tabular-nums">{completedDrills} of {totalDrills} drills ({progressPercent}%)</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                style={{ width: `${progressPercent}%` }} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Vocal Warmup Exercises Bar */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading text-sm font-bold text-slate-900 flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-indigo-600" />
            Daily 2-Minute Vocal Warmups
          </h2>
          <span className="text-xs text-slate-500">Run before recording mocks</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {VOCAL_WARMUPS.map((w, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900 mb-1">{w.title}</div>
                <p className="text-xs text-indigo-900 bg-indigo-50/70 p-2.5 rounded-lg italic font-medium leading-relaxed">
                  "{w.text}"
                </p>
              </div>
              <div className="text-[11px] text-slate-500 mt-2">
                <span className="font-semibold text-slate-600">Focus:</span> {w.focus}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Week Selector Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-1 scrollbar-none">
        {studyPlan.weeks.map((week) => {
          const isActive = week.weekNumber === activeWeek;
          const completedInWeek = week.drills.filter((d) => d.completed).length;

          return (
            <button
              key={week.weekNumber}
              onClick={() => setActiveWeek(week.weekNumber)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>Week {week.weekNumber}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-normal ${
                isActive ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 text-slate-500'
              }`}>
                {completedInWeek}/{week.drills.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Week Theme Banner */}
      {currentWeekPlan && (
        <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">
              Week {currentWeekPlan.weekNumber} Theme
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              {currentWeekPlan.theme}
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              <span className="font-semibold">Weekly Milestone:</span> {currentWeekPlan.goal}
            </p>
          </div>
        </div>
      )}

      {/* Daily Drills List */}
      {currentWeekPlan && (
        <div className="space-y-3">
          {currentWeekPlan.drills.map((drill) => {
            const isDone = Boolean(drill.completed);

            return (
              <div
                key={drill.dayNumber}
                className={`p-5 rounded-2xl border transition-all bg-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  isDone
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1">
                  {/* Interactive Checkbox */}
                  <button
                    onClick={() => handleToggleDrill(currentWeekPlan.weekNumber, drill.dayNumber)}
                    className="mt-1 text-slate-400 hover:text-emerald-600 transition-colors shrink-0"
                    title={isDone ? 'Mark as incomplete' : 'Mark as complete'}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300 hover:text-slate-400" />
                    )}
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        Day {drill.dayNumber} · {drill.drillType}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" />
                        {drill.timeMinutes} min
                      </span>
                    </div>

                    <h4 className={`text-sm font-bold ${isDone ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                      {drill.title}
                    </h4>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {drill.instructions}
                    </p>

                    <div className="mt-2 p-2.5 bg-slate-50 rounded-lg text-xs border border-slate-100 text-slate-800">
                      <span className="font-semibold text-slate-700">Exercise Prompt:</span> "{drill.exercisePrompt}"
                    </div>

                    <div className="text-[11px] text-emerald-700 font-medium pt-1">
                      Target Metric: {drill.successMetric}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => onStartDrillPractice(drill.exercisePrompt)}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                  >
                    Practice in Arena
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Re-generate Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="font-heading text-lg font-bold text-slate-900 mb-1">
              Regenerate AI Study Plan
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              SpeakSmart will synthesize your historical filler word count, cadence, and career target to produce an updated 4-week roadmap.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Daily Time Commitment
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[10, 15, 20, 30].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setDailyMinutes(mins)}
                      className={`py-2 text-xs font-bold rounded-lg border transition-colors ${
                        dailyMinutes === mins
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {mins} mins
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Primary Goal or Upcoming Milestone
                </label>
                <input
                  type="text"
                  value={targetGoal}
                  onChange={(e) => setTargetGoal(e.target.value)}
                  placeholder="e.g. Google behavioral interview in 3 weeks"
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRegeneratePlan}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                >
                  Generate Plan with Gemini
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
