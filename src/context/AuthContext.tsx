import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserAccount } from '../types';
import { storageService } from '../services/storage';

interface AuthContextType {
  currentUser: UserAccount;
  allUsers: UserAccount[];
  switchUser: (userId: string) => void;
  createAccount: (data: { name: string; email: string; targetRole: string; focusGoal?: string }) => UserAccount;
  updateProfile: (data: Partial<UserAccount>) => void;
  refreshUser: () => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserAccount>(() => storageService.getCurrentUser());
  const [allUsers, setAllUsers] = useState<UserAccount[]>(() => storageService.getUsers());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  useEffect(() => {
    refreshUser();
  }, []);

  const refreshUser = () => {
    const user = storageService.getCurrentUser();
    const users = storageService.getUsers();
    setCurrentUser(user);
    setAllUsers(users);
  };

  const switchUser = (userId: string) => {
    const user = storageService.setCurrentUser(userId);
    setCurrentUser(user);
    refreshUser();
  };

  const createAccount = ({ name, email, targetRole, focusGoal }: { name: string; email: string; targetRole: string; focusGoal?: string }) => {
    const newUser: UserAccount = {
      id: `user-${Date.now()}`,
      name: name.trim() || 'New Speaker',
      email: email.trim().toLowerCase(),
      targetRole: targetRole || 'General Professional',
      experienceLevel: 'Student',
      focusGoal: focusGoal || 'Master interview responses with 0 filler words and steady pace',
      streakDays: 1,
      lastPracticedDate: new Date().toISOString(),
      totalSpeakingSeconds: 0,
      joinedDate: new Date().toISOString().split('T')[0],
    };
    storageService.saveUser(newUser);
    storageService.setCurrentUser(newUser.id);
    refreshUser();
    return newUser;
  };

  const updateProfile = (data: Partial<UserAccount>) => {
    const updated = { ...currentUser, ...data };
    storageService.saveUser(updated);
    setCurrentUser(updated);
    refreshUser();
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        allUsers,
        switchUser,
        createAccount,
        updateProfile,
        refreshUser,
        isAuthModalOpen,
        setIsAuthModalOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
