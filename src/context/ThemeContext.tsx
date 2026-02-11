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
    } else {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  };
  
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    // Clear all theme-related classes
    root.classList.remove('dark', 'theme-void', 'theme-bright', 'theme-crimson', 'theme-jade');
    body.classList.remove('bg-gradient-to-b', 'from-red-600', 'to-red-900');
    
    // Add base class
    body.classList.add('bg-background');

    switch (theme) {
      case 'void':
        root.classList.add('dark', 'theme-void');
        break;
      case 'bright':
        root.classList.add('theme-bright');
        break;
      case 'crimson':
        root.classList.add('dark', 'theme-crimson');
        body.classList.remove('bg-background');
        body.classList.add('bg-gradient-to-b', 'from-red-600', 'to-red-900');
        break;
      case 'jade':
        root.classList.add('theme-jade');
        break;
      case 'default':
      default:
        root.classList.add('dark');
        break;
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
