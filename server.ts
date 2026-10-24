import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '25mb' }));

// Initialize GoogleGenAI SDK with standard User-Agent header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper to sanitize JSON response if wrapped in markdown blocks
function cleanJsonText(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return cleaned;
}

// 1. Analyze Speech & Identify Filler Words + Pace
app.post('/api/analyze-speech', async (req, res) => {
  try {
    const { transcript, durationSeconds, questionPrompt, category, roleTarget } = req.body;

    if (!transcript || typeof transcript !== 'string' || transcript.trim().length === 0) {
      return res.status(400).json({ error: 'Valid speech transcript is required' });
    }

    const duration = Math.max(Number(durationSeconds) || 30, 5);
    const wordCount = transcript.trim().split(/\s+/).filter(Boolean).length;
    const computedWpm = Math.round((wordCount / duration) * 60);

    const prompt = `You are SpeakSmart, an expert executive speech coach and interview trainer.
Analyze the following speech transcript delivered by a student preparing for:
Question: "${questionPrompt || 'General Practice Response'}"
Category: "${category || 'Interview'}"
Target Role/Field: "${roleTarget || 'Professional / General'}"
Duration: ${duration} seconds
Word Count: ${wordCount} words
Calculated Words Per Minute (WPM): ${computedWpm} WPM

Transcript:
"""${transcript}"""

Instructions:
1. Accurately detect all filler words and disfluencies (e.g. "um", "uh", "like", "you know", "basically", "actually", "sort of", "kind of", "so yeah", "right?", "I mean"). Count them carefully.
2. Evaluate speaking pace:
   - < 115 WPM: Too slow / hesitating
   - 115 - 130 WPM: Slightly slow / measured
   - 131 - 165 WPM: Optimal conversational pace
   - 166 - 185 WPM: Brisk / energetic
   - > 185 WPM: Too fast / rushing
3. Score the speaker across 5 core dimensions from 0 to 100:
   - clarityScore: articulation, precision, directness
   - fillerScore: filler word control (100 = 0 fillers, lower as filler density rises)
   - paceScore: cadence, rhythm, breathing balance
   - structureScore: logical organization, STAR method adherence if behavioral, clear intro/body/conclusion
   - vocabularyScore: professional register, descriptive language, lack of slang
   - overallScore: weighted holistic score (0-100)
4. Highlight the transcript by tagging exact filler occurrences or providing an annotated breakdown.
5. Provide 3 specific strengths, 3 direct opportunities for improvement, an executive rewrite demonstrating how a top candidate would phrase this, and a targeted follow-up question.

Return strictly valid JSON adhering to the specified schema without any markdown formatting.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.INTEGER, description: 'Overall score from 0 to 100' },
            clarityScore: { type: Type.INTEGER, description: 'Clarity and articulation score 0 to 100' },
            fillerScore: { type: Type.INTEGER, description: 'Filler word control score 0 to 100' },
            paceScore: { type: Type.INTEGER, description: 'Pacing and cadence score 0 to 100' },
            structureScore: { type: Type.INTEGER, description: 'Structure and coherence score 0 to 100' },
            vocabularyScore: { type: Type.INTEGER, description: 'Vocabulary and professional tone score 0 to 100' },
            wpm: { type: Type.INTEGER, description: 'Calculated or verified words per minute' },
            paceAssessment: {
              type: Type.STRING,
              description: 'Short descriptor, e.g. "Optimal Conversational", "Slightly Rushed", "Hesitant"'
            },
            totalFillerCount: { type: Type.INTEGER, description: 'Total count of detected filler words' },
            fillerPercentage: { type: Type.NUMBER, description: 'Percentage of total words that were fillers' },
            fillerBreakdown: {
              type: Type.ARRAY,
              description: 'Breakdown of each detected filler word with count and advice',
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING },
                  count: { type: Type.INTEGER },
                  tip: { type: Type.STRING }
                },
                required: ['word', 'count']
              }
            },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3 concrete things the speaker did well'
            },
            improvementTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3 actionable techniques to improve'
            },
            executiveRewrite: {
              type: Type.STRING,
              description: 'Exemplary executive-level rewrite of the response preserving the speaker core idea'
            },
            structureEvaluation: {
              type: Type.STRING,
              description: 'Brief feedback on the answer structure (e.g. STAR method components)'
            },
            followUpQuestion: {
              type: Type.STRING,
              description: 'Realistic follow-up question an interviewer would ask next'
            }
          },
          required: [
            'overallScore',
            'clarityScore',
            'fillerScore',
            'paceScore',
            'structureScore',
            'vocabularyScore',
            'wpm',
            'paceAssessment',
            'totalFillerCount',
            'fillerBreakdown',
            'strengths',
            'improvementTips',
            'executiveRewrite',
            'followUpQuestion'
          ]
        }
      }
    });

    const parsed = JSON.parse(cleanJsonText(response.text || '{}'));
    return res.json({
      success: true,
      analysis: {
        ...parsed,
        wpm: parsed.wpm || computedWpm,
        wordCount,
        durationSeconds: duration
      }
    });
  } catch (error: any) {
    console.error('Error analyzing speech:', error);
    return res.status(500).json({
      error: 'Failed to analyze speech. Please try again.',
      details: error?.message || 'Unknown error'
    });
  }
});

// 2. Generate Practice Questions by Category & Role
app.post('/api/generate-questions', async (req, res) => {
  try {
    const { category, difficulty, role } = req.body;

    const prompt = `Generate 5 high-yield, realistic practice questions for:
Category: ${category || 'Behavioral Interview'}
Difficulty: ${difficulty || 'Intermediate'}
Target Career/Context: ${role || 'General Professional'}

For each question provide:
- question text
- category
- difficulty
- suggestedDurationSeconds (e.g. 60 to 120)
- keyTalkingPoints (what a strong answer touches on)
- coachTip (strategic guidance on framing)
- framework (e.g., "STAR Method", "Problem-Action-Result", "PREP")

Return strictly valid JSON adhering to schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              question: { type: Type.STRING },
              category: { type: Type.STRING },
              difficulty: { type: Type.STRING },
              suggestedDurationSeconds: { type: Type.INTEGER },
              keyTalkingPoints: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              coachTip: { type: Type.STRING },
              framework: { type: Type.STRING }
            },
            required: ['question', 'category', 'difficulty', 'suggestedDurationSeconds', 'coachTip']
          }
        }
      }
    });

    const questions = JSON.parse(cleanJsonText(response.text || '[]'));
    return res.json({ success: true, questions });
  } catch (error: any) {
    console.error('Error generating questions:', error);
    return res.status(500).json({ error: 'Failed to generate questions', details: error?.message });
  }
});

// 3. Generate Personalized Study Plan Based on Performance
app.post('/api/generate-study-plan', async (req, res) => {
  try {
    const { userStats, targetRole, dailyMinutes, targetGoal } = req.body;

    const prompt = `You are a personalized speech pathologist and communication coach.
Generate a tailored 4-week structured speech improvement curriculum for a student with the following profile:
- Target Role: ${targetRole || 'Software Engineer / Professional'}
- Available Daily Commitment: ${dailyMinutes || 15} minutes/day
- Stated Goal: ${targetGoal || 'Master interview responses with 0 filler words and steady pace'}
- Performance Data:
  Average Overall Score: ${userStats?.avgScore || 72}/100
  Average Filler Word Density: ${userStats?.avgFillersPerMin || 4.2} fillers/min
  Average Speaking Pace: ${userStats?.avgWpm || 168} WPM
  Weakest Areas: ${JSON.stringify(userStats?.weakAreas || ['Filler words (like, um)', 'Pacing under pressure'])}
  Sessions Completed: ${userStats?.sessionCount || 3}

Create a structured 4-week program:
- Week 1: Foundational Breath & Filler Elimination
- Week 2: Cadence, Pause Power & Intonation
- Week 3: Structuring Complex Answers (STAR, PREP, Executive Summary)
- Week 4: High-Pressure Mock Mastery & Spontaneous Fluency

Each week must contain 5 daily actionable drills with:
- dayNumber (1-5)
- title (e.g. "The Silent Pause Substitution Drill")
- timeMinutes
- drillType ("Vocal Warmup", "Filler Elimination", "Pacing Meter", "Mock Question")
- instructions
- exercisePrompt (e.g. specific tongue twister or response prompt)
- successMetric (e.g., "< 1 filler word in 90 seconds")

Return strictly valid JSON adhering to schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            planTitle: { type: Type.STRING },
            summary: { type: Type.STRING },
            estimatedImprovement: { type: Type.STRING },
            focusAreas: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            weeks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  weekNumber: { type: Type.INTEGER },
                  theme: { type: Type.STRING },
                  goal: { type: Type.STRING },
                  drills: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        dayNumber: { type: Type.INTEGER },
                        title: { type: Type.STRING },
                        timeMinutes: { type: Type.INTEGER },
                        drillType: { type: Type.STRING },
                        instructions: { type: Type.STRING },
                        exercisePrompt: { type: Type.STRING },
                        successMetric: { type: Type.STRING }
                      },
                      required: ['dayNumber', 'title', 'timeMinutes', 'drillType', 'instructions', 'exercisePrompt', 'successMetric']
                    }
                  }
                },
                required: ['weekNumber', 'theme', 'goal', 'drills']
              }
            }
          },
          required: ['planTitle', 'summary', 'estimatedImprovement', 'focusAreas', 'weeks']
        }
      }
    });

    const plan = JSON.parse(cleanJsonText(response.text || '{}'));
    return res.json({ success: true, plan });
  } catch (error: any) {
    console.error('Error generating study plan:', error);
    return res.status(500).json({ error: 'Failed to generate study plan', details: error?.message });
  }
});

// Vite middleware setup
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`SpeakSmart Server running on port ${port} (mode: ${isProd ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
