// src/contexts/UserPreferencesContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface UserPreferences {
  theme: 'light' | 'dark' | 'blue' | 'green';
  precision: number;
  angleUnit: 'degrees' | 'radians';
  showHistory: boolean;
}

interface UserPreferencesContextType {
  preferences: UserPreferences;
  updatePreferences: (newPreferences: Partial<UserPreferences>) => void;
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'light',
  precision: 10,
  angleUnit: 'degrees',
  showHistory: true,
};

export const UserPreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    // Load preferences from localStorage
    const savedPreferences = localStorage.getItem('calculator-preferences');
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences);
        setPreferences(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Save preferences to localStorage
    localStorage.setItem('calculator-preferences', JSON.stringify(preferences));
  }, [preferences]);

  const updatePreferences = (newPreferences: Partial<UserPreferences>) => {
    setPreferences(prev => ({ ...prev, ...newPreferences }));
  };

  return (
    <UserPreferencesContext.Provider value={{ preferences, updatePreferences }}>
      {children}
    </UserPreferencesContext.Provider>
  );
};

export const useUserPreferences = () => {
  const context = useContext(UserPreferencesContext);
  if (!context) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
};