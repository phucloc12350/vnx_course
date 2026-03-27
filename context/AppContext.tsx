'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AppContextType {
  level: string;
  setLevel: (v: string) => void;
  weakness: string;
  setWeakness: (v: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [level, setLevel] = useState('A1 (Sơ cấp)');
  const [weakness, setWeakness] = useState('');

  return (
    <AppContext.Provider value={{ level, setLevel, weakness, setWeakness }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
