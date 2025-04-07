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
      className={`border-b ${isDarkMode ? 'border-neutral-800 bg-neutral-900' : 'border-neutral-200'} h-16 py-2 px-4 flex items-center justify-between sticky top-0 z-50 shadow-sm`}
      style={{
        background: isDarkMode 
          ? 'linear-gradient(to right, #0a1520, #0a2440)' 
          : 'linear-gradient(to right, #ffffff, #f8faff)'
      }}
    >
      <div className="flex items-center">
        <div className="mr-3">
          <div 
            className="h-10 w-10 rounded-full flex items-center justify-center overflow-hidden"
            style={{ 
              background: 'var(--aviation-gradient)',
              boxShadow: '0 3px 6px rgba(10, 73, 149, 0.3)'
            }}
          >
            <PlaneIcon className="h-5 w-5 text-white transform rotate-45" />
          </div>
        </div>
        <div>
          <h1 
            className="text-xl font-bold bg-clip-text text-transparent"
            style={{
              backgroundImage: isDarkMode 
                ? 'linear-gradient(to right, #5fd, #2460a7)' 
                : 'linear-gradient(135deg, #0a4995, #5fd)'
            }}
          >
            AeroTracker
          </h1>
          <div 
            className={`text-xs ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'} flex items-center`}
          >
            <span className="mr-1 font-medium">Flight Tracking Platform</span>
            <span 
              className="inline-block px-1.5 text-[10px] rounded-sm text-white font-semibold"
              style={{ backgroundColor: 'var(--aviation-blue-accent)' }}
            >
              PRO
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="relative hidden md:block">
          <div className={`absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
            <SearchIcon className="h-4 w-4" />
          </div>
          <input 
            type="search" 
            className={`pl-10 pr-4 py-2 text-sm rounded-md border ${
              isDarkMode 
                ? 'bg-neutral-800/50 border-neutral-700 text-white placeholder-neutral-400' 
                : 'bg-white/80 border-neutral-200 text-neutral-900 placeholder-neutral-500'
            } focus:outline-none focus:ring-2 focus:ring-[#5fd] focus:border-transparent transition-all duration-200`} 
            placeholder="Search flights, airports..." 
          />
        </div>
        
        <div className="hidden md:flex items-center space-x-1">
          <Button 
            variant="ghost" 
            size="icon"
            className="rounded-full hover:bg-opacity-10 hover:bg-[#5fd]"
          >
            <BellIcon className={`h-5 w-5 ${isDarkMode ? 'text-neutral-300' : 'text-[#0a4995]'}`} />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            className="rounded-full hover:bg-opacity-10 hover:bg-[#5fd]"
          >
            <Settings className={`h-5 w-5 ${isDarkMode ? 'text-neutral-300' : 'text-[#0a4995]'}`} />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onThemeToggle}
            className="rounded-full hover:bg-opacity-10 hover:bg-[#5fd]"
          >
            {isDarkMode ? (
              <SunIcon className="h-5 w-5 text-yellow-400" />
            ) : (
              <MoonIcon className="h-5 w-5 text-[#0a4995]" />
            )}
          </Button>
          
          <Button 
            className="ml-2 aviation-btn"
          >
            <UserIcon className="h-4 w-4 mr-2" />
            Sign In
          </Button>
        </div>
        
        <div className="md:hidden flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onThemeToggle}
            className="rounded-full hover:bg-opacity-10 hover:bg-[#5fd]"
          >
            {isDarkMode ? (
              <SunIcon className="h-5 w-5 text-yellow-400" />
            ) : (
              <MoonIcon className="h-5 w-5 text-[#0a4995]" />
            )}
          </Button>
          
          <Button variant="ghost" size="icon">
            <span className="material-icons">menu</span>
          </Button>
        </div>
      </div>
    </header>
  );
}