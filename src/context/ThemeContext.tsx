"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Theme = "default" | "void" | "bright" | "crimson" | "jade";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("default");

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    if (storedTheme) {
      setThemeState(storedTheme);
    }
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  };
  
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    // Reset classes
    root.classList.remove('theme-void', 'theme-bright', 'theme-crimson', 'theme-jade');
    body.classList.remove('bg-gradient-to-b', 'from-red-600', 'to-red-900');
    body.classList.add('bg-background');

    // Apply new theme class
    if (theme !== 'default') {
      root.classList.add(`theme-${theme}`);
    }
    
    // Handle Crimson gradient
    if (theme === 'crimson') {
        body.classList.remove('bg-background');
        body.classList.add('bg-gradient-to-b', 'from-red-600', 'to-red-900');
    }

  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
