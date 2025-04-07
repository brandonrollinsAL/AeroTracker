import React from 'react';
import { Button } from '@/components/ui/button';
import { MoonIcon, SunIcon, InfoIcon, SearchIcon, BellIcon, UserIcon, PlaneIcon, Settings, MapIcon, BarChart3Icon } from 'lucide-react';

interface HeaderProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export default function Header({ isDarkMode, onThemeToggle }: HeaderProps) {
  return (
    <header 
      className="border-b h-16 py-2 px-6 flex items-center justify-between sticky top-0 z-50 bg-white"
    >
      <div className="flex items-center">
        <div className="mr-3">
          <div className="h-9 w-9 bg-blue-500 rounded flex items-center justify-center">
            <PlaneIcon className="h-5 w-5 text-white transform rotate-45" />
          </div>
        </div>
        <div>
          <h1 className="text-base font-bold text-blue-500">
            AeroTracker
          </h1>
          <div className="flex items-center">
            <span className="text-xs text-gray-500">
              Flight Tracking
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <div className="relative hidden md:block">
          <div 
            className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400"
          >
            <SearchIcon className="h-4 w-4" />
          </div>
          <input 
            type="search" 
            className="pl-10 pr-4 py-2 text-sm rounded-full border border-gray-200 focus:outline-none focus:border-blue-300 w-56" 
            placeholder="Search flights, airports..." 
          />
        </div>
        
        <div className="hidden md:flex items-center space-x-2">
          <div className="flex items-center mr-2">
            <Button 
              size="sm"
              className="flex items-center h-8 px-3 bg-blue-500 text-white rounded-md"
            >
              <MapIcon className="h-4 w-4 mr-1.5" />
              <span className="text-xs font-medium">Map</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              className="flex items-center h-8 px-3 text-gray-600 rounded-md"
            >
              <BarChart3Icon className="h-4 w-4 mr-1.5" />
              <span className="text-xs">Stats</span> 
            </Button>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon"
            className="h-9 w-9 rounded-full text-gray-600"
          >
            <BellIcon className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            className="h-9 w-9 rounded-full text-gray-600"
          >
            <Settings className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onThemeToggle}
            className="h-9 w-9 rounded-full text-gray-600"
          >
            {isDarkMode ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </Button>
          
          <Button 
            className="ml-1 bg-blue-500 text-white rounded-md h-9 px-4"
          >
            <UserIcon className="h-4 w-4 mr-2" />
            Sign In
          </Button>
        </div>
        
        <div className="md:hidden flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onThemeToggle}
            className="h-8 w-8 rounded-full text-gray-600"
          >
            {isDarkMode ? (
              <SunIcon className="h-4 w-4" />
            ) : (
              <MoonIcon className="h-4 w-4" />
            )}
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            className="h-8 w-8 rounded-full text-gray-600"
          >
            <SearchIcon className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            className="h-8 w-8 rounded-full text-gray-600"
          >
            <BellIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}