import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';

export type Theme = 'light' | 'dark' | 'system';

// AeroLink standardized aviation color palette
export const AERO_COLORS = {
  // Primary blue - used for primary buttons, links, and accent colors
  primary: '#4995fd',
  
  // Dark navy blue - used for headers, footers, and dark mode backgrounds
  darkBlue: '#003a65',
  
  // Sky blue - used for secondary accents and highlights
  skyBlue: '#a0d0ec',
  
  // Ultra light blue - used for backgrounds and subtle accents
  ultraLightBlue: '#e8f4fc',
  
  // Success green - used for positive statuses and confirmations
  success: '#34d399',
  
  // Warning yellow - used for caution states and warnings
  warning: '#fbbf24',
  
  // Alert red - used for errors and critical alerts
  alert: '#ef4444',
  
  // Neutral grays for text and borders
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  }
};

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
  systemTheme: 'light' | 'dark';
  colors: typeof AERO_COLORS;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Initialize theme from localStorage or default to system theme
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('aero-theme');
      if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
        return savedTheme as Theme;
      }
    }
    return 'system';
  });
  
  // Track the system theme preference
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  // Compute the actual theme mode based on theme choice and system preference
  const isDark = theme === 'dark' || (theme === 'system' && systemTheme === 'dark');

  // Listen for system theme preference changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Apply the theme to the DOM
  useEffect(() => {
    if (typeof document === 'undefined') return;
    
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    
    // Add the appropriate theme class
    const activeTheme = theme === 'system' ? systemTheme : theme;
    root.classList.add(activeTheme);
    
    // Set CSS variables for AeroLink colors based on theme
    if (activeTheme === 'dark') {
      root.style.setProperty('--aero-background', AERO_COLORS.darkBlue);
      root.style.setProperty('--aero-text', AERO_COLORS.gray[100]);
      root.style.setProperty('--aero-primary', AERO_COLORS.primary);
      root.style.setProperty('--aero-secondary', AERO_COLORS.skyBlue);
      root.style.setProperty('--aero-accent', AERO_COLORS.ultraLightBlue);
    } else {
      root.style.setProperty('--aero-background', AERO_COLORS.ultraLightBlue);
      root.style.setProperty('--aero-text', AERO_COLORS.gray[900]);
      root.style.setProperty('--aero-primary', AERO_COLORS.primary);
      root.style.setProperty('--aero-secondary', AERO_COLORS.darkBlue);
      root.style.setProperty('--aero-accent', AERO_COLORS.skyBlue);
    }
    
  }, [theme, systemTheme]);

  // Function to update the theme
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('aero-theme', newTheme);
    }
  };

  // Prepare context value
  const value: ThemeContextType = {
    theme,
    setTheme,
    isDark,
    systemTheme,
    colors: AERO_COLORS
  };

  // Provide the theme context to children
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}