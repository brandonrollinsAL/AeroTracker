import React from 'react';
import { Button } from '@/components/ui/button';
import { MoonIcon, SunIcon, InfoIcon, SearchIcon, BellIcon, UserIcon, PlaneIcon, Settings, MapIcon, BarChart3Icon, CloudIcon } from 'lucide-react';

interface HeaderProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export default function Header({ isDarkMode, onThemeToggle }: HeaderProps) {
  return (
    <header 
      className={`h-16 py-2 px-6 flex items-center justify-between sticky top-0 z-50 ${
        isDarkMode 
          ? 'bg-[#002b4c] border-b border-[#003a65]/40' 
          : 'bg-white border-b border-[#4995fd]/20'
      } transition-all duration-300 backdrop-blur-sm`}
      style={{
        backgroundImage: isDarkMode 
          ? 'linear-gradient(to right, rgba(0,42,77,0.97), rgba(0,58,101,0.97))' 
          : 'linear-gradient(to right, rgba(255,255,255,0.97), rgba(240,248,255,0.97))',
        boxShadow: isDarkMode 
          ? '0 4px 20px rgba(0,58,101,0.3), 0 2px 8px rgba(73,149,253,0.2)' 
          : '0 4px 15px rgba(73,149,253,0.12), 0 2px 6px rgba(73,149,253,0.08)'
      }}
    >
      <div className="flex items-center">
        <div className="mr-3 relative group">
          <div 
            className={`h-10 w-10 rounded-lg flex items-center justify-center relative overflow-hidden ${
              isDarkMode ? 'bg-[#4995fd]' : 'bg-[#4995fd]'
            }`}
            style={{
              boxShadow: isDarkMode 
                ? '0 0 15px rgba(73, 149, 253, 0.35)' 
                : '0 0 10px rgba(73, 149, 253, 0.25)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#4995fd] to-[#003a65] opacity-90"></div>
            <PlaneIcon className="h-5 w-5 text-white transform rotate-45 relative z-10" />
            
            {/* Animated trail effect */}
            <div className="absolute h-1 w-8 bg-[#a0d0ec]/60 rounded-full -bottom-0.5 -left-3 transform rotate-45 origin-bottom-right group-hover:w-12 transition-all duration-300"></div>
          </div>
          <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-[#4995fd] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
        
        <div>
          <h1 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-[#003a65]'}`}>
            <span className="bg-gradient-to-r from-[#003a65] to-[#4995fd] bg-clip-text text-transparent">
              AeroTracker
            </span>
          </h1>
          <div className="flex items-center">
            <span className={`text-xs ${isDarkMode ? 'text-[#a0d0ec]/80' : 'text-[#003a65]/70'}`}>
              Flight Tracking
            </span>
            <div className="relative ml-2">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-[10px] font-medium bg-gradient-to-r from-[#003a65] to-[#4995fd] text-white">
                <CloudIcon className="h-2.5 w-2.5 mr-0.5 text-[#a0d0ec]" />
                AeroLink
              </span>
              <div className="absolute inset-0 rounded-sm bg-gradient-to-r from-[#003a65] to-[#4995fd] animate-pulse opacity-30 blur-[1px]"></div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <div className="relative hidden md:block group">
          <div 
            className={`absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none ${
              isDarkMode ? 'text-[#a0d0ec]/70' : 'text-[#4995fd]/70'
            } group-focus-within:text-[#4995fd]`}
          >
            <SearchIcon className="h-4 w-4" />
          </div>
          <input 
            type="search" 
            className={`pl-10 pr-4 py-2 text-sm rounded-full border ${
              isDarkMode 
                ? 'border-[#4995fd]/30 bg-[#002b4c]/50 text-white placeholder-[#a0d0ec]/50 focus:border-[#4995fd]/70' 
                : 'border-[#4995fd]/20 focus:border-[#4995fd] placeholder-[#003a65]/50'
            } focus:outline-none focus:ring-1 focus:ring-[#4995fd]/30 w-[240px] transition-all duration-300 focus:w-[300px]`} 
            placeholder="Search flights, airports, routes..." 
            style={{
              boxShadow: isDarkMode
                ? 'inset 0 1px 3px rgba(0,0,0,0.2), 0 1px 2px rgba(73,149,253,0.1)'
                : 'inset 0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(73,149,253,0.1)'
            }}
          />
          <div className={`absolute inset-y-0 right-0 flex items-center pr-3 ${
            isDarkMode ? 'text-[#a0d0ec]/30' : 'text-[#4995fd]/30'
          } pointer-events-none`}>
            <span className="text-xs">⌘K</span>
          </div>
        </div>
        
        <div className="hidden md:flex items-center space-x-2">
          <div className="flex items-center mr-2 p-1 bg-[#4995fd]/10 rounded-lg border border-[#4995fd]/20">
            <Button 
              size="sm"
              className={`flex items-center h-8 px-3 ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-[#003a65] to-[#4995fd] hover:from-[#003a65]/90 hover:to-[#4995fd]/90 text-white' 
                  : 'bg-gradient-to-r from-[#4995fd] to-[#a0d0ec] hover:from-[#0a4995] hover:to-[#4995fd] text-white'
              } rounded-md transition-all duration-200`}
              style={{
                boxShadow: '0 2px 5px rgba(73, 149, 253, 0.3)'
              }}
            >
              <MapIcon className="h-4 w-4 mr-1.5" />
              <span className="text-xs font-medium">Map</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              className={`flex items-center h-8 px-3 rounded-md ${
                isDarkMode 
                  ? 'text-[#a0d0ec] hover:text-white hover:bg-[#003a65]/40 border border-[#003a65]/30' 
                  : 'text-[#003a65] hover:bg-[#4995fd]/10 border border-[#4995fd]/20'
              }`}
              style={{
                background: isDarkMode
                  ? 'linear-gradient(to right, rgba(0,58,101,0.3), rgba(73,149,253,0.1))'
                  : 'linear-gradient(to right, rgba(73,149,253,0.05), rgba(160,208,236,0.1))',
                boxShadow: isDarkMode
                  ? 'inset 0 1px 1px rgba(73,149,253,0.1)'
                  : 'inset 0 1px 1px rgba(255,255,255,0.7)'
              }}
            >
              <BarChart3Icon className="h-4 w-4 mr-1.5" />
              <span className="text-xs">Stats</span> 
            </Button>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon"
            className={`h-9 w-9 rounded-full relative overflow-hidden ${
              isDarkMode 
                ? 'text-[#a0d0ec] hover:text-white hover:bg-[#003a65]/40 border border-[#003a65]/30' 
                : 'text-[#003a65] hover:bg-[#4995fd]/10 border border-[#4995fd]/20'
            }`}
            style={{
              boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.1)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[#4995fd]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <BellIcon className="h-5 w-5 relative z-10" />
            <div className="absolute top-1 right-1.5 h-2 w-2 bg-[#4995fd] rounded-full transform scale-0 animate-pulse"></div>
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            className={`h-9 w-9 rounded-full relative overflow-hidden ${
              isDarkMode 
                ? 'text-[#a0d0ec] hover:text-white hover:bg-[#003a65]/40 border border-[#003a65]/30' 
                : 'text-[#003a65] hover:bg-[#4995fd]/10 border border-[#4995fd]/20'
            }`}
            style={{
              boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.1)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[#4995fd]/5 opacity-0 hover:opacity-100 transition-opacity"></div>
            <Settings className="h-5 w-5 relative z-10" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onThemeToggle}
            className={`h-9 w-9 rounded-full relative overflow-hidden ${
              isDarkMode 
                ? 'text-[#a0d0ec] hover:text-white hover:bg-[#003a65]/40 border border-[#003a65]/30' 
                : 'text-[#003a65] hover:bg-[#4995fd]/10 border border-[#4995fd]/20'
            } transition-all duration-300`}
            style={{
              boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.1)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[#4995fd]/5 opacity-0 hover:opacity-100 transition-opacity"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-[#003a65]/10 to-transparent opacity-0 hover:opacity-100 transition-opacity"></div>
            {isDarkMode ? (
              <SunIcon className="h-5 w-5 relative z-10" />
            ) : (
              <MoonIcon className="h-5 w-5 relative z-10" />
            )}
          </Button>
          
          <Button 
            className={`ml-1 text-white rounded-md h-9 px-4 group overflow-hidden relative ${
              isDarkMode 
                ? 'bg-gradient-to-r from-[#0a4995] to-[#4995fd] hover:from-[#003a65] hover:to-[#4995fd]' 
                : 'bg-gradient-to-r from-[#003a65] to-[#4995fd] hover:from-[#0a4995] hover:to-[#4995fd]'
            } transition-all duration-300`}
            style={{
              boxShadow: isDarkMode 
                ? '0 3px 10px rgba(73, 149, 253, 0.3)' 
                : '0 3px 8px rgba(73, 149, 253, 0.25)'
            }}
          >
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-[#a0d0ec]/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute h-[1px] bottom-0 left-0 right-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
            <UserIcon className="h-4 w-4 mr-2 text-[#a0d0ec] group-hover:scale-110 transition-transform duration-300" />
            <span className="relative z-10 font-medium">Sign In</span>
          </Button>
        </div>
        
        <div className="md:hidden flex items-center space-x-1.5">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onThemeToggle}
            className={`relative h-8 w-8 rounded-full overflow-hidden ${
              isDarkMode 
                ? 'text-[#a0d0ec] hover:text-white hover:bg-[#003a65]/40 border border-[#003a65]/30' 
                : 'text-[#003a65] hover:bg-[#4995fd]/10 border border-[#4995fd]/20'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[#4995fd]/5 opacity-50"></div>
            {isDarkMode ? (
              <SunIcon className="h-4 w-4 relative z-10" />
            ) : (
              <MoonIcon className="h-4 w-4 relative z-10" />
            )}
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            className={`relative h-8 w-8 rounded-full overflow-hidden ${
              isDarkMode 
                ? 'text-[#a0d0ec] hover:text-white hover:bg-[#003a65]/40 border border-[#003a65]/30' 
                : 'text-[#003a65] hover:bg-[#4995fd]/10 border border-[#4995fd]/20'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[#4995fd]/5 opacity-50"></div>
            <SearchIcon className="h-4 w-4 relative z-10" />
          </Button>
          
          <Button 
            size="icon"
            className={`relative h-8 w-8 rounded-full overflow-hidden group ${
              isDarkMode 
                ? 'bg-gradient-to-r from-[#003a65] to-[#4995fd] text-white' 
                : 'bg-gradient-to-r from-[#4995fd] to-[#a0d0ec] text-white'
            }`}
            style={{
              boxShadow: isDarkMode
                ? '0 2px 5px rgba(0,58,101,0.4)'
                : '0 2px 5px rgba(73,149,253,0.3)'
            }}
          >
            <div className="absolute inset-0 bg-[#a0d0ec]/10 opacity-30"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute h-[1px] bottom-0 left-0 right-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
            <UserIcon className="h-4 w-4 relative z-10 group-hover:scale-110 transition-transform duration-300" />
          </Button>
        </div>
      </div>
    </header>
  );
}