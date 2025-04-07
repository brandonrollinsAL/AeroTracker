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
      className="border-b h-16 py-2 px-4 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md"
      style={{
        background: isDarkMode 
          ? 'linear-gradient(to right, rgba(5, 39, 77, 0.95), rgba(10, 36, 64, 0.95))' 
          : 'linear-gradient(to right, rgba(255, 255, 255, 0.95), rgba(230, 247, 255, 0.95))',
        borderColor: isDarkMode ? 'var(--aviation-blue-dark)' : 'rgba(85, 255, 221, 0.3)',
        boxShadow: isDarkMode 
          ? '0 2px 15px rgba(0, 0, 0, 0.25), 0 0 1px var(--aviation-blue-accent)' 
          : '0 2px 15px rgba(10, 73, 149, 0.15), 0 0 1px var(--aviation-blue-light)'
      }}
    >
      <div className="flex items-center">
        <div className="mr-4 relative">
          <div 
            className="h-12 w-12 rounded-full flex items-center justify-center overflow-hidden aviation-shimmer"
            style={{ 
              background: isDarkMode
                ? 'var(--aviation-dark-gradient-glow)'
                : 'linear-gradient(135deg, var(--aviation-blue-dark), var(--aviation-blue-light), var(--aviation-cyan))',
              boxShadow: isDarkMode
                ? '0 4px 15px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(85, 255, 221, 0.2), var(--aviation-glow-sm)'
                : '0 4px 15px rgba(10, 73, 149, 0.3), 0 0 0 1px rgba(85, 255, 221, 0.2)',
              border: '2px solid rgba(255, 255, 255, 0.1)',
              transition: 'all 0.3s ease'
            }}
          >
            <PlaneIcon className="h-6 w-6 text-white transform rotate-45" />
          </div>
          <div 
            className="absolute -top-1 -right-1 h-4 w-4 rounded-full aviation-pulse" 
            style={{ 
              background: 'linear-gradient(to right, var(--aviation-blue-light), var(--aviation-cyan-glow))',
              boxShadow: 'var(--aviation-glow-sm)'
            }}
          />
        </div>
        <div>
          <h1 
            className="text-2xl font-bold bg-clip-text text-transparent tracking-tight relative"
            style={{
              backgroundImage: isDarkMode 
                ? 'linear-gradient(to right, var(--aviation-blue-light), var(--aviation-cyan-glow))' 
                : 'linear-gradient(135deg, var(--aviation-blue-dark), var(--aviation-blue-medium), var(--aviation-blue-light))'
            }}
          >
            AeroTracker
            <span 
              className="absolute -top-1 -right-1 text-xs text-white px-1.5 py-0.5 rounded-sm opacity-90 tracking-wide" 
              style={{ 
                fontSize: '8px', 
                background: 'linear-gradient(to right, var(--aviation-blue-accent), var(--aviation-teal-highlight))'
              }}
            >
              BETA
            </span>
          </h1>
          <div className="flex items-center">
            <span 
              className="mr-2 font-medium text-xs tracking-wide"
              style={{ 
                color: isDarkMode ? 'var(--aviation-blue-ultra-light)' : 'var(--aviation-blue-dark)',
                textShadow: isDarkMode ? '0 0 8px rgba(85, 255, 221, 0.3)' : 'none'
              }}
            >
              Advanced Flight Tracking
            </span>
            <span 
              className="inline-block px-2 py-0.5 text-[10px] rounded-full text-white font-semibold aviation-pulse"
              style={{ 
                background: 'linear-gradient(to right, var(--aviation-blue-accent), var(--aviation-teal-highlight))',
                boxShadow: isDarkMode 
                  ? '0 2px 8px rgba(68, 153, 153, 0.5), var(--aviation-glow-sm)' 
                  : '0 2px 8px rgba(68, 153, 153, 0.4)'
              }}
            >
              PRO
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <div className="relative hidden md:block">
          <div 
            className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none" 
            style={{ 
              color: isDarkMode ? 'var(--aviation-blue-light)' : 'var(--aviation-blue-accent)'
            }}
          >
            <SearchIcon className="h-4 w-4" />
          </div>
          <input 
            type="search" 
            style={{ 
              backgroundColor: isDarkMode ? 'rgba(5, 39, 77, 0.7)' : 'rgba(255, 255, 255, 0.9)',
              borderColor: isDarkMode ? 'var(--aviation-dark-accent)' : 'var(--aviation-blue-light)', 
              color: isDarkMode ? 'var(--aviation-blue-ultra-light)' : 'var(--aviation-blue-dark)',
              boxShadow: isDarkMode 
                ? '0 2px 10px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(85, 255, 221, 0.1)'
                : '0 2px 10px rgba(10, 73, 149, 0.1), 0 0 0 1px rgba(85, 255, 221, 0.1)'
            }}
            className="pl-10 pr-4 py-2 text-sm rounded-full border focus:outline-none transition-all duration-200 backdrop-blur-md w-52" 
            placeholder="Search flights, airports..." 
          />
        </div>
        
        <div className="hidden md:flex items-center space-x-3">
          <div 
            className="flex items-center space-x-1 p-1 rounded-full backdrop-blur-md"
            style={{
              background: isDarkMode 
                ? 'rgba(5, 39, 77, 0.4)' 
                : 'rgba(255, 255, 255, 0.7)',
              border: isDarkMode 
                ? '1px solid rgba(85, 255, 221, 0.1)' 
                : '1px solid rgba(85, 255, 221, 0.2)',
              boxShadow: isDarkMode 
                ? '0 2px 8px rgba(0, 0, 0, 0.2)' 
                : '0 2px 8px rgba(10, 73, 149, 0.1)'
            }}
          >
            <Button 
              variant="ghost" 
              size="sm"
              className="aviation-tab-button active flex items-center space-x-1 rounded-full px-3"
              style={{ 
                height: '32px',
                background: 'linear-gradient(to right, var(--aviation-blue-dark), var(--aviation-blue-medium))',
                color: 'white',
                boxShadow: '0 2px 8px rgba(10, 73, 149, 0.2)'
              }}
            >
              <MapIcon className="h-4 w-4" />
              <span className="text-xs font-semibold">Map</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              className="aviation-tab-button flex items-center space-x-1 rounded-full px-3"
              style={{ 
                height: '32px',
                color: isDarkMode ? 'var(--aviation-blue-light)' : 'var(--aviation-blue-dark)'
              }}
            >
              <BarChart3Icon className="h-4 w-4" />
              <span className="text-xs">Stats</span> 
            </Button>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon"
            className="aviation-icon-btn relative"
          >
            <BellIcon className="h-5 w-5" />
            <span 
              className="absolute -top-1 -right-1 h-3 w-3 rounded-full aviation-pulse"
              style={{ 
                background: 'linear-gradient(to right, var(--aviation-blue-light), var(--aviation-cyan-glow))',
                boxShadow: 'var(--aviation-glow-sm)',
                border: isDarkMode ? '2px solid var(--aviation-dark-blue)' : '2px solid white'
              }}
            ></span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            className="aviation-icon-btn"
          >
            <Settings className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onThemeToggle}
            className="aviation-icon-btn"
          >
            {isDarkMode ? (
              <SunIcon className="h-5 w-5 text-yellow-400" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </Button>
          
          <Button 
            className="ml-2 aviation-btn-accent"
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
            className="aviation-icon-btn"
          >
            {isDarkMode ? (
              <SunIcon className="h-5 w-5 text-yellow-400" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            className="aviation-icon-btn"
          >
            <SearchIcon className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            className="aviation-icon-btn relative"
          >
            <BellIcon className="h-5 w-5" />
            <span 
              className="absolute -top-1 -right-1 h-2 w-2 rounded-full aviation-pulse"
              style={{ 
                background: 'linear-gradient(to right, var(--aviation-blue-light), var(--aviation-cyan-glow))',
                boxShadow: 'var(--aviation-glow-sm)',
                border: isDarkMode ? '1px solid var(--aviation-dark-blue)' : '1px solid white'
              }}
            ></span>
          </Button>
        </div>
      </div>
    </header>
  );
}