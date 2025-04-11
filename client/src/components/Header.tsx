import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { 
  MoonIcon, 
  SunIcon, 
  UserIcon, 
  PlaneTakeoffIcon,
  ClockIcon,
  LogOut,
  User,
  CreditCard,
  Crown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/use-auth';
import { useSubscription } from '@/hooks/use-subscription';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export default function Header({ isDarkMode, onThemeToggle }: HeaderProps) {
  const [currentTime, setCurrentTime] = useState<{
    local: string;
    zulu: string;
    date: string;
  }>({
    local: '',
    zulu: '',
    date: ''
  });
  
  // Time update effect
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      
      // Local time (HH:MM:SS)
      const localHours = now.getHours().toString().padStart(2, '0');
      const localMinutes = now.getMinutes().toString().padStart(2, '0');
      const localSeconds = now.getSeconds().toString().padStart(2, '0');
      const localTime = `${localHours}:${localMinutes}:${localSeconds}`;
      
      // Zulu/UTC time (HH:MM:SS Z)
      const zuluHours = now.getUTCHours().toString().padStart(2, '0');
      const zuluMinutes = now.getUTCMinutes().toString().padStart(2, '0');
      const zuluSeconds = now.getUTCSeconds().toString().padStart(2, '0');
      const zuluTime = `${zuluHours}:${zuluMinutes}:${zuluSeconds}Z`;
      
      // Date (DD MMM YYYY)
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const day = now.getDate().toString().padStart(2, '0');
      const month = monthNames[now.getMonth()];
      const year = now.getFullYear();
      const date = `${day} ${month} ${year}`;
      
      setCurrentTime({
        local: localTime,
        zulu: zuluTime,
        date: date
      });
    };
    
    // Update immediately
    updateTime();
    
    // Update every second
    const interval = setInterval(updateTime, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
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
          : 'linear-gradient(to right, rgba(255,255,255,0.97), rgba(240,248,255,0.97))'
      }}
    >
      {/* Left side - Logo and app name only */}
      <div className="flex items-center">
        <div className="mr-3 relative group">
          {/* Logo */}
          <div className="h-10 w-10 rounded-lg flex items-center justify-center relative overflow-hidden bg-[#4995fd]">
            <div className="absolute inset-0 bg-gradient-to-br from-[#4995fd] to-[#003a65] opacity-90"></div>
            <PlaneTakeoffIcon className="h-5 w-5 text-white transform rotate-45 relative z-10" />
          </div>
        </div>
        
        {/* App name */}
        <div>
          <h1 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-[#003a65]'}`}>
            <span className="bg-gradient-to-r from-[#003a65] to-[#4995fd] bg-clip-text text-transparent">
              AeroTracker
            </span>
          </h1>
          <span className={`text-xs ${isDarkMode ? 'text-[#a0d0ec]/80' : 'text-[#003a65]/70'}`}>
            Advanced Flight Tracking
          </span>
        </div>
      </div>
      
      {/* Right side - Time display and actions */}
      <div className="flex items-center space-x-3">
        {/* Time display section */}
        <div className="hidden md:flex items-center mr-3 p-1.5 bg-[#4995fd]/5 rounded-lg border border-[#4995fd]/10">
          <div className="flex flex-col items-center mr-3">
            <div className="flex items-center mb-0.5">
              <ClockIcon className={`h-3.5 w-3.5 mr-1.5 ${isDarkMode ? 'text-[#a0d0ec]' : 'text-[#4995fd]'}`} />
              <span className={`text-xs font-semibold ${isDarkMode ? 'text-[#a0d0ec]' : 'text-[#003a65]'}`}>
                Local
              </span>
            </div>
            <div className={`text-sm font-mono font-medium ${isDarkMode ? 'text-white' : 'text-[#003a65]'}`}>
              {currentTime.local}
            </div>
          </div>
          
          <div className="h-8 w-px bg-[#4995fd]/10 mx-2"></div>
          
          <div className="flex flex-col items-center">
            <div className="flex items-center mb-0.5">
              <ClockIcon className={`h-3.5 w-3.5 mr-1.5 ${isDarkMode ? 'text-[#a0d0ec]' : 'text-[#4995fd]'}`} />
              <span className={`text-xs font-semibold ${isDarkMode ? 'text-[#a0d0ec]' : 'text-[#003a65]'}`}>
                Zulu
              </span>
            </div>
            <div className={`text-sm font-mono font-medium ${isDarkMode ? 'text-white' : 'text-[#003a65]'}`}>
              {currentTime.zulu}
            </div>
          </div>
        </div>
        
        {/* Action buttons - Simplified */}
        <div className="flex items-center space-x-1.5">
          {/* Theme toggle button - Kept this as it's essential for user experience */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onThemeToggle}
            className={`h-9 w-9 rounded-full relative ${
              isDarkMode 
                ? 'text-[#a0d0ec] hover:text-white border border-[#003a65]/30' 
                : 'text-[#003a65] hover:bg-[#4995fd]/10 border border-[#4995fd]/10'
            }`}
          >
            {isDarkMode ? (
              <SunIcon className="h-4 w-4" />
            ) : (
              <MoonIcon className="h-4 w-4" />
            )}
          </Button>
          
          {/* User profile or sign in button */}
          {
            (() => {
              const { user, logoutMutation } = useAuth();
              const [, navigate] = useLocation();
              
              if (user) {
                return (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className={`ml-1 rounded-md h-9 ${
                          isDarkMode
                            ? 'bg-[#003a65]/70 text-white hover:bg-[#003a65]'
                            : 'bg-[#4995fd]/10 text-[#003a65] hover:bg-[#4995fd]/20'
                        } px-3 flex items-center space-x-2`}
                      >
                        <Avatar className="h-6 w-6">
                          <AvatarFallback 
                            className="bg-gradient-to-r from-[#003a65] to-[#4995fd] text-white text-xs"
                          >
                            {user.username.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{user.username}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                      {(() => {
                        // Get subscription status
                        const { isPremium, status } = useSubscription();
                        return (
                          <DropdownMenuItem 
                            className="cursor-pointer"
                            onClick={() => navigate('/subscription')}
                          >
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center">
                                {isPremium ? (
                                  <Crown className="mr-2 h-4 w-4 text-amber-500" />
                                ) : (
                                  <CreditCard className="mr-2 h-4 w-4" />
                                )}
                                <span>Subscription</span>
                              </div>
                              {status && (
                                <Badge 
                                  className={`ml-2 text-xs ${
                                    isPremium ? 'bg-blue-600' : 'bg-gray-500'
                                  }`}
                                >
                                  {isPremium ? 'Premium' : 'Free'}
                                </Badge>
                              )}
                            </div>
                          </DropdownMenuItem>
                        );
                      })()}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="cursor-pointer text-red-500 focus:text-red-500"
                        onClick={() => {
                          logoutMutation.mutate();
                        }}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              }
              
              return (
                <Button
                  className={`ml-1 text-white rounded-md h-9 px-4 ${
                    isDarkMode 
                      ? 'bg-gradient-to-r from-[#0a4995] to-[#4995fd]' 
                      : 'bg-gradient-to-r from-[#003a65] to-[#4995fd]'
                  }`}
                  onClick={() => navigate('/auth')}
                >
                  <UserIcon className="h-4 w-4 mr-2 text-[#a0d0ec]" />
                  <span>Sign In</span>
                </Button>
              );
            })()
          }
        </div>
      </div>
    </header>
  );
}