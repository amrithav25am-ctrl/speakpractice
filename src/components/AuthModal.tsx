import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, UserPlus, Users, Check, Flame, Clock, Target, Sparkles } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { 
    currentUser, 
    allUsers, 
    switchUser, 
    createAccount, 
    updateProfile,
    isAuthModalOpen, 
    setIsAuthModalOpen 
  } = useAuth();

  const [mode, setMode] = useState<'switch' | 'create' | 'edit'>('switch');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    targetRole: 'Software Engineer & AI Specialist',
    focusGoal: 'Eliminate filler words ("um", "like") and maintain steady 140 WPM pace.'
  });

  const [editData, setEditData] = useState({
    name: currentUser.name,
    targetRole: currentUser.targetRole,
    focusGoal: currentUser.focusGoal
  });

  if (!isAuthModalOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;
    createAccount(formData);
    setMode('switch');
    setIsAuthModalOpen(false);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(editData);
    setIsAuthModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-heading text-base font-bold text-slate-900">
                {mode === 'switch' && 'User Accounts & Profiles'}
                {mode === 'create' && 'Create New Student Account'}
                {mode === 'edit' && 'Edit Student Profile'}
              </h2>
              <p className="text-xs text-slate-500">
                Manage your personalized goals, streak, and speech history
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-slate-100 px-6 pt-2 gap-2 bg-slate-50/30">
          <button
            onClick={() => setMode('switch')}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors ${
              mode === 'switch'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Switch Account ({allUsers.length})
          </button>
          <button
            onClick={() => setMode('create')}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors ${
              mode === 'create'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Create Account
          </button>
          <button
            onClick={() => {
              setEditData({
                name: currentUser.name,
                targetRole: currentUser.targetRole,
                focusGoal: currentUser.focusGoal
              });
              setMode('edit');
            }}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors ${
              mode === 'edit'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Current Profile Settings
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {mode === 'switch' && (
            <div className="space-y-3">
              <div className="text-xs font-medium text-slate-500 mb-2">
                Select an account to load personalized progress, streak, and study curriculum:
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {allUsers.map((user) => {
                  const isCurrent = user.id === currentUser.id;
                  const mins = Math.round((user.totalSpeakingSeconds || 0) / 60);
                  return (
                    <div
                      key={user.id}
                      onClick={() => {
                        switchUser(user.id);
                        setIsAuthModalOpen(false);
                      }}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                        isCurrent
                          ? 'border-indigo-500 bg-indigo-50/40 ring-1 ring-indigo-500/20'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                          isCurrent ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-900">{user.name}</span>
                            {isCurrent && (
                              <span className="text-[10px] font-bold uppercase text-indigo-600 bg-indigo-100 px-1.5 py-0.2 rounded">
                                Active
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {user.targetRole} · {user.email}
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                            <span className="flex items-center gap-1 text-amber-600 font-medium">
                              <Flame className="w-3 h-3 fill-amber-500 text-amber-600" />
                              {user.streakDays}d streak
                            </span>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {mins} mins spoken
                            </span>
                          </div>
                        </div>
                      </div>

                      {isCurrent && (
                        <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setMode('create')}
                  className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  + Register New Student Account
                </button>
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {mode === 'create' && (
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Lee"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. jordan.lee@university.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Career / Practice Objective
                </label>
                <select
                  value={formData.targetRole}
                  onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="Software Engineer & AI Specialist">Software Engineer & AI Specialist</option>
                  <option value="Product Manager & Strategy">Product Manager & Strategy</option>
                  <option value="Management Consultant">Management Consultant</option>
                  <option value="Graduate & MBA Admissions">Graduate & MBA Admissions</option>
                  <option value="Academic Fellowship / PhD Defense">Academic Fellowship / PhD Defense</option>
                  <option value="Public Speaking & Keynotes">Public Speaking & Keynotes</option>
                  <option value="General Professional Fluency">General Professional Fluency</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Primary Speech Focus Goal
                </label>
                <input
                  type="text"
                  value={formData.focusGoal}
                  onChange={(e) => setFormData({ ...formData, focusGoal: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  placeholder="e.g. Stop saying 'like', slow down speaking pace to 140 WPM"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setMode('switch')}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm shadow-indigo-200 transition-colors"
                >
                  Create & Activate Account
                </button>
              </div>
            </form>
          )}

          {mode === 'edit' && (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Career / Practice Objective
                </label>
                <input
                  type="text"
                  required
                  value={editData.targetRole}
                  onChange={(e) => setEditData({ ...editData, targetRole: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Primary Focus Goal
                </label>
                <textarea
                  rows={3}
                  value={editData.focusGoal}
                  onChange={(e) => setEditData({ ...editData, focusGoal: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm shadow-indigo-200 transition-colors"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
