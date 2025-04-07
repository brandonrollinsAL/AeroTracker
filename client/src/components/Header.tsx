import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { 
  MoonIcon, 
  SunIcon, 
  InfoIcon, 
  SearchIcon, 
  BellIcon, 
  UserIcon, 
  PlaneIcon, 
  PlaneTakeoffIcon,
  Settings, 
  MapIcon, 
  BarChart3Icon, 
  CloudIcon,
  GlobeIcon,
  RadarIcon,
  LayoutDashboardIcon,
  CalendarIcon,
  BellRingIcon,
  PlusIcon,
  MinusIcon
} from 'lucide-react';

interface HeaderProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export default function Header({ isDarkMode, onThemeToggle }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  const notificationsRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const notificationButtonRef = useRef<HTMLButtonElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  
  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close notifications dropdown
      if (
        showNotifications && 
        notificationsRef.current && 
        !notificationsRef.current.contains(event.target as Node) &&
        notificationButtonRef.current &&
        !notificationButtonRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
      
      // Close menu dropdown
      if (
        showMenu && 
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target as Node)
      ) {
        setShowMenu(false);
      }
    };
    
    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);
    
    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications, showMenu]);
  
  const notifications = [
    { id: 1, title: "Flight UA289 Delayed", type: "alert", time: "2m ago" },
    { id: 2, title: "Weather Alert at LAX", type: "weather", time: "15m ago" },
    { id: 3, title: "AA100 Route Changed", type: "info", time: "1h ago" }
  ];
  
  const menuItems = [
    { icon: <GlobeIcon size={16} />, label: "Map View", active: true },
    { icon: <RadarIcon size={16} />, label: "Live Tracking" },
    { icon: <LayoutDashboardIcon size={16} />, label: "Dashboard" },
    { icon: <PlaneIcon size={16} />, label: "Fleet Analysis" },
    { icon: <CalendarIcon size={16} />, label: "Schedule" }
  ];
  
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
            className={`h-11 w-11 rounded-lg flex items-center justify-center relative overflow-hidden ${
              isDarkMode ? 'bg-[#4995fd]' : 'bg-[#4995fd]'
            }`}
            style={{
              boxShadow: isDarkMode 
                ? '0 0 18px rgba(73, 149, 253, 0.4)' 
                : '0 0 15px rgba(73, 149, 253, 0.3)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#4995fd] to-[#003a65] opacity-90"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjAgMGMxMS4wNDYgMCAyMCA4Ljk1NCAyMCAyMHMtOC45NTQgMjAtMjAgMjBTMCAzMS4wNDYgMCAyMCA4Ljk1NCAwIDIwIDB6bTUgMTVhNSA1IDAgMTAtMTAgMCA1IDUgMCAwMDEwIDB6IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9Ii4xIi8+PC9zdmc+')] bg-no-repeat bg-center bg-contain opacity-20"></div>
            
            <div className="relative group">
              <PlaneTakeoffIcon className="h-5 w-5 text-white transform rotate-45 relative z-10 group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute w-6 h-1 bg-[#a0d0ec]/60 rounded-full -bottom-0.5 -left-3 transform rotate-45 origin-bottom-right group-hover:w-9 transition-all duration-500"></div>
            </div>
            
            {/* Animated pulsing radar effect */}
            <div className="absolute inset-0 rounded-full border-2 border-[#a0d0ec]/20 scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-1000"></div>
          </div>
          <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-[#4995fd] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
        </div>
        
        <div>
          <h1 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-[#003a65]'}`}>
            <span className="bg-gradient-to-r from-[#003a65] to-[#4995fd] bg-clip-text text-transparent flex items-center">
              <span className="mr-1">AeroTracker</span>
              <span className="text-xs px-1.5 py-0.5 bg-[#4995fd]/10 rounded-sm text-[#4995fd] font-medium">PRO</span>
            </span>
          </h1>
          <div className="flex items-center">
            <span className={`text-xs ${isDarkMode ? 'text-[#a0d0ec]/80' : 'text-[#003a65]/70'}`}>
              Advanced Flight Tracking
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
        
        {/* New navigation buttons */}
        <div className="hidden lg:flex ml-8 space-x-1">
          {menuItems.map((item, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              className={`h-8 px-3 rounded text-xs font-medium flex items-center gap-1.5 border border-transparent ${
                item.active
                  ? isDarkMode
                    ? 'bg-[#003a65]/60 text-white border-[#4995fd]/30'
                    : 'bg-[#4995fd]/10 text-[#003a65] border-[#4995fd]/20'
                  : isDarkMode
                    ? 'text-[#a0d0ec]/80 hover:text-white hover:bg-[#003a65]/40'
                    : 'text-[#003a65]/70 hover:text-[#003a65] hover:bg-[#4995fd]/10'
              }`}
              style={{
                boxShadow: item.active
                  ? isDarkMode
                    ? 'inset 0 1px 1px rgba(0,0,0,0.1), 0 1px 1px rgba(73,149,253,0.1)'
                    : 'inset 0 1px 1px rgba(0,0,0,0.05), 0 1px 1px rgba(73,149,253,0.05)'
                  : 'none',
              }}
            >
              <span className="opacity-80">{item.icon}</span>
              {item.label}
              {item.active && <div className="h-1 w-1 rounded-full bg-[#4995fd] ml-0.5 animate-pulse"></div>}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <div className="relative hidden md:block group">
          <div 
            className={`absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none ${
              isDarkMode ? 'text-[#a0d0ec]/70' : 'text-[#4995fd]/70'
            } group-focus-within:text-[#4995fd] group-hover:scale-105 transition-transform duration-200`}
          >
            <SearchIcon className="h-4 w-4" />
          </div>
          <input 
            type="search" 
            className={`pl-10 pr-12 py-2 text-sm rounded-full border ${
              isDarkMode 
                ? 'border-[#4995fd]/30 bg-[#002b4c]/50 text-white placeholder-[#a0d0ec]/50 focus:border-[#4995fd]/70' 
                : 'border-[#4995fd]/20 focus:border-[#4995fd] placeholder-[#003a65]/50'
            } focus:outline-none focus:ring-1 focus:ring-[#4995fd]/30 w-[240px] transition-all duration-300 focus:w-[320px]`} 
            placeholder="Search flights, airports, routes..." 
            style={{
              boxShadow: isDarkMode
                ? 'inset 0 1px 3px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.1)'
                : 'inset 0 1px 3px rgba(0,0,0,0.05), 0 2px 4px rgba(73,149,253,0.1)'
            }}
          />
          <div className={`absolute inset-y-0 right-0 flex items-center pr-3 ${
            isDarkMode ? 'text-[#a0d0ec]/30' : 'text-[#4995fd]/30'
          } pointer-events-none`}>
            <span className="inline-flex items-center justify-center rounded text-xs bg-[#4995fd]/10 px-1.5 py-0.5 border border-[#4995fd]/20">⌘K</span>
          </div>
        </div>
        
        <div className="hidden md:flex items-center space-x-2">
          <div className="flex items-center mr-2 p-1.5 bg-[#4995fd]/10 rounded-lg border border-[#4995fd]/20">
            <Button 
              size="sm"
              className={`flex items-center h-8 px-3 ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-[#003a65] to-[#4995fd] hover:from-[#003a65]/90 hover:to-[#4995fd]/90 text-white' 
                  : 'bg-gradient-to-r from-[#4995fd] to-[#003a65] hover:from-[#0a4995] hover:to-[#4995fd] text-white'
              } rounded-md transition-all duration-200 relative overflow-hidden group`}
              style={{
                boxShadow: '0 2px 5px rgba(73, 149, 253, 0.3)'
              }}
            >
              <div className="absolute inset-0 w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <MapIcon className="h-4 w-4 mr-1.5 relative z-10" />
              <span className="text-xs font-medium relative z-10">Map</span>
            </Button>
            
            <div className="mx-1 h-6 w-px bg-[#4995fd]/20"></div>
            
            <Button 
              variant="ghost" 
              size="sm"
              className={`flex items-center h-8 px-3 rounded-md ${
                isDarkMode 
                  ? 'text-[#a0d0ec] hover:text-white hover:bg-[#003a65]/40 border border-[#003a65]/30' 
                  : 'text-[#003a65] hover:bg-[#4995fd]/10 border border-[#4995fd]/20'
              } relative overflow-hidden group`}
              style={{
                background: isDarkMode
                  ? 'linear-gradient(to right, rgba(0,58,101,0.3), rgba(73,149,253,0.1))'
                  : 'linear-gradient(to right, rgba(73,149,253,0.05), rgba(160,208,236,0.1))',
                boxShadow: isDarkMode
                  ? 'inset 0 1px 1px rgba(73,149,253,0.1)'
                  : 'inset 0 1px 1px rgba(255,255,255,0.7)'
              }}
            >
              <div className="absolute inset-0 w-full bg-gradient-to-r from-transparent via-[#4995fd]/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <BarChart3Icon className="h-4 w-4 mr-1.5 relative z-10" />
              <span className="text-xs relative z-10">Stats</span> 
            </Button>
            
            <div className="mx-1 h-6 w-px bg-[#4995fd]/20"></div>
            
            <div className="px-1 flex items-center space-x-0.5">
              <Button
                variant="ghost"
                size="sm"
                className={`rounded p-1 ${
                  isDarkMode
                    ? 'text-[#a0d0ec]/80 hover:text-white hover:bg-[#003a65]/40'
                    : 'text-[#003a65]/70 hover:text-[#003a65] hover:bg-[#4995fd]/10'
                }`}
              >
                <PlusIcon size={14} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`rounded p-1 ${
                  isDarkMode
                    ? 'text-[#a0d0ec]/80 hover:text-white hover:bg-[#003a65]/40'
                    : 'text-[#003a65]/70 hover:text-[#003a65] hover:bg-[#4995fd]/10'
                }`}
              >
                <MinusIcon size={14} />
              </Button>
            </div>
          </div>
          
          <div className="relative">
            <Button 
              ref={notificationButtonRef}
              variant="ghost" 
              size="icon"
              onClick={() => setShowNotifications(!showNotifications)}
              className={`h-9 w-9 rounded-full relative overflow-hidden group ${
                isDarkMode 
                  ? 'text-[#a0d0ec] hover:text-white hover:bg-[#003a65]/40 border border-[#003a65]/30' 
                  : 'text-[#003a65] hover:bg-[#4995fd]/10 border border-[#4995fd]/20'
              }`}
              style={{
                boxShadow: isDarkMode 
                  ? 'inset 0 1px 1px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.1)'
                  : 'inset 0 1px 1px rgba(255,255,255,0.3), 0 2px 4px rgba(73,149,253,0.1)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[#4995fd]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute h-[1px] w-full bg-[#4995fd]/20 bottom-0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              
              {/* Pulsing rings effect */}
              <div className="absolute inset-0 rounded-full border border-[#4995fd]/10 scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-700"></div>
              <div className="absolute inset-0 rounded-full border border-[#4995fd]/5 scale-0 opacity-0 group-hover:scale-110 group-hover:opacity-100 transition-all duration-1000 delay-100"></div>
              
              <BellIcon className="h-5 w-5 relative z-10 group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute top-1 right-1.5 h-2 w-2 bg-[#4995fd] rounded-full animate-pulse"></div>
            </Button>
            
            {/* Notifications dropdown */}
            {showNotifications && (
              <div 
                ref={notificationsRef}
                className={`absolute right-0 mt-2 w-80 rounded-lg overflow-hidden ${
                  isDarkMode 
                    ? 'bg-[#002b4c] border border-[#003a65]/60' 
                    : 'bg-white border border-[#4995fd]/20'
                } shadow-xl z-50 transition-all duration-200 transform origin-top-right`}
                style={{
                  boxShadow: isDarkMode 
                    ? '0 10px 25px rgba(0, 0, 0, 0.3), 0 0 1px rgba(73, 149, 253, 0.4)' 
                    : '0 10px 25px rgba(10, 73, 149, 0.15), 0 0 1px rgba(73, 149, 253, 0.2)',
                  backgroundImage: isDarkMode 
                    ? 'linear-gradient(to bottom, rgba(0, 58, 101, 0.95), rgba(0, 29, 54, 0.95))' 
                    : 'linear-gradient(to bottom, rgba(255, 255, 255, 0.97), rgba(240, 248, 255, 0.97))'
                }}
              >
                <div className={`p-3 border-b ${isDarkMode ? 'border-[#003a65]' : 'border-[#4995fd]/10'}`}>
                  <div className="flex justify-between items-center">
                    <h3 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-[#003a65]'}`}>Notifications</h3>
                    <div className="flex space-x-2">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-[#4995fd]/10 text-xs font-medium text-[#4995fd]">
                        {notifications.length}
                      </span>
                      <button 
                        className={`text-xs ${isDarkMode ? 'text-[#a0d0ec]/80 hover:text-white' : 'text-[#003a65]/70 hover:text-[#003a65]'}`}
                        onClick={() => setShowNotifications(false)}
                      >
                        Clear all
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="overflow-y-auto max-h-[300px] py-1 aviation-scroll">
                  {notifications.map(notification => (
                    <div 
                      key={notification.id}
                      className={`px-4 py-3 border-b hover:bg-[#4995fd]/5 transition-colors duration-150 cursor-pointer ${
                        isDarkMode ? 'border-[#003a65]/30' : 'border-[#4995fd]/10'
                      }`}
                    >
                      <div className="flex items-start">
                        <div 
                          className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${
                            notification.type === 'alert' 
                              ? 'bg-red-500/10' 
                              : notification.type === 'weather' 
                                ? 'bg-blue-500/10' 
                                : 'bg-[#4995fd]/10'
                          }`}
                        >
                          {notification.type === 'alert' ? (
                            <BellRingIcon size={16} className="text-red-500" />
                          ) : notification.type === 'weather' ? (
                            <CloudIcon size={16} className="text-blue-500" />
                          ) : (
                            <InfoIcon size={16} className="text-[#4995fd]" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-[#003a65]'} font-medium`}>
                            {notification.title}
                          </p>
                          <span className={`text-xs ${isDarkMode ? 'text-[#a0d0ec]/60' : 'text-[#003a65]/60'}`}>
                            {notification.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div 
                  className={`p-3 flex justify-center ${isDarkMode ? 'bg-[#003a65]/30' : 'bg-[#4995fd]/5'}`}
                >
                  <button 
                    className={`text-xs font-medium ${isDarkMode ? 'text-[#a0d0ec] hover:text-white' : 'text-[#003a65] hover:text-[#4995fd]'}`}
                  >
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <Button 
            variant="ghost" 
            size="icon"
            className={`h-9 w-9 rounded-full relative overflow-hidden group ${
              isDarkMode 
                ? 'text-[#a0d0ec] hover:text-white hover:bg-[#003a65]/40 border border-[#003a65]/30' 
                : 'text-[#003a65] hover:bg-[#4995fd]/10 border border-[#4995fd]/20'
            }`}
            style={{
              boxShadow: isDarkMode 
                ? 'inset 0 1px 1px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.1)'
                : 'inset 0 1px 1px rgba(255,255,255,0.3), 0 2px 4px rgba(73,149,253,0.1)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[#4995fd]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute h-[1px] w-full bg-[#4995fd]/20 bottom-0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            
            {/* Rotating gear animation */}
            <Settings className="h-5 w-5 relative z-10 group-hover:rotate-45 transition-transform duration-500" />
            
            {/* Subtle glow effect */}
            <div className="absolute inset-0 rounded-full bg-[#4995fd]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-[2px]"></div>
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onThemeToggle}
            className={`h-9 w-9 rounded-full relative overflow-hidden group ${
              isDarkMode 
                ? 'text-[#a0d0ec] hover:text-white hover:bg-[#003a65]/40 border border-[#003a65]/30' 
                : 'text-[#003a65] hover:bg-[#4995fd]/10 border border-[#4995fd]/20'
            } transition-all duration-300`}
            style={{
              boxShadow: isDarkMode 
                ? 'inset 0 1px 1px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.1)'
                : 'inset 0 1px 1px rgba(255,255,255,0.3), 0 2px 4px rgba(73,149,253,0.1)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[#4995fd]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute h-[1px] w-full bg-[#4995fd]/20 bottom-0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            
            {/* Animated theme icon transition */}
            <div className="relative h-5 w-5">
              {isDarkMode ? (
                <SunIcon className="h-5 w-5 absolute inset-0 z-10 group-hover:scale-110 transition-transform duration-300 group-hover:rotate-45 transition-all" />
              ) : (
                <MoonIcon className="h-5 w-5 absolute inset-0 z-10 group-hover:scale-110 transition-transform duration-300 group-hover:-rotate-12 transition-all" />
              )}
            </div>
            
            {/* Subtle glow effect */}
            <div className="absolute inset-0 rounded-full bg-[#4995fd]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-[2px]"></div>
          </Button>
          
          <div className="relative">
            <Button 
              ref={menuButtonRef}
              onClick={() => setShowMenu(!showMenu)}
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
            
            {/* Menu dropdown */}
            {showMenu && (
              <div 
                ref={menuRef}
                className={`absolute right-0 mt-2 w-64 rounded-lg overflow-hidden ${
                  isDarkMode 
                    ? 'bg-[#002b4c] border border-[#003a65]/60' 
                    : 'bg-white border border-[#4995fd]/20'
                } shadow-xl z-50`}
                style={{
                  boxShadow: isDarkMode 
                    ? '0 10px 25px rgba(0, 0, 0, 0.3), 0 0 1px rgba(73, 149, 253, 0.4)' 
                    : '0 10px 25px rgba(10, 73, 149, 0.15), 0 0 1px rgba(73, 149, 253, 0.2)',
                  backgroundImage: isDarkMode 
                    ? 'linear-gradient(to bottom, rgba(0, 58, 101, 0.95), rgba(0, 29, 54, 0.95))' 
                    : 'linear-gradient(to bottom, rgba(255, 255, 255, 0.97), rgba(240, 248, 255, 0.97))'
                }}
              >
                <div className="p-4 border-b border-b-[#4995fd]/10">
                  <div className="flex items-center">
                    <div 
                      className="h-12 w-12 rounded-lg flex items-center justify-center relative overflow-hidden mr-3"
                      style={{
                        backgroundImage: `linear-gradient(135deg, #4995fd, #003a65)`,
                        boxShadow: isDarkMode 
                          ? '0 3px 8px rgba(0,0,0,0.3)' 
                          : '0 3px 8px rgba(73,149,253,0.2)'
                      }}
                    >
                      <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-white via-transparent to-transparent"></div>
                      <UserIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-[#003a65]'}`}>Guest User</div>
                      <div className={`text-xs ${isDarkMode ? 'text-[#a0d0ec]/70' : 'text-[#003a65]/70'}`}>Sign in to save preferences</div>
                    </div>
                  </div>
                </div>
                
                <div className="py-1">
                  {menuItems.map((item, index) => (
                    <button
                      key={index}
                      className={`w-full flex items-center px-4 py-2.5 text-sm ${
                        item.active 
                          ? isDarkMode 
                            ? 'bg-[#003a65] text-white' 
                            : 'bg-[#4995fd]/10 text-[#003a65]' 
                          : isDarkMode 
                            ? 'text-[#a0d0ec] hover:bg-[#003a65]/60 hover:text-white' 
                            : 'text-[#003a65] hover:bg-[#4995fd]/5'
                      } transition-colors duration-150`}
                    >
                      <span className={`mr-3 ${item.active ? 'text-[#4995fd]' : ''}`}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                      {item.active && (
                        <span className="ml-auto">
                          <div className="h-1.5 w-1.5 rounded-full bg-[#4995fd]"></div>
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                
                <div className={`p-3 ${isDarkMode ? 'bg-[#001f3f]/50' : 'bg-[#4995fd]/5'}`}>
                  <button 
                    className={`w-full flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium ${
                      isDarkMode 
                        ? 'bg-[#003a65] text-white hover:bg-[#003a65]/90' 
                        : 'bg-gradient-to-r from-[#003a65] to-[#4995fd] text-white'
                    }`}
                    style={{
                      boxShadow: isDarkMode 
                        ? '0 3px 5px rgba(0,0,0,0.2)' 
                        : '0 3px 5px rgba(73,149,253,0.2)'
                    }}
                  >
                    Create Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="md:hidden flex items-center space-x-1.5">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onThemeToggle}
            className={`relative h-8 w-8 rounded-full overflow-hidden group ${
              isDarkMode 
                ? 'text-[#a0d0ec] hover:text-white hover:bg-[#003a65]/40 border border-[#003a65]/30' 
                : 'text-[#003a65] hover:bg-[#4995fd]/10 border border-[#4995fd]/20'
            }`}
            style={{
              boxShadow: isDarkMode 
                ? 'inset 0 1px 1px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.1)'
                : 'inset 0 1px 1px rgba(255,255,255,0.3), 0 2px 4px rgba(73,149,253,0.1)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[#4995fd]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute h-[1px] w-full bg-[#4995fd]/20 bottom-0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            <div className="relative h-4 w-4">
              {isDarkMode ? (
                <SunIcon className="h-4 w-4 absolute inset-0 z-10 group-hover:scale-110 transition-transform duration-300 group-hover:rotate-45 transition-all" />
              ) : (
                <MoonIcon className="h-4 w-4 absolute inset-0 z-10 group-hover:scale-110 transition-transform duration-300 group-hover:-rotate-12 transition-all" />
              )}
            </div>
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            className={`relative h-8 w-8 rounded-full overflow-hidden group ${
              isDarkMode 
                ? 'text-[#a0d0ec] hover:text-white hover:bg-[#003a65]/40 border border-[#003a65]/30' 
                : 'text-[#003a65] hover:bg-[#4995fd]/10 border border-[#4995fd]/20'
            }`}
            style={{
              boxShadow: isDarkMode 
                ? 'inset 0 1px 1px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.1)'
                : 'inset 0 1px 1px rgba(255,255,255,0.3), 0 2px 4px rgba(73,149,253,0.1)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[#4995fd]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute h-[1px] w-full bg-[#4995fd]/20 bottom-0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            <SearchIcon className="h-4 w-4 relative z-10 group-hover:scale-110 transition-transform duration-300" />
          </Button>
          
          <Button 
            ref={menuButtonRef}
            onClick={() => setShowMenu(!showMenu)}
            size="icon"
            className={`relative h-8 w-8 rounded-full overflow-hidden group ${
              isDarkMode 
                ? 'bg-gradient-to-r from-[#003a65] to-[#4995fd] text-white' 
                : 'bg-gradient-to-r from-[#4995fd] to-[#003a65] text-white'
            }`}
            style={{
              boxShadow: isDarkMode
                ? '0 2px 5px rgba(0,58,101,0.4)'
                : '0 2px 5px rgba(73,149,253,0.3)'
            }}
          >
            <div className="absolute inset-0 bg-[#a0d0ec]/10 opacity-30"></div>
            <div className="absolute w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            <div className="absolute h-[1px] bottom-0 left-0 right-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
            <UserIcon className="h-4 w-4 relative z-10 group-hover:scale-110 transition-transform duration-300" />
          </Button>
        </div>
      </div>
    </header>
  );
}