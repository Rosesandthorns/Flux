"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUserProfile } from '@/firebase';
import { THEMES } from '@/lib/themes';

export type Theme = (typeof THEMES)[number]['id'];

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isThemeLoaded: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("default");
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);
  const { data: userProfile, loading: userProfileLoading } = useUserProfile();

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    if (storedTheme) {
      setThemeState(storedTheme);
    }
    setIsThemeLoaded(true); 
  }, []);
  
  useEffect(() => {
    if (!userProfileLoading && userProfile?.theme && userProfile.theme !== theme) {
      setThemeState(userProfile.theme);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile, userProfileLoading]);


  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  };
  
  useEffect(() => {
    if (!isThemeLoaded) return; 

    const themeInfo = THEMES.find(t => t.id === theme) || THEMES.find(t => t.id === 'default');
    const root = document.documentElement;

    const allThemeClasses = THEMES.map(t => 'theme-' + t.id);
    root.classList.remove('dark', ...allThemeClasses);

    if (themeInfo) {
      if (themeInfo.isDark) {
        root.classList.add('dark');
      }
      root.classList.add(`theme-${themeInfo.id}`);
    } else {
        root.classList.add('dark');
    }

  }, [theme, isThemeLoaded]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isThemeLoaded }}>
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
