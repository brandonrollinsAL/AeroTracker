import React from 'react';
import { useLocation } from 'wouter';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/use-theme';

interface AuthPopupProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
  description?: string;
}

export function AuthPopup({ isOpen, onClose, featureName, description }: AuthPopupProps) {
  const [_, navigate] = useLocation();
  const { isDark } = useTheme();
  
  const goToAuth = () => {
    navigate('/auth');
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={`sm:max-w-md border-[#4995fd]/20 ${
        isDark 
        ? 'bg-[#003a65]/90 backdrop-blur-lg text-white' 
        : 'bg-white/95 backdrop-blur-lg text-[#003a65]'
      }`}>
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 mr-2 ${isDark ? 'text-[#a0d0ec]' : 'text-[#4995fd]'}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M8 11h8" />
              <path d="M8 8h8" />
              <path d="M12 14v3" />
            </svg>
            Premium Feature: {featureName}
          </DialogTitle>
          <DialogDescription className={`mt-2 ${isDark ? 'text-[#a0d0ec]/70' : 'text-[#003a65]/70'}`}>
            {description || `Sign in or create an account to access ${featureName} and other premium features.`}
          </DialogDescription>
        </DialogHeader>
        
        <div className={`p-4 rounded-md ${isDark ? 'bg-[#012a47]/50' : 'bg-[#f0f7ff]'} mt-2`}>
          <h4 className="text-sm font-medium mb-2">Premium features include:</h4>
          <ul className="space-y-1 text-sm">
            <li className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-3.5 w-3.5 mr-2 ${isDark ? 'text-[#a0d0ec]' : 'text-[#4995fd]'}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Weather data overlays
            </li>
            <li className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-3.5 w-3.5 mr-2 ${isDark ? 'text-[#a0d0ec]' : 'text-[#4995fd]'}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Favorite flights
            </li>
            <li className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-3.5 w-3.5 mr-2 ${isDark ? 'text-[#a0d0ec]' : 'text-[#4995fd]'}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Route optimization tools
            </li>
            <li className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-3.5 w-3.5 mr-2 ${isDark ? 'text-[#a0d0ec]' : 'text-[#4995fd]'}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Detailed flight information
            </li>
          </ul>
        </div>
        
        <DialogFooter className="mt-4 flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Maybe Later
          </Button>
          <Button 
            onClick={goToAuth} 
            className={`flex-1 ${isDark ? 'bg-[#4995fd] hover:bg-[#4995fd]/90' : 'bg-[#4995fd] hover:bg-[#4995fd]/90'}`}
          >
            Sign In / Register
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}