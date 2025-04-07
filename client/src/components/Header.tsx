import React from 'react';
import { Button } from '@/components/ui/button';
import { MoonIcon, SunIcon, InfoIcon, SearchIcon, BellIcon, UserIcon, PlaneIcon, Settings } from 'lucide-react';

interface HeaderProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export default function Header({ isDarkMode, onThemeToggle }: HeaderProps) {
  return (
    <header 
      className={`border-b h-16 py-2 px-4 flex items-center justify-between sticky top-0 z-50`}
      style={{
        background: isDarkMode 
          ? 'linear-gradient(to right, #05274d, #0a2440)' 
          : 'linear-gradient(to right, #ffffff, #e6f7ff)',
        borderColor: isDarkMode ? '#0a4995' : 'rgba(85, 255, 221, 0.3)',
        boxShadow: '0 2px 15px rgba(10, 73, 149, 0.15)'
      }}
    >
      <div className="flex items-center">
        <div className="mr-3 relative">
          <div 
            className="h-12 w-12 rounded-full flex items-center justify-center overflow-hidden"
            style={{ 
              background: 'var(--aviation-gradient)',
              boxShadow: '0 4px 10px rgba(10, 73, 149, 0.4)'
            }}
          >
            <PlaneIcon className="h-6 w-6 text-white transform rotate-45" />
          </div>
          <div 
            className="absolute -top-1 -right-1 h-4 w-4 rounded-full animate-pulse" 
            style={{ backgroundColor: 'var(--aviation-blue-light)' }}>
          </div>
        </div>
        <div>
          <h1 
            className="text-2xl font-bold bg-clip-text text-transparent tracking-tight"
            style={{
              backgroundImage: isDarkMode 
                ? 'linear-gradient(to right, var(--aviation-blue-light), var(--aviation-blue-accent))' 
                : 'linear-gradient(135deg, var(--aviation-blue-dark), var(--aviation-blue-light))'
            }}
          >
            AeroTracker
          </h1>
          <div 
            className="flex items-center"
          >
            <span 
              className="mr-2 font-medium text-xs"
              style={{ color: isDarkMode ? '#e6f7ff' : 'var(--aviation-blue-dark)' }}
            >
              Flight Tracking Platform
            </span>
            <span 
              className="inline-block px-2 py-0.5 text-[10px] rounded text-white font-semibold"
              style={{ 
                background: 'linear-gradient(to right, var(--aviation-blue-accent), var(--aviation-blue-light))',
                boxShadow: '0 2px 4px rgba(68, 153, 153, 0.4)'
              }}
            >
              PRO
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="relative hidden md:block">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none" style={{ color: 'var(--aviation-blue-accent)' }}>
            <SearchIcon className="h-4 w-4" />
          </div>
          <input 
            type="search" 
            style={{ 
              backgroundColor: isDarkMode ? 'rgba(5, 39, 77, 0.5)' : 'rgba(255, 255, 255, 0.9)',
              borderColor: isDarkMode ? 'var(--aviation-dark-accent)' : 'var(--aviation-blue-light)', 
              color: isDarkMode ? '#e6f7ff' : 'var(--aviation-blue-dark)',
              boxShadow: '0 2px 8px rgba(10, 73, 149, 0.1)'
            }}
            className={`pl-10 pr-4 py-2 text-sm rounded-full border focus:outline-none transition-all duration-200`} 
            placeholder="Search flights, airports..." 
          />
        </div>
        
        <div className="hidden md:flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon"
            style={{ 
              backgroundColor: isDarkMode ? 'rgba(68, 153, 153, 0.1)' : 'rgba(85, 255, 221, 0.1)',
              color: isDarkMode ? 'var(--aviation-blue-light)' : 'var(--aviation-blue-dark)'
            }}
            className="rounded-full relative hover:shadow-md transition-all"
          >
            <BellIcon className="h-5 w-5" />
            <span 
              className="absolute -top-1 -right-1 h-2 w-2 rounded-full"
              style={{ backgroundColor: 'var(--aviation-blue-light)' }}
            ></span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            style={{ 
              backgroundColor: isDarkMode ? 'rgba(68, 153, 153, 0.1)' : 'rgba(85, 255, 221, 0.1)',
              color: isDarkMode ? 'var(--aviation-blue-light)' : 'var(--aviation-blue-dark)'
            }}
            className="rounded-full hover:shadow-md transition-all"
          >
            <Settings className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onThemeToggle}
            style={{ 
              backgroundColor: isDarkMode ? 'rgba(68, 153, 153, 0.1)' : 'rgba(85, 255, 221, 0.1)'
            }}
            className="rounded-full hover:shadow-md transition-all"
          >
            {isDarkMode ? (
              <SunIcon className="h-5 w-5 text-yellow-400" />
            ) : (
              <MoonIcon className="h-5 w-5" style={{ color: 'var(--aviation-blue-dark)' }} />
            )}
          </Button>
          
          <Button 
            className="ml-2 rounded-full px-5 py-2 text-sm font-medium text-white transition-all hover:-translate-y-1"
            style={{ 
              background: 'var(--aviation-gradient-light)',
              boxShadow: '0 4px 10px rgba(85, 255, 221, 0.3)'
            }}
          >
            <UserIcon className="h-4 w-4 mr-2" />
            Sign In
          </Button>
        </div>
        
        <div className="md:hidden flex items-center space-x-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onThemeToggle}
            style={{ 
              backgroundColor: isDarkMode ? 'rgba(68, 153, 153, 0.1)' : 'rgba(85, 255, 221, 0.1)'
            }}
            className="rounded-full"
          >
            {isDarkMode ? (
              <SunIcon className="h-5 w-5 text-yellow-400" />
            ) : (
              <MoonIcon className="h-5 w-5" style={{ color: 'var(--aviation-blue-dark)' }} />
            )}
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            style={{ 
              backgroundColor: isDarkMode ? 'rgba(68, 153, 153, 0.1)' : 'rgba(85, 255, 221, 0.1)',
              color: isDarkMode ? 'var(--aviation-blue-light)' : 'var(--aviation-blue-dark)'
            }}
            className="rounded-full"
          >
            <SearchIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}