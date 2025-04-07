import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  // Initialize theme from localStorage or default to 'system'
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as Theme;
      return savedTheme || 'system';
    }
    return 'system';
  });

  // Initialize isDarkMode state based on theme and system preference
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (theme === 'dark') return true;
    if (theme === 'light') return false;
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Effect for setting theme in localStorage
  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Effect for handling system theme changes
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [theme]);

  // Effect for applying dark/light classes to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    document.documentElement.classList.toggle('light', !isDarkMode);
  }, [isDarkMode]);

  // Function to update theme
  const setThemeMode = (newTheme: Theme) => {
    setTheme(newTheme);
    if (newTheme === 'dark') {
      setIsDarkMode(true);
    } else if (newTheme === 'light') {
      setIsDarkMode(false);
    } else {
      // For 'system', use the system preference
      setIsDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
  };

  return { theme, isDarkMode, setTheme: setThemeMode };
}