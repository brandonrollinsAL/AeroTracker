import React from 'react';
import { Button } from '@/components/ui/button';
import { MoonIcon, SunIcon, InfoIcon, SearchIcon, BellIcon, UserIcon } from 'lucide-react';

interface HeaderProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export default function Header({ isDarkMode, onThemeToggle }: HeaderProps) {
  return (
    <header className={`border-b ${isDarkMode ? 'border-neutral-800 bg-neutral-900' : 'border-neutral-200 bg-white'} h-16 py-2 px-4 flex items-center justify-between`}>
      <div className="flex items-center">
        <div className="mr-2">
          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center overflow-hidden">
            <span className="material-icons text-white">flight</span>
          </div>
        </div>
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
            AeroTracker
          </h1>
          <p className={`text-xs ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
            Professional Flight Tracking Platform
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="relative hidden md:block">
          <div className={`absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
            <SearchIcon className="h-4 w-4" />
          </div>
          <input 
            type="search" 
            className={`pl-10 pr-4 py-2 text-sm rounded-md ${
              isDarkMode 
                ? 'bg-neutral-800 border-neutral-700 text-white placeholder-neutral-400' 
                : 'bg-neutral-100 border-neutral-200 text-neutral-900 placeholder-neutral-500'
            } focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`} 
            placeholder="Search flights, airports..." 
          />
        </div>
        
        <div className="hidden md:flex items-center space-x-2">
          <Button variant="ghost" size="icon">
            <BellIcon className={`h-5 w-5 ${isDarkMode ? 'text-neutral-300' : 'text-neutral-700'}`} />
          </Button>
          
          <Button variant="ghost" size="icon">
            <InfoIcon className={`h-5 w-5 ${isDarkMode ? 'text-neutral-300' : 'text-neutral-700'}`} />
          </Button>
          
          <Button variant="ghost" size="icon" onClick={onThemeToggle}>
            {isDarkMode ? (
              <SunIcon className="h-5 w-5 text-yellow-400" />
            ) : (
              <MoonIcon className="h-5 w-5 text-neutral-700" />
            )}
          </Button>
          
          <Button variant="outline" size="sm" className="ml-2">
            <UserIcon className="h-4 w-4 mr-2" />
            Sign In
          </Button>
        </div>
        
        <div className="md:hidden flex items-center">
          <Button variant="ghost" size="icon" onClick={onThemeToggle}>
            {isDarkMode ? (
              <SunIcon className="h-5 w-5 text-yellow-400" />
            ) : (
              <MoonIcon className="h-5 w-5 text-neutral-700" />
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