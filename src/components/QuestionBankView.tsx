import React, { useState } from 'react';
import { PracticeQuestion, QuestionCategory, QuestionDifficulty } from '../types';
import { storageService } from '../services/storage';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, 
  Search, 
  Plus, 
  Sparkles, 
  Play, 
  Clock, 
  ChevronRight, 
  Lightbulb, 
  Tag, 
  Filter,
  CheckCircle2
} from 'lucide-react';

interface QuestionBankViewProps {
  questions: PracticeQuestion[];
  onSelectAndPractice: (question: PracticeQuestion) => void;
  onRefreshQuestions: () => void;
}

export const QuestionBankView: React.FC<QuestionBankViewProps> = ({
  questions,
  onSelectAndPractice,
  onRefreshQuestions
}) => {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  
  // Custom question modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const [customForm, setCustomForm] = useState({
    question: '',
    category: 'Behavioral & STAR' as QuestionCategory,
    difficulty: 'Intermediate' as QuestionDifficulty,
    suggestedDurationSeconds: 90,
    coachTip: 'Structure your answer with clear context, decisive personal action, and measurable outcome.',
    framework: 'STAR Method'
  });

  const [aiGenCategory, setAiGenCategory] = useState<QuestionCategory>('Behavioral & STAR');
  const [aiGenDifficulty, setAiGenDifficulty] = useState<QuestionDifficulty>('Intermediate');

  const categories: string[] = [
    'All',
    'Behavioral & STAR',
    'Technical & System',
    'Leadership & Conflict',
    'Presentation & Keynote',
    'Academic & Scholarship',
    'Elevator Pitch & Intro'
  ];

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.coachTip && q.coachTip.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = selectedCategory === 'All' || q.category === selectedCategory;
    const matchesDiff = selectedDifficulty === 'All' || q.difficulty === selectedDifficulty;
    return matchesSearch && matchesCat && matchesDiff;
  });

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customForm.question.trim()) return;

    const newQuestion: PracticeQuestion = {
      id: `custom-${Date.now()}`,
      ...customForm,
      role: currentUser.targetRole
    };

    storageService.addQuestion(newQuestion);
    onRefreshQuestions();
    setShowAddModal(false);
    setCustomForm({
      question: '',
      category: 'Behavioral & STAR',
      difficulty: 'Intermediate',
      suggestedDurationSeconds: 90,
      coachTip: '',
      framework: 'STAR Method'
    });
  };

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    try {
      const generated = await apiService.generateQuestions({
        category: aiGenCategory,
        difficulty: aiGenDifficulty,
        role: currentUser.targetRole
      });

      generated.forEach((q) => storageService.addQuestion(q));
      onRefreshQuestions();
      setShowAIModal(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Question Library</span>
            <span aria-hidden="true">·</span>
            <span>{questions.length} questions available</span>
          </div>
          <h1 className="font-heading text-xl font-bold text-slate-900">
            Practice Question Catalog
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Hand-curated and AI-generated prompts for behavioral interviews, technical defense, and presentation keynotes.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowAIModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-xl border border-indigo-200/60 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            Generate AI Questions
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Custom
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search questions by topic, keyword, or framework..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        {/* Category Filter Pills (Button tabs) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Difficulty Filter */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-medium">Difficulty:</span>
          {['All', 'Beginner', 'Intermediate', 'Advanced'].map((diff) => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                selectedDifficulty === diff
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>

      </div>

      {/* Question Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredQuestions.map((q) => (
          <div
            key={q.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-indigo-300 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-semibold text-indigo-700">{q.category}</span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {q.suggestedDurationSeconds}s
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="font-medium text-slate-700">{q.difficulty}</span>
                </div>
              </div>

              <h3 className="font-heading text-sm sm:text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                {q.question}
              </h3>

              {q.coachTip && (
                <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                  <span className="font-semibold text-slate-700">Coach Tip:</span> {q.coachTip}
                </p>
              )}

              {q.keyTalkingPoints && q.keyTalkingPoints.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1 text-[11px] text-slate-600">
                  {q.keyTalkingPoints.slice(0, 3).map((pt, i) => (
                    <span key={i} className="bg-slate-100 px-2 py-0.5 rounded">
                      {pt}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">
                Framework: {q.framework || 'STAR'}
              </span>
              <button
                onClick={() => onSelectAndPractice(q)}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                Practice Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredQuestions.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6">
          <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800">No questions match your filter</h3>
          <p className="text-xs text-slate-500 mt-1">Try clearing your search query or reset category filter.</p>
        </div>
      )}

      {/* Add Custom Question Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200">
            <h3 className="font-heading text-lg font-bold text-slate-900 mb-1">
              Add Custom Practice Question
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Add a specific prompt you are preparing for in an upcoming interview or presentation.
            </p>

            <form onSubmit={handleAddCustom} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Question Prompt
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Tell me about a time you had to optimize a machine learning model under memory constraints."
                  value={customForm.question}
                  onChange={(e) => setCustomForm({ ...customForm, question: e.target.value })}
                  className="w-full p-2.5 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={customForm.category}
                    onChange={(e) => setCustomForm({ ...customForm, category: e.target.value as any })}
                    className="w-full p-2 text-xs border border-slate-200 rounded-lg"
                  >
                    <option value="Behavioral & STAR">Behavioral & STAR</option>
                    <option value="Technical & System">Technical & System</option>
                    <option value="Leadership & Conflict">Leadership & Conflict</option>
                    <option value="Presentation & Keynote">Presentation & Keynote</option>
                    <option value="Academic & Scholarship">Academic & Scholarship</option>
                    <option value="Elevator Pitch & Intro">Elevator Pitch & Intro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Difficulty</label>
                  <select
                    value={customForm.difficulty}
                    onChange={(e) => setCustomForm({ ...customForm, difficulty: e.target.value as any })}
                    className="w-full p-2 text-xs border border-slate-200 rounded-lg"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Coach Tip / Recommendation
                </label>
                <input
                  type="text"
                  value={customForm.coachTip}
                  onChange={(e) => setCustomForm({ ...customForm, coachTip: e.target.value })}
                  placeholder="e.g. Emphasize profiling tools and quant metrics."
                  className="w-full p-2 text-xs border border-slate-200 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Generate Questions Modal */}
      {showAIModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="font-heading text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              Generate 5 Questions with Gemini
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              AI creates 5 realistic interview scenarios targeted to {currentUser.targetRole}.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Category</label>
                <select
                  value={aiGenCategory}
                  onChange={(e) => setAiGenCategory(e.target.value as any)}
                  className="w-full p-2 text-xs border border-slate-200 rounded-lg"
                >
                  <option value="Behavioral & STAR">Behavioral & STAR</option>
                  <option value="Technical & System">Technical & System</option>
                  <option value="Leadership & Conflict">Leadership & Conflict</option>
                  <option value="Presentation & Keynote">Presentation & Keynote</option>
                  <option value="Academic & Scholarship">Academic & Scholarship</option>
                  <option value="Elevator Pitch & Intro">Elevator Pitch & Intro</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Difficulty</label>
                <select
                  value={aiGenDifficulty}
                  onChange={(e) => setAiGenDifficulty(e.target.value as any)}
                  className="w-full p-2 text-xs border border-slate-200 rounded-lg"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAIModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleGenerateAI}
                  disabled={isGenerating}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {isGenerating ? 'Synthesizing...' : 'Generate 5 Questions'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
