"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUserProfile } from '@/firebase';

export type Theme = "default" | "void" | "bright" | "crimson" | "jade";

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
    // We consider the theme loaded from local storage initially.
    // The FOUC is prevented by the script in RootLayout.
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

    const root = document.documentElement;
    const themeClasses = ['dark', 'theme-void', 'theme-bright', 'theme-crimson', 'theme-jade'];
    root.classList.remove(...themeClasses);

    switch (theme) {
      case 'void':
        root.classList.add('dark', 'theme-void');
        break;
      case 'bright':
        root.classList.add('theme-bright');
        break;
      case 'crimson':
        root.classList.add('dark', 'theme-crimson');
        break;
      case 'jade':
        root.classList.add('theme-jade');
        break;
      case 'default':
      default:
        root.classList.add('dark');
        break;
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
