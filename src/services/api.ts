import { PracticeQuestion, SpeechAnalysis, StudyPlan, UserStats } from '../types';

export const apiService = {
  async analyzeSpeech(params: {
    transcript: string;
    durationSeconds: number;
    questionPrompt?: string;
    category?: string;
    roleTarget?: string;
  }): Promise<SpeechAnalysis> {
    try {
      const res = await fetch('/api/analyze-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      if (data.success && data.analysis) {
        return data.analysis;
      }
      throw new Error(data.error || 'Speech analysis failed');
    } catch (err) {
      console.warn('Backend API request failed, utilizing client-side speech analyzer fallback:', err);
      return this.fallbackAnalyze(params);
    }
  },

  async generateQuestions(params: {
    category: string;
    difficulty: string;
    role?: string;
  }): Promise<PracticeQuestion[]> {
    try {
      const res = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.questions)) {
        return data.questions.map((q: any, idx: number) => ({
          ...q,
          id: q.id || `gen-${Date.now()}-${idx}`,
          category: params.category as any,
          difficulty: params.difficulty as any,
        }));
      }
      throw new Error('Failed to generate questions');
    } catch (err) {
      console.warn('Falling back to local question generator:', err);
      return [
        {
          id: `gen-${Date.now()}-1`,
          question: `Can you walk me through a high-stakes scenario in ${params.role || 'your field'} where you had to pivot quickly?`,
          category: params.category as any,
          difficulty: params.difficulty as any,
          suggestedDurationSeconds: 90,
          coachTip: 'State the trigger event, the rapid trade-off assessment, and the stabilized outcome.',
          framework: 'STAR / Pivot Framework',
          keyTalkingPoints: ['Initial baseline plan', 'The disruptive event', 'Mitigation actions', 'Final metric']
        },
        {
          id: `gen-${Date.now()}-2`,
          question: `How do you explain a highly intricate concept to an audience with zero background knowledge?`,
          category: params.category as any,
          difficulty: params.difficulty as any,
          suggestedDurationSeconds: 75,
          coachTip: 'Use a simple everyday analogy, avoid jargon, and verify understanding.',
          framework: 'Feynman Technique',
          keyTalkingPoints: ['Concrete analogy', 'Stepwise intuition', 'Checking feedback']
        }
      ];
    }
  },

  async generateStudyPlan(params: {
    userStats: any;
    targetRole: string;
    dailyMinutes: number;
    targetGoal?: string;
  }): Promise<StudyPlan> {
    try {
      const res = await fetch('/api/generate-study-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.success && data.plan) {
        return {
          id: `plan-${Date.now()}`,
          userId: params.userStats?.userId || 'current-user',
          createdAt: new Date().toISOString().split('T')[0],
          targetRole: params.targetRole,
          dailyMinutes: params.dailyMinutes,
          ...data.plan
        };
      }
      throw new Error('Failed to parse study plan');
    } catch (err) {
      console.warn('Falling back to structured local study plan generator:', err);
      return {
        id: `plan-gen-${Date.now()}`,
        userId: params.userStats?.userId || 'current-user',
        createdAt: new Date().toISOString().split('T')[0],
        planTitle: `Personalized ${params.targetRole} Communication Roadmap`,
        summary: `A data-driven 4-week acceleration plan focusing on eliminating filler words, optimizing speech tempo to 140 WPM, and mastering STAR storytelling.`,
        estimatedImprovement: '+20% clarity boost, 80% filler word reduction',
        focusAreas: ['Filler Word Elimination', 'Pacing Calibration (130-160 WPM)', 'Executive Presence & Pitch Control'],
        targetRole: params.targetRole,
        dailyMinutes: params.dailyMinutes,
        weeks: [
          {
            weekNumber: 1,
            theme: 'Breathing Mechanics & Filler Substitution',
            goal: 'Eliminate involuntary vocal fillers using deliberate silent pauses.',
            drills: [
              {
                dayNumber: 1,
                title: 'The Silent Pause Substitution Drill',
                timeMinutes: params.dailyMinutes,
                drillType: 'Filler Elimination',
                instructions: 'Record a 60-second summary of your career. Whenever you anticipate saying "um", hold silence for 1 beat.',
                exercisePrompt: 'Deliver introduction with 0 filler words.',
                successMetric: '0 detected filler words.',
                completed: false
              },
              {
                dayNumber: 2,
                title: 'Consonant Articulation & Tongue Agility',
                timeMinutes: params.dailyMinutes,
                drillType: 'Vocal Warmup',
                instructions: 'Practice articulatory warmups focusing on distinct stop consonants: P, T, K, B, D, G.',
                exercisePrompt: 'Tongue twister drill: "Peter Piper picked a peck of pickled peppers."',
                successMetric: 'Crisp articulation without trailing mumbling.',
                completed: false
              }
            ]
          }
        ]
      };
    }
  },

  // Fallback client-side speech analyzer
  fallbackAnalyze(params: {
    transcript: string;
    durationSeconds: number;
    questionPrompt?: string;
  }): SpeechAnalysis {
    const text = params.transcript;
    const duration = Math.max(params.durationSeconds || 30, 5);
    const words = text.toLowerCase().match(/\b[a-z']+\b/g) || [];
    const wordCount = words.length;
    const computedWpm = Math.round((wordCount / duration) * 60);

    const fillerDictionary = ['um', 'uh', 'like', 'you know', 'basically', 'actually', 'sort of', 'kind of', 'right', 'so yeah', 'i mean'];
    const fillerMap = new Map<string, number>();
    let totalFillers = 0;

    fillerDictionary.forEach((filler) => {
      const regex = new RegExp(`\\b${filler}\\b`, 'gi');
      const matches = text.match(regex);
      if (matches && matches.length > 0) {
        fillerMap.set(filler, matches.length);
        totalFillers += matches.length;
      }
    });

    const fillerPercentage = wordCount > 0 ? Number(((totalFillers / wordCount) * 100).toFixed(1)) : 0;
    const fillerScore = Math.max(10, Math.min(100, Math.round(100 - (totalFillers / Math.max(wordCount, 1)) * 400)));

    let paceScore = 85;
    let paceAssessment = 'Optimal Conversational';
    if (computedWpm < 115) {
      paceScore = 65;
      paceAssessment = 'Slightly slow / hesitating';
    } else if (computedWpm >= 115 && computedWpm <= 130) {
      paceScore = 78;
      paceAssessment = 'Measured / steady';
    } else if (computedWpm > 130 && computedWpm <= 165) {
      paceScore = 95;
      paceAssessment = 'Optimal Conversational (130-165 WPM)';
    } else if (computedWpm > 165 && computedWpm <= 185) {
      paceScore = 78;
      paceAssessment = 'Brisk / Energetic';
    } else {
      paceScore = 60;
      paceAssessment = 'Too fast / rushing';
    }

    const clarityScore = Math.min(95, Math.max(60, 85 - (totalFillers * 3)));
    const structureScore = text.length > 150 ? 84 : 70;
    const vocabularyScore = 80;
    const overallScore = Math.round(
      clarityScore * 0.25 +
      fillerScore * 0.25 +
      paceScore * 0.2 +
      structureScore * 0.15 +
      vocabularyScore * 0.15
    );

    const fillerBreakdown = Array.from(fillerMap.entries()).map(([word, count]) => ({
      word,
      count,
      tip: `Replace "${word}" with an intentional silent pause.`
    }));

    return {
      overallScore,
      clarityScore,
      fillerScore,
      paceScore,
      structureScore,
      vocabularyScore,
      wpm: computedWpm,
      paceAssessment,
      totalFillerCount: totalFillers,
      fillerPercentage,
      fillerBreakdown,
      strengths: [
        'Direct engagement with the core prompt premise.',
        'Conversational tone and steady natural pitch.',
        'Good baseline pacing suited for technical and behavioral interviews.'
      ],
      improvementTips: [
        'Train yourself to hold a 1-second silence whenever searching for the next thought.',
        'Frame responses using Situation, Action, and measurable Result for maximum persuasiveness.',
        'Use concise executive terminology to elevate authority.'
      ],
      executiveRewrite: text.replace(/\b(um|uh|like|you know|basically)\b/gi, '').replace(/\s{2,}/g, ' ').trim(),
      followUpQuestion: 'How would you measure the success of this initiative 6 months after delivery?'
    };
  }
};
