import { PracticeQuestion, UserAccount, PracticeSession, StudyPlan } from '../types';

export const DEFAULT_QUESTIONS: PracticeQuestion[] = [
  {
    id: 'q-1',
    question: 'Tell me about yourself and why you are interested in this position.',
    category: 'Elevator Pitch & Intro',
    difficulty: 'Beginner',
    suggestedDurationSeconds: 75,
    coachTip: 'Use the Present-Past-Future framework: What you currently do, key highlights from your background, and why this specific role is your logical next step.',
    framework: 'Present-Past-Future',
    keyTalkingPoints: ['Current role/studies', '1-2 standout accomplishments', 'Passions & core skills', 'Alignment with team mission'],
    role: 'General / All Disciplines'
  },
  {
    id: 'q-2',
    question: 'Describe a complex technical challenge you faced. How did you break it down and deliver a solution?',
    category: 'Technical & System',
    difficulty: 'Advanced',
    suggestedDurationSeconds: 120,
    coachTip: 'Focus 20% on the problem, 60% on your specific engineering decisions/trade-offs, and 20% on measurable outcomes.',
    framework: 'STAR (Situation, Task, Action, Result)',
    keyTalkingPoints: ['Root cause diagnosis', 'Trade-offs between alternatives', 'Collaborative execution', 'Metrics & user impact'],
    role: 'Software & Technology'
  },
  {
    id: 'q-3',
    question: 'Tell me about a time you had a significant disagreement with a teammate or stakeholder. How did you resolve it?',
    category: 'Leadership & Conflict',
    difficulty: 'Intermediate',
    suggestedDurationSeconds: 90,
    coachTip: 'Avoid casting blame. Emphasize empathetic listening, anchoring on data and shared objectives, and committing to the final outcome.',
    framework: 'Conflict Resolution Matrix',
    keyTalkingPoints: ['Context of disagreement', 'Seeking to understand their viewpoint', 'Data-driven discussion', 'Positive post-resolution relationship'],
    role: 'Product / Management / Engineering'
  },
  {
    id: 'q-4',
    question: 'Open this presentation: Pitch a novel AI tool that saves college students 5 hours of study time each week.',
    category: 'Presentation & Keynote',
    difficulty: 'Intermediate',
    suggestedDurationSeconds: 60,
    coachTip: 'Hook your audience immediately with an emotional pain point or vivid question. Avoid starting with "Hi, my name is and today I will talk about..."',
    framework: 'Hook-Story-Offer',
    keyTalkingPoints: ['Relatable student struggle', 'Contrast of wasted vs productive hours', 'The transformative promise', 'Call to attention'],
    role: 'Product & Public Speaking'
  },
  {
    id: 'q-5',
    question: 'Tell me about a time you failed to meet a deadline or commitment. What went wrong and what did you learn?',
    category: 'Behavioral & STAR',
    difficulty: 'Intermediate',
    suggestedDurationSeconds: 90,
    coachTip: 'Demonstrate deep accountability. Never say "I have never missed a deadline." Show proactive communication and institutional preventive fixes.',
    framework: 'STAR + Post-Mortem',
    keyTalkingPoints: ['Unexpected roadblock', 'Proactive stakeholder escalation', 'Corrective mitigation', 'Process improvement established'],
    role: 'All Fields'
  },
  {
    id: 'q-6',
    question: 'Why should this committee award you this fellowship or graduate research scholarship?',
    category: 'Academic & Scholarship',
    difficulty: 'Advanced',
    suggestedDurationSeconds: 90,
    coachTip: 'Connect your personal story and curiosity to tangible academic rigor and high-impact contribution to society.',
    framework: 'Passion-Impact-Vision',
    keyTalkingPoints: ['Origin of research interest', 'Methodological foundation', 'Anticipated publication or societal impact', 'Why this institution'],
    role: 'Academic & Research'
  },
  {
    id: 'q-7',
    question: 'Walk me through a project where you had to lead without formal authority.',
    category: 'Leadership & Conflict',
    difficulty: 'Advanced',
    suggestedDurationSeconds: 90,
    coachTip: 'Show how you inspired peers through vision, clarity, unblocking obstacles, and recognizing contributions rather than dictating orders.',
    framework: 'Influence Without Authority',
    keyTalkingPoints: ['Ambiguous situation', 'Building consensus', 'Facilitating sprint milestones', 'Shared victory'],
    role: 'Engineering & Management'
  },
  {
    id: 'q-8',
    question: 'Deliver your 60-second elevator pitch to a venture capitalist in an elevator.',
    category: 'Elevator Pitch & Intro',
    difficulty: 'Intermediate',
    suggestedDurationSeconds: 60,
    coachTip: 'State the huge problem, your unfair advantage, customer traction, and the exact ask.',
    framework: 'Problem-Solution-Traction-Ask',
    keyTalkingPoints: ['Problem scale', 'Proprietary insight', 'Early proof points', 'Target market size'],
    role: 'Entrepreneurship & Tech'
  }
];

export const DEFAULT_USERS: UserAccount[] = [
  {
    id: 'user-amritha',
    name: 'Amritha Vasudevan',
    email: 'amrithavasudevan4@gmail.com',
    targetRole: 'Software Engineer & AI Specialist',
    experienceLevel: 'Student',
    focusGoal: 'Eliminate "um" and "like", maintain steady 140 WPM cadence in behavioral rounds.',
    streakDays: 4,
    lastPracticedDate: new Date().toISOString(),
    totalSpeakingSeconds: 2640,
    joinedDate: '2026-09-15'
  },
  {
    id: 'user-elena',
    name: 'Elena Rostova',
    email: 'elena.rostova@example.edu',
    targetRole: 'Product Manager & MBA Candidate',
    experienceLevel: 'Recent Grad',
    focusGoal: 'Master structured STAR storytelling and authoritative executive presence.',
    streakDays: 7,
    lastPracticedDate: new Date().toISOString(),
    totalSpeakingSeconds: 4320,
    joinedDate: '2026-08-20'
  },
  {
    id: 'user-marcus',
    name: 'Marcus Vance',
    email: 'marcus.vance@example.org',
    targetRole: 'Management Consultant',
    experienceLevel: 'Mid-Career',
    focusGoal: 'Sharpen concise hypothesis-driven communication and reduce rushing under pressure.',
    streakDays: 2,
    lastPracticedDate: new Date().toISOString(),
    totalSpeakingSeconds: 1980,
    joinedDate: '2026-10-01'
  }
];

export const SAMPLE_TEST_RECORDINGS = [
  {
    label: 'Sample: Product Pitch with Frequent Fillers ("like", "um")',
    duration: 38,
    transcript: "So, um, basically our project is called NoteFlow. It is, like, an AI note taking app designed for college students. And, you know, whenever you are in a lecture, like, professors speak super fast, and you sort of miss half the slides. So um, with NoteFlow, it automatically transcribes and, like, builds study flashcards in real time. We think, you know, it's pretty cool.",
  },
  {
    label: 'Sample: Rushed STAR Story (185+ WPM)',
    duration: 28,
    transcript: "When I was leading the frontend migration we noticed our bundle size was spiking significantly because we imported heavy visualization libraries without tree shaking so I immediately conducted an audit found two redundant charting packages replaced them with a lightweight custom canvas component and deployed it within forty eight hours which dropped initial page load time from three point two seconds to one point one seconds across all mobile devices.",
  },
  {
    label: 'Sample: High-Caliber Executive Presentation Response',
    duration: 44,
    transcript: "During my previous internship at Apex Systems, our primary goal was to streamline our API response latency. I noticed that unindexed database queries accounted for seventy percent of our bottle-necks. I initiated a targeted performance sprint, designed composite indexing strategies, and introduced Redis caching for frequent endpoints. Within two weeks, our ninety-fifth percentile latency dropped by forty-two percent.",
  }
];

export const INITIAL_SESSIONS: PracticeSession[] = [
  {
    id: 'sess-1',
    userId: 'user-amritha',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    questionId: 'q-1',
    questionText: 'Tell me about yourself and why you are interested in this position.',
    category: 'Elevator Pitch & Intro',
    durationSeconds: 70,
    transcript: 'So, um, I am currently a senior computer science student. I have worked on, like, distributed systems and full stack applications. Um, you know, I really love building user interfaces that are fast and intuitive. And basically, when I saw this role, I thought it would be a, like, perfect fit for my skills.',
    analysis: {
      overallScore: 71,
      clarityScore: 75,
      fillerScore: 58,
      paceScore: 74,
      structureScore: 72,
      vocabularyScore: 76,
      wpm: 122,
      paceAssessment: 'Slightly slow / hesitating',
      totalFillerCount: 6,
      fillerPercentage: 9.2,
      fillerBreakdown: [
        { word: 'um', count: 3, tip: 'Replace "um" with a deliberate 1-second silence.' },
        { word: 'like', count: 2, tip: 'Remove "like" when describing your technical specialization.' },
        { word: 'you know', count: 1, tip: 'State facts affirmatively rather than asking the interviewer for confirmation.' }
      ],
      strengths: [
        'Clear educational background and genuine enthusiasm.',
        'Good baseline volume and conversational warmth.',
        'Explicit mention of relevant domain (distributed systems & UI).'
      ],
      improvementTips: [
        'Replace hesitation fillers with steady pauses; silence communicates composure.',
        'Use the Present-Past-Future narrative structure to make your trajectory memorable.',
        'Anchor your fit in specific company products rather than generic "great fit".'
      ],
      executiveRewrite: 'I am a senior computer science student specializing in high-performance web systems and human-centered interfaces. Over the past two years, I built distributed services handling thousands of daily queries while obsessing over frontend latency. I am drawn to this team because of your focus on real-time collaboration tools, where my blend of backend reliability and UI precision can immediately accelerate your product roadmap.',
      followUpQuestion: 'Can you walk me through one specific distributed system project and the architectural trade-offs you made?'
    }
  },
  {
    id: 'sess-2',
    userId: 'user-amritha',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    questionId: 'q-2',
    questionText: 'Describe a complex technical challenge you faced. How did you break it down and deliver a solution?',
    category: 'Technical & System',
    durationSeconds: 95,
    transcript: 'In my capstone project, our team faced a severe memory leak in our WebSocket streaming service. When more than fifty concurrent students joined a live session, the node process crashed. To isolate the problem, I profiled heap dumps using Chrome DevTools and discovered that event listeners were never dereferenced when sockets disconnected. I refactored the connection teardown lifecycle, added automated load tests, and the service ran smoothly under three hundred concurrent connections.',
    analysis: {
      overallScore: 88,
      clarityScore: 92,
      fillerScore: 94,
      paceScore: 86,
      structureScore: 89,
      vocabularyScore: 88,
      wpm: 148,
      paceAssessment: 'Optimal Conversational (148 WPM)',
      totalFillerCount: 1,
      fillerPercentage: 1.1,
      fillerBreakdown: [
        { word: 'um', count: 0, tip: 'Clean execution without vocal stalls.' }
      ],
      strengths: [
        'Outstanding adherence to the STAR framework: clear problem, analytical action, and quantitative result.',
        'Superb pacing (148 WPM) within the ideal executive range.',
        'Precise engineering vocabulary (heap dumps, dereferenced, teardown lifecycle).'
      ],
      improvementTips: [
        'Briefly mention team collaboration or how you shared the findings with fellow engineers.',
        'Elaborate on how this experience influenced your ongoing testing mindset.'
      ],
      executiveRewrite: 'During our capstone project, our real-time streaming pipeline suffered crashes under peak load due to an uncollected memory leak. By analyzing heap dumps with Chrome DevTools, I traced the issue to un-dereferenced event listeners on socket disconnects. I restructured the teardown lifecycle and deployed automated stress tests, stabilizing the service to sustain 300+ concurrent users with zero downtime.',
      followUpQuestion: 'How did you verify that the memory leak was completely resolved before pushing to staging?'
    }
  }
];

export const INITIAL_STUDY_PLAN: StudyPlan = {
  id: 'plan-amritha-1',
  userId: 'user-amritha',
  createdAt: '2026-10-20',
  planTitle: '4-Week Executive Fluency & Interview Mastery Plan',
  summary: 'A targeted daily regimen designed to eliminate vocal filler words, calibrate speaking cadence to 140-155 WPM, and master structured STAR responses for competitive interviews.',
  estimatedImprovement: '+24% overall clarity, 85% filler word elimination',
  targetRole: 'Software Engineer & AI Specialist',
  dailyMinutes: 15,
  focusAreas: [
    'Intentional Pausing & Filler Elimination',
    'Cadence Calibration to 140 WPM',
    'STAR Storytelling Architecture',
    'Spontaneous Technical Articulation'
  ],
  weeks: [
    {
      weekNumber: 1,
      theme: 'Foundations of Breath & Filler Elimination',
      goal: 'Replace reflex "um" and "like" vocalizations with 1-second calm pauses.',
      drills: [
        {
          dayNumber: 1,
          title: 'The "Rubber Band" Pause Substitution Drill',
          timeMinutes: 12,
          drillType: 'Filler Elimination',
          instructions: 'Speak for 60 seconds on "My favorite software project". Every time you feel the urge to say "um" or "like", close your mouth, inhale gently through your nose, and pause for one full second before continuing.',
          exercisePrompt: 'Describe a project you built from scratch without uttering a single filler word.',
          successMetric: '0 filler words in 60 seconds of continuous speech.',
          completed: true
        },
        {
          dayNumber: 2,
          title: 'Diction & Articulation: Sibilant Consonants',
          timeMinutes: 10,
          drillType: 'Vocal Warmup',
          instructions: 'Repeat this phrase 5 times at 80 WPM, then 5 times at 140 WPM: "She sells synthetic silicon circuits by the seashore, showcasing swift synchronized systems."',
          exercisePrompt: 'Enunciate every terminal "t", "s", and "k" distinctly.',
          successMetric: 'Zero slurred syllables across 10 repetitions.',
          completed: true
        },
        {
          dayNumber: 3,
          title: '60-Second Elevator Pitch with Metronome',
          timeMinutes: 15,
          drillType: 'Pacing Meter',
          instructions: 'Deliver your standard "Tell me about yourself" introduction while matching a steady 135 WPM tempo.',
          exercisePrompt: 'Record your intro in the Practice Arena and check the WPM gauge.',
          successMetric: 'Pacing between 130 and 150 WPM with under 2 fillers.',
          completed: false
        },
        {
          dayNumber: 4,
          title: 'The "Word Association" Fluency Sprint',
          timeMinutes: 12,
          drillType: 'Mock Question',
          instructions: 'Pick 3 random words (e.g. Cloud, Latency, Coffee). Weave a cohesive 90-second technical mini-story incorporating all three.',
          exercisePrompt: 'Explain how system scalability relates to everyday resource management.',
          successMetric: 'Smooth transitions between concepts without hesitations.',
          completed: false
        },
        {
          dayNumber: 5,
          title: 'Weekly Progress Benchmark Recording',
          timeMinutes: 15,
          drillType: 'Mock Question',
          instructions: 'Record an unscripted response to "What is your greatest technical strength?" in the SpeakSmart Practice Arena.',
          exercisePrompt: 'Deliver response and record session to your progress dashboard.',
          successMetric: 'Score >= 78 on SpeakSmart Evaluation Index.',
          completed: false
        }
      ]
    },
    {
      weekNumber: 2,
      theme: 'Pacing, Cadence & Vocal Gravitas',
      goal: 'Achieve conversational rhythm with dynamic pitch modulation and emphasis.',
      drills: [
        {
          dayNumber: 1,
          title: 'The Triple Emphasis Exercise',
          timeMinutes: 10,
          drillType: 'Vocal Warmup',
          instructions: 'Take the sentence "We built this architecture to endure unexpected traffic." Repeat it 3 times, shifting emphasis: 1st on "We", 2nd on "architecture", 3rd on "endure".',
          exercisePrompt: 'Notice how tone changes meaning.',
          successMetric: 'Noticeable pitch variation.',
          completed: false
        },
        {
          dayNumber: 2,
          title: 'Brisk vs Measured Cadence Switching',
          timeMinutes: 15,
          drillType: 'Pacing Meter',
          instructions: 'Practice delivering high-urgency context at 155 WPM, then consciously dropping to 125 WPM when stating your core metric or conclusion.',
          exercisePrompt: 'STAR action segment.',
          successMetric: 'Clear tempo contrast.',
          completed: false
        },
        {
          dayNumber: 3,
          title: 'Handling Unexpected Questions under 30s',
          timeMinutes: 12,
          drillType: 'Mock Question',
          instructions: 'Take a surprise question from the Question Bank and deliver an answer with zero prep time.',
          exercisePrompt: '"What programming language would you decommission forever and why?"',
          successMetric: 'Immediate structured opening sentence.',
          completed: false
        },
        {
          dayNumber: 4,
          title: 'Filler Elimination Sprint: "The Like Lockdown"',
          timeMinutes: 12,
          drillType: 'Filler Elimination',
          instructions: 'Describe your daily coding routine for 2 minutes. Tap your desk if you catch yourself about to say "like".',
          exercisePrompt: '2-minute uninterrupted speech.',
          successMetric: '< 1 "like" occurrence.',
          completed: false
        },
        {
          dayNumber: 5,
          title: 'Midway Mock Assessment',
          timeMinutes: 15,
          drillType: 'Mock Question',
          instructions: 'Practice Behavioral Question: Conflict with a teammate.',
          exercisePrompt: 'Record in Practice Arena.',
          successMetric: 'Pillar score > 80 across all 5 dimensions.',
          completed: false
        }
      ]
    },
    {
      weekNumber: 3,
      theme: 'STAR Method Architecture & Storytelling',
      goal: 'Master memorable behavioral stories with concise problem setups and high-impact metrics.',
      drills: [
        {
          dayNumber: 1,
          title: 'Situation/Task in 20 Seconds Flat',
          timeMinutes: 12,
          drillType: 'Vocal Warmup',
          instructions: 'Distill the context of your hardest project into exactly 2 crisp sentences.',
          exercisePrompt: 'No more than 20 seconds of setup.',
          successMetric: 'Context clear in under 35 words.',
          completed: false
        },
        {
          dayNumber: 2,
          title: 'Action Phase: "I" vs "We" Calibration',
          timeMinutes: 15,
          drillType: 'Mock Question',
          instructions: 'Ensure you attribute team decisions while highlighting your distinct individual contribution.',
          exercisePrompt: 'Describe a collaborative sprint.',
          successMetric: 'Balanced credit attribution.',
          completed: false
        },
        {
          dayNumber: 3,
          title: 'The Quantitative Punchline Drill',
          timeMinutes: 12,
          drillType: 'Pacing Meter',
          instructions: 'Practice concluding responses with quantifiable outcomes (e.g., % latency drop, $ saved, hours reclaimed).',
          exercisePrompt: '3 different project endings.',
          successMetric: 'Decisive, strong final cadence.',
          completed: false
        },
        {
          dayNumber: 4,
          title: 'Handling Curveball "Failure" Questions',
          timeMinutes: 15,
          drillType: 'Mock Question',
          instructions: 'Practice answering "Tell me about a project that did not go as planned."',
          exercisePrompt: 'Demonstrate radical accountability.',
          successMetric: 'Zero defensive vocal tones.',
          completed: false
        },
        {
          dayNumber: 5,
          title: 'Week 3 Mock Simulation',
          timeMinutes: 15,
          drillType: 'Mock Question',
          instructions: 'Complete a full mock session in Practice Arena.',
          exercisePrompt: 'Technical challenge prompt.',
          successMetric: 'Overall Score >= 85.',
          completed: false
        }
      ]
    },
    {
      weekNumber: 4,
      theme: 'Executive Presence & High-Pressure Simulation',
      goal: 'Poise, spontaneous adaptability, and interview readiness across all scenarios.',
      drills: [
        {
          dayNumber: 1,
          title: 'Rapid Fire 3-in-3 Drill',
          timeMinutes: 15,
          drillType: 'Mock Question',
          instructions: 'Answer 3 distinct questions back-to-back with only 10 seconds break between each.',
          exercisePrompt: 'Behavioral, Technical, Leadership prompts.',
          successMetric: 'Sustained energy and low filler count.',
          completed: false
        },
        {
          dayNumber: 2,
          title: 'The Silent Anchor (Mastering the Thinking Pause)',
          timeMinutes: 12,
          drillType: 'Filler Elimination',
          instructions: 'When a difficult question is asked, count 3 full seconds in your head before speaking the first word.',
          exercisePrompt: 'Notice how comfortable intentional silence feels.',
          successMetric: 'No filler noises during initial thinking.',
          completed: false
        },
        {
          dayNumber: 3,
          title: 'Executive Tone & Vocabulary Polish',
          timeMinutes: 15,
          drillType: 'Vocal Warmup',
          instructions: 'Replace conversational phrases with concise executive phrasing.',
          exercisePrompt: '"We tried doing" -> "We deployed"; "It was hard" -> "The primary constraint".',
          successMetric: 'Vocabulary score > 90.',
          completed: false
        },
        {
          dayNumber: 4,
          title: 'Full Presentation Defense Drill',
          timeMinutes: 15,
          drillType: 'Mock Question',
          instructions: 'Deliver a 2-minute product pitch opening with high energy.',
          exercisePrompt: 'Practice Arena Keynote mode.',
          successMetric: 'WPM 140-160, 0 filler words.',
          completed: false
        },
        {
          dayNumber: 5,
          title: 'Final Certification Benchmark',
          timeMinutes: 20,
          drillType: 'Mock Question',
          instructions: 'Record your capstone interview question and evaluate your monthly transformation on the Analytics Dashboard.',
          exercisePrompt: 'Comprehensive evaluation.',
          successMetric: 'Overall score >= 90.',
          completed: false
        }
      ]
    }
  ]
};

export const VOCAL_WARMUPS = [
  {
    title: 'Diction Articulator',
    text: 'Red leather, yellow leather, unique New York, crisp crusts crackle cleanly.',
    focus: 'Lip & tongue agility, crisp consonants'
  },
  {
    title: 'The Pitch Modulation Roll',
    text: 'Who said that? You said that! Did they really verify the entire pipeline before deployment?',
    focus: 'Inflection, avoiding monotone answers'
  },
  {
    title: 'Diaphragmatic Breath Anchor',
    text: 'Inhale for 4 seconds, hold for 4 seconds, exhale on a sustained "ssss" sound for 16 seconds.',
    focus: 'Breath capacity, reducing shaky voice'
  }
];
