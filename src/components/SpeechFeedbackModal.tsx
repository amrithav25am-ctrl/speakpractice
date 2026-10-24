import React, { useState } from 'react';
import { SpeechAnalysis, PracticeQuestion } from '../types';
import { 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ArrowRight, 
  Volume2, 
  Gauge, 
  Activity, 
  Share2, 
  RotateCcw,
  BookOpen
} from 'lucide-react';

interface SpeechFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: SpeechAnalysis;
  question: PracticeQuestion;
  transcript: string;
  durationSeconds: number;
  audioUrl?: string;
  onRetry: () => void;
  onPracticeFollowUp?: (questionText: string) => void;
}

export const SpeechFeedbackModal: React.FC<SpeechFeedbackModalProps> = ({
  isOpen,
  onClose,
  analysis,
  question,
  transcript,
  durationSeconds,
  audioUrl,
  onRetry,
  onPracticeFollowUp,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'transcript' | 'rewrite'>('overview');
  const [selectedFillerTip, setSelectedFillerTip] = useState<string | null>(null);

  if (!isOpen) return null;

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score >= 70) return 'text-indigo-700 bg-indigo-50 border-indigo-200';
    if (score >= 55) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-rose-700 bg-rose-50 border-rose-200';
  };

  const getPaceStatus = (wpm: number) => {
    if (wpm < 115) return { label: 'Too Slow / Hesitant', color: 'text-amber-600' };
    if (wpm >= 115 && wpm <= 130) return { label: 'Measured / Steady', color: 'text-indigo-600' };
    if (wpm > 130 && wpm <= 165) return { label: 'Optimal Conversational', color: 'text-emerald-600' };
    if (wpm > 165 && wpm <= 185) return { label: 'Brisk / Energetic', color: 'text-indigo-600' };
    return { label: 'Too Fast / Rushing', color: 'text-rose-600' };
  };

  const paceStatus = getPaceStatus(analysis.wpm);

  // Render transcript with highlighted filler words
  const renderHighlightedTranscript = () => {
    const fillerWords = analysis.fillerBreakdown.map((f) => f.word.toLowerCase());
    // Also include common variants
    const allFillers = Array.from(new Set([...fillerWords, 'um', 'uh', 'like', 'you know', 'basically', 'actually', 'sort of', 'kind of', 'i mean']));

    // Split text into tokens preserving punctuation
    const tokens = transcript.split(/(\s+|[.,!?;:])/);

    return (
      <div className="leading-relaxed text-slate-800 text-sm space-y-2">
        <p>
          {tokens.map((token, index) => {
            const clean = token.toLowerCase().trim();
            const isFiller = allFillers.includes(clean);
            
            if (isFiller) {
              const breakdown = analysis.fillerBreakdown.find((f) => f.word.toLowerCase() === clean);
              const tip = breakdown?.tip || `Replace "${clean}" with a steady breath or silent pause.`;
              return (
                <span
                  key={index}
                  onClick={() => setSelectedFillerTip(tip)}
                  className="inline-block bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold px-1 py-0.5 rounded cursor-pointer mx-0.5 transition-colors border-b-2 border-amber-400"
                  title="Click to view filler replacement coaching"
                >
                  {token}
                </span>
              );
            }
            return <span key={index}>{token}</span>;
          })}
        </p>

        {selectedFillerTip && (
          <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-200/80 flex items-start justify-between gap-3 animate-fade-in">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900">
                <span className="font-bold">Coach Tip:</span> {selectedFillerTip}
              </div>
            </div>
            <button
              onClick={() => setSelectedFillerTip(null)}
              className="text-amber-700 hover:text-amber-900 text-xs font-semibold"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-auto overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>{question.category}</span>
              <span aria-hidden="true">·</span>
              <span>{durationSeconds} seconds recorded</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{analysis.wpm} WPM</span>
            </div>
            <h2 className="font-heading text-base sm:text-lg font-bold text-slate-900 line-clamp-1">
              {question.question}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Tabs */}
        <div className="flex border-b border-slate-100 px-6 pt-2 bg-slate-50/30 gap-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Performance Overview
          </button>
          <button
            onClick={() => setActiveTab('transcript')}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'transcript'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Interactive Transcript ({analysis.totalFillerCount} fillers)
          </button>
          <button
            onClick={() => setActiveTab('rewrite')}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'rewrite'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Executive Polish & Rewrite
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {activeTab === 'overview' && (
            <>
              {/* Top Score Banner */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Overall Score */}
                <div className="p-5 rounded-2xl bg-indigo-900 text-white flex flex-col justify-between shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-bold tracking-wider text-indigo-200">
                      Overall Communication
                    </span>
                    <span className="text-xs bg-indigo-800/80 text-indigo-100 px-2 py-0.5 rounded">
                      Index
                    </span>
                  </div>
                  <div className="my-3 flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-heading font-extrabold tracking-tight tabular-nums">
                      {analysis.overallScore}
                    </span>
                    <span className="text-sm text-indigo-300 font-medium">/ 100</span>
                  </div>
                  <p className="text-xs text-indigo-200">
                    {analysis.overallScore >= 80 
                      ? 'Compelling executive-ready delivery.' 
                      : analysis.overallScore >= 65 
                      ? 'Solid foundation with pacing and filler tuning needed.' 
                      : 'Requires structured practice and pause drills.'}
                  </p>
                </div>

                {/* Filler Words Metric */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-bold tracking-wider text-slate-500">
                      Filler Word Control
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      analysis.totalFillerCount <= 1 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {analysis.totalFillerCount} detected
                    </span>
                  </div>
                  <div className="my-3 flex items-baseline gap-2">
                    <span className="text-4xl font-heading font-extrabold text-slate-900 tabular-nums">
                      {analysis.fillerScore}
                    </span>
                    <span className="text-sm text-slate-400 font-medium">/ 100</span>
                  </div>
                  <div className="text-xs text-slate-600 flex flex-wrap gap-1">
                    {analysis.fillerBreakdown.length > 0 ? (
                      analysis.fillerBreakdown.map((f, i) => (
                        <span key={i} className="bg-slate-200/70 text-slate-700 px-1.5 py-0.5 rounded font-mono text-[11px]">
                          "{f.word}": {f.count}
                        </span>
                      ))
                    ) : (
                      <span className="text-emerald-700 font-medium">Zero filler words detected! Outstanding control.</span>
                    )}
                  </div>
                </div>

                {/* Speaking Pace Metric */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-bold tracking-wider text-slate-500">
                      Speaking Pace
                    </span>
                    <span className={`text-xs font-bold ${paceStatus.color}`}>
                      {paceStatus.label}
                    </span>
                  </div>
                  <div className="my-3 flex items-baseline gap-2">
                    <span className="text-4xl font-heading font-extrabold text-slate-900 tabular-nums">
                      {analysis.wpm}
                    </span>
                    <span className="text-sm text-slate-400 font-medium">WPM</span>
                  </div>
                  <div className="text-xs text-slate-600">
                    Target: 130–165 WPM. {analysis.paceAssessment}
                  </div>
                </div>

              </div>

              {/* 5-Pillar Score Cards */}
              <div>
                <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Core Evaluation Dimensions
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="p-3 rounded-xl border border-slate-200 bg-white">
                    <div className="text-xs text-slate-500 mb-1">Clarity</div>
                    <div className="text-xl font-bold text-slate-900 tabular-nums">{analysis.clarityScore}</div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${analysis.clarityScore}%` }} />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-200 bg-white">
                    <div className="text-xs text-slate-500 mb-1">Filler Control</div>
                    <div className="text-xl font-bold text-slate-900 tabular-nums">{analysis.fillerScore}</div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${analysis.fillerScore}%` }} />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-200 bg-white">
                    <div className="text-xs text-slate-500 mb-1">Pace & Cadence</div>
                    <div className="text-xl font-bold text-slate-900 tabular-nums">{analysis.paceScore}</div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${analysis.paceScore}%` }} />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-200 bg-white">
                    <div className="text-xs text-slate-500 mb-1">Structure (STAR)</div>
                    <div className="text-xl font-bold text-slate-900 tabular-nums">{analysis.structureScore}</div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${analysis.structureScore}%` }} />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-200 bg-white">
                    <div className="text-xs text-slate-500 mb-1">Vocabulary & Tone</div>
                    <div className="text-xl font-bold text-slate-900 tabular-nums">{analysis.vocabularyScore}</div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${analysis.vocabularyScore}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Strengths & Improvement Tips */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="p-4 rounded-xl border border-emerald-200/80 bg-emerald-50/40">
                  <div className="flex items-center gap-2 mb-3 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Key Strengths Observed
                  </div>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {analysis.strengths.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-600 font-bold mt-0.5">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl border border-amber-200/80 bg-amber-50/40">
                  <div className="flex items-center gap-2 mb-3 text-amber-800 font-bold text-xs uppercase tracking-wider">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    High-Impact Coaching Tips
                  </div>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {analysis.improvementTips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-600 font-bold mt-0.5">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* Audio Playback if available */}
              {audioUrl && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Volume2 className="w-5 h-5 text-indigo-600" />
                    <div>
                      <div className="text-xs font-semibold text-slate-800">Review Audio Playback</div>
                      <div className="text-[11px] text-slate-500">Listen back to your tone, pauses, and cadence</div>
                    </div>
                  </div>
                  <audio controls src={audioUrl} className="h-8 max-w-[240px]" />
                </div>
              )}

              {/* Next Practice Step */}
              {analysis.followUpQuestion && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">
                      AI Interviewer Follow-Up Question
                    </span>
                    <p className="text-sm font-semibold text-slate-900 mt-0.5">
                      "{analysis.followUpQuestion}"
                    </p>
                  </div>
                  {onPracticeFollowUp && (
                    <button
                      onClick={() => {
                        onClose();
                        onPracticeFollowUp(analysis.followUpQuestion!);
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm whitespace-nowrap flex items-center gap-1.5 transition-colors"
                    >
                      Practice Follow-Up
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}

            </>
          )}

          {activeTab === 'transcript' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                    Full Spoken Transcript
                  </span>
                  <span className="text-xs text-slate-400">
                    Amber highlights indicate detected filler words
                  </span>
                </div>
                {renderHighlightedTranscript()}
              </div>

              {/* Filler breakdown table */}
              <div>
                <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Detected Filler Word Breakdown
                </h4>
                {analysis.fillerBreakdown.length > 0 ? (
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-4">Filler Word</th>
                          <th className="py-2.5 px-4">Count</th>
                          <th className="py-2.5 px-4">Executive Substitute Tip</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {analysis.fillerBreakdown.map((row, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="py-2.5 px-4 font-mono font-bold text-amber-700">"{row.word}"</td>
                            <td className="py-2.5 px-4 font-mono tabular-nums">{row.count}x</td>
                            <td className="py-2.5 px-4 text-slate-600">{row.tip || 'Replace with 1-second calm pause.'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">No filler words detected. Clean articulation!</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'rewrite' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold uppercase text-indigo-900 tracking-wider">
                    Stellar Executive Polish (Before vs After)
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-4">
                  Notice how removing filler words, front-loading the action, and concluding with a quantitative impact elevates your response from conversational to authoritative.
                </p>

                <div className="space-y-3">
                  <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs">
                    <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">Your Delivery:</div>
                    <p className="text-slate-700 italic">"{transcript}"</p>
                  </div>

                  <div className="p-3.5 bg-white rounded-lg border border-indigo-300 text-xs shadow-sm">
                    <div className="text-[10px] font-bold uppercase text-indigo-700 mb-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-indigo-600" />
                      Executive Coach Model Response:
                    </div>
                    <p className="text-slate-900 font-medium leading-relaxed">
                      "{analysis.executiveRewrite}"
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => {
                    onClose();
                    onRetry();
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Try Again with Executive Rewrite
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Saved to student progress history.
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onRetry();
              }}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Practice Again
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
            >
              Done / Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
