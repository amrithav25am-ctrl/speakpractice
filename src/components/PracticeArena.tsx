import React, { useState, useRef, useEffect } from 'react';
import { PracticeQuestion, QuestionCategory, SpeechAnalysis, PracticeSession } from '../types';
import { SAMPLE_TEST_RECORDINGS } from '../data/mockData';
import { apiService } from '../services/api';
import { storageService } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import { 
  Mic, 
  Square, 
  Play, 
  RotateCcw, 
  Sparkles, 
  Timer, 
  Volume2, 
  Lightbulb, 
  ChevronRight, 
  HelpCircle, 
  Check, 
  AlertCircle,
  FileText,
  VolumeX,
  FastForward,
  Cpu
} from 'lucide-react';

interface PracticeArenaProps {
  questions: PracticeQuestion[];
  selectedQuestion: PracticeQuestion;
  onSelectQuestion: (q: PracticeQuestion) => void;
  onAnalysisComplete: (session: PracticeSession) => void;
  onOpenStudyPlan: () => void;
}

export const PracticeArena: React.FC<PracticeArenaProps> = ({
  questions,
  selectedQuestion,
  onSelectQuestion,
  onAnalysisComplete,
  onOpenStudyPlan
}) => {
  const { currentUser } = useAuth();

  // State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showCoachTips, setShowCoachTips] = useState(true);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [manualEditMode, setManualEditMode] = useState(false);
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false);

  // Audio & Speech Recognition Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecordingCleanup();
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, []);

  const stopRecordingCleanup = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch (e) {}
    }
  };

  // Start Voice Recording & Speech Recognition
  const startRecording = async () => {
    setErrorMsg(null);
    setTranscript('');
    setRecordingDuration(0);
    audioChunksRef.current = [];
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Setup Web Audio API visualizer
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      drawVisualizer();

      // Setup MediaRecorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(250);

      // Setup Web Speech API for real-time live transcription
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let fullText = '';
          for (let i = 0; i < event.results.length; i++) {
            fullText += event.results[i][0].transcript + ' ';
          }
          setTranscript(fullText.trim());
        };

        recognition.onerror = (e: any) => {
          console.warn('Speech recognition warning:', e.error);
        };

        recognition.start();
        recognitionRef.current = recognition;
      }

      setIsRecording(true);

      // Start elapsed timer
      timerIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

    } catch (err: any) {
      console.error('Microphone access denied or error:', err);
      setErrorMsg('Microphone access was denied or not supported in this browser. You can still use the 1-Click Test Samples or type/paste your speech below to get full AI feedback!');
      setIsRecording(false);
    }
  };

  // Stop Recording
  const stopRecording = () => {
    setIsRecording(false);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
  };

  // Visualizer Canvas Loop
  const drawVisualizer = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bufferLength) * 2;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.9;
        ctx.fillStyle = `rgba(99, 102, 241, ${0.4 + (dataArray[i] / 255) * 0.6})`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);
        x += barWidth;
      }
    };

    render();
  };

  // Submit to Gemini AI Speech Analysis
  const handleAnalyze = async () => {
    if (!transcript.trim()) {
      setErrorMsg('Please record speech or enter your transcript before analyzing.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg(null);

    const effectiveDuration = recordingDuration > 4 ? recordingDuration : Math.max(Math.round(transcript.split(' ').length / 2.5), 15);

    try {
      const analysis: SpeechAnalysis = await apiService.analyzeSpeech({
        transcript,
        durationSeconds: effectiveDuration,
        questionPrompt: selectedQuestion.question,
        category: selectedQuestion.category,
        roleTarget: currentUser.targetRole
      });

      const newSession: PracticeSession = {
        id: `sess-${Date.now()}`,
        userId: currentUser.id,
        date: new Date().toISOString(),
        questionId: selectedQuestion.id,
        questionText: selectedQuestion.question,
        category: selectedQuestion.category,
        transcript,
        durationSeconds: effectiveDuration,
        analysis,
        audioUrl: audioUrl || undefined
      };

      storageService.saveSession(newSession);
      setIsAnalyzing(false);
      onAnalysisComplete(newSession);
    } catch (err: any) {
      console.error('Error during analysis:', err);
      setIsAnalyzing(false);
      setErrorMsg(err.message || 'Analysis encountered an error. Please try again.');
    }
  };

  // Load a pre-made test sample
  const handleLoadSample = (sample: typeof SAMPLE_TEST_RECORDINGS[0]) => {
    stopRecording();
    setTranscript(sample.transcript);
    setRecordingDuration(sample.duration);
    setErrorMsg(null);
  };

  // Generate a new AI question on the fly
  const handleGenerateQuestion = async () => {
    setIsGeneratingQuestion(true);
    try {
      const generated = await apiService.generateQuestions({
        category: selectedQuestion.category,
        difficulty: selectedQuestion.difficulty,
        role: currentUser.targetRole
      });
      if (generated && generated.length > 0) {
        const newQ = generated[0];
        storageService.addQuestion(newQ);
        onSelectQuestion(newQ);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingQuestion(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const wordCount = transcript.trim() ? transcript.trim().split(/\s+/).length : 0;
  const currentWpm = recordingDuration > 3 ? Math.round((wordCount / recordingDuration) * 60) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Controls: Category & Question Switcher */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>Practicing for {currentUser.targetRole}</span>
              <span aria-hidden="true">·</span>
              <span>{selectedQuestion.category}</span>
              <span aria-hidden="true">·</span>
              <span className="font-medium text-indigo-600">{selectedQuestion.difficulty}</span>
            </div>
            <h1 className="font-heading text-lg sm:text-xl font-bold text-slate-900 leading-snug">
              {selectedQuestion.question}
            </h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleGenerateQuestion}
              disabled={isGeneratingQuestion}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg border border-indigo-200/60 transition-colors disabled:opacity-50"
              title="Generate a fresh tailored interview question with Gemini"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isGeneratingQuestion ? 'Generating...' : 'New AI Question'}
            </button>
            <button
              onClick={() => setShowCoachTips(!showCoachTips)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              {showCoachTips ? 'Hide Tips' : 'Coach Hint'}
            </button>
          </div>
        </div>

        {/* Coach Hint Drawer */}
        {showCoachTips && (
          <div className="p-3.5 bg-amber-50/70 border border-amber-200/70 rounded-xl text-xs space-y-2">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-amber-900">
                <span className="font-bold">Coach Framework ({selectedQuestion.framework || 'STAR'}):</span>{' '}
                {selectedQuestion.coachTip}
              </div>
            </div>

            {selectedQuestion.keyTalkingPoints && selectedQuestion.keyTalkingPoints.length > 0 && (
              <div className="pl-6 flex flex-wrap items-center gap-2 text-[11px] text-amber-800">
                <span className="font-semibold text-amber-900">Key Points to Touch On:</span>
                {selectedQuestion.keyTalkingPoints.map((pt, i) => (
                  <span key={i} className="bg-amber-100/80 px-2 py-0.5 rounded text-amber-900">
                    {pt}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Main Studio Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Speech Recorder & Live Transcript */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between min-h-[360px]">
            
            {/* Studio Header & Metrics Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-slate-700 text-xs font-semibold">
                  <Timer className="w-4 h-4 text-indigo-600" />
                  <span className="font-mono text-base tabular-nums">
                    {formatTimer(recordingDuration)}
                  </span>
                  <span className="text-slate-400 font-normal">
                    / {formatTimer(selectedQuestion.suggestedDurationSeconds)} target
                  </span>
                </div>

                <div className="hidden sm:flex items-center gap-1.5 text-slate-700 text-xs">
                  <span className="text-slate-400">Words:</span>
                  <span className="font-mono font-bold tabular-nums">{wordCount}</span>
                </div>

                {isRecording && currentWpm > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-mono">
                    <span>{currentWpm} WPM</span>
                  </div>
                )}
              </div>

              {/* Right mode toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setManualEditMode(!manualEditMode)}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  {manualEditMode ? 'Close Edit' : 'Edit Transcript'}
                </button>
              </div>
            </div>

            {/* Audio Wave Visualizer during active recording */}
            {isRecording && (
              <div className="my-4 py-2 flex flex-col items-center justify-center bg-slate-900 rounded-xl p-4 text-white">
                <div className="text-xs text-indigo-300 font-semibold mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  Recording Live Speech & Detecting Cadence...
                </div>
                <canvas ref={canvasRef} width={400} height={60} className="w-full max-w-md h-14" />
              </div>
            )}

            {/* Transcript Preview Area */}
            <div className="my-4 flex-1">
              {manualEditMode ? (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    Spoken Transcript (Live speech transcription or edit text directly):
                  </label>
                  <textarea
                    rows={6}
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    placeholder="Type or paste your spoken answer here, or click Record to transcribe with your microphone..."
                    className="w-full p-3.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed font-sans"
                  />
                </div>
              ) : (
                <div className="bg-slate-50/70 rounded-xl p-4 min-h-[160px] border border-slate-200/70 flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Live Spoken Transcript Preview
                    </div>
                    {transcript ? (
                      <p className="text-sm text-slate-800 leading-relaxed font-normal">
                        {transcript}
                      </p>
                    ) : (
                      <div className="text-slate-400 text-xs italic flex flex-col items-center justify-center py-8">
                        <Mic className="w-8 h-8 text-slate-300 mb-2" />
                        Press "Start Recording" to speak your answer, or pick a test sample on the right.
                      </div>
                    )}
                  </div>

                  {transcript && (
                    <div className="text-right mt-2 text-[11px] text-slate-400">
                      {wordCount} words spoken
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Audio Playback bar if recorded */}
            {audioUrl && !isRecording && (
              <div className="mb-4 p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-semibold text-indigo-900">Audio Recorded</span>
                  <span className="text-xs text-indigo-600">({formatTimer(recordingDuration)})</span>
                </div>
                <audio
                  ref={audioElementRef}
                  src={audioUrl}
                  controls
                  className="h-8 max-w-[200px]"
                />
              </div>
            )}

            {/* Error Message */}
            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Bottom Primary Controls */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm shadow-indigo-200 transition-all active:scale-[0.98]"
                  >
                    <Mic className="w-4 h-4" />
                    Start Speaking
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-sm shadow-rose-200 transition-all animate-pulse"
                  >
                    <Square className="w-4 h-4 fill-white" />
                    Stop Recording
                  </button>
                )}

                {transcript && !isRecording && (
                  <button
                    onClick={() => {
                      setTranscript('');
                      setRecordingDuration(0);
                      if (audioUrl) {
                        URL.revokeObjectURL(audioUrl);
                        setAudioUrl(null);
                      }
                    }}
                    className="p-2.5 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                    title="Reset speech"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Submit for AI Speech Coach Analysis */}
              <button
                onClick={handleAnalyze}
                disabled={!transcript.trim() || isRecording || isAnalyzing}
                className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-4 h-4 text-indigo-400" />
                {isAnalyzing ? 'Analyzing Speech with Gemini...' : 'Analyze Speech & Fillers'}
              </button>
            </div>

          </div>
        </div>

        {/* Right Col: 1-Click Test Drive Samples & Study Plan Promotion */}
        <div className="space-y-4">
          
          {/* Quick Demo Test Audio Samples */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                1-Click Test Drive Samples
              </span>
              <span className="text-[11px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-semibold">
                Instant Try
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Want to see how SpeakSmart detects filler words and speaking cadence without recording? Click any test profile:
            </p>

            <div className="space-y-2.5">
              {SAMPLE_TEST_RECORDINGS.map((sample, idx) => (
                <div
                  key={idx}
                  onClick={() => handleLoadSample(sample)}
                  className="p-3 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 cursor-pointer transition-all text-left"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-1">
                    <span className="truncate pr-2">{sample.label}</span>
                    <span className="text-[11px] font-mono text-slate-400 shrink-0">
                      {sample.duration}s
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 italic">
                    "{sample.transcript}"
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Practice Routine & Daily Goal */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-5 text-white shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-indigo-200 mb-2">
                <span className="uppercase font-bold tracking-wider">Your Daily Plan</span>
                <span className="text-amber-400 font-bold">{currentUser.streakDays}d streak</span>
              </div>
              <h3 className="font-heading text-base font-bold text-white mb-1">
                4-Week Fluency Roadmap
              </h3>
              <p className="text-xs text-indigo-200 leading-relaxed mb-4">
                Structured drills targeting filler words, vocal cadence, and high-stakes STAR behavioral answers.
              </p>
            </div>

            <button
              onClick={onOpenStudyPlan}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              Open Daily Study Plan
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
