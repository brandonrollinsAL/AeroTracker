import React, { useState } from 'react';
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { PlaneTakeoffIcon, Lock } from "lucide-react";

type AuthPopupProps = {
  triggerId?: string;
  featureName?: string;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  children?: React.ReactNode;
};

const AuthPopup = ({ 
  triggerId, 
  featureName = "premium features", 
  isOpen, 
  onOpenChange, 
  children 
}: AuthPopupProps) => {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [controlledOpen, setControlledOpen] = useState(false);

  // Use either controlled or uncontrolled state
  const open = isOpen !== undefined ? isOpen : controlledOpen;
  const setOpen = onOpenChange || setControlledOpen;

  // If user is authenticated, don't show the dialog
  if (user) return <>{children}</>;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && (
        <DialogTrigger asChild>
          <div id={triggerId}>{children}</div>
        </DialogTrigger>
      )}
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-gradient-to-br from-[#4995fd] to-[#003a65] flex items-center justify-center">
            <Lock className="h-6 w-6 text-white" />
          </div>
          <DialogTitle className="text-center text-xl">Sign in required</DialogTitle>
          <DialogDescription className="text-center max-w-xs mx-auto">
            You need to sign in or create an account to access {featureName}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0 justify-center mt-2">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          
          <Button 
            className="bg-[#4995fd] hover:bg-[#3d87eb] text-white"
            onClick={() => navigate("/auth")}
          >
            <PlaneTakeoffIcon className="mr-2 h-4 w-4" />
            Sign in
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthPopup;