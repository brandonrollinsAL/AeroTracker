import { useState } from "react";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

type AuthPopupProps = {
  children: React.ReactNode;
  title?: string;
  description?: string;
  trigger?: React.ReactNode;
};

export default function AuthPopup({
  children,
  title = "Sign in required",
  description = "Please sign in or create an account to access this feature.",
  trigger,
}: AuthPopupProps) {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // If already authenticated, just render the children
  if (user) {
    return <>{children}</>;
  }

  const handleSignIn = () => {
    setOpen(false);
    navigate("/auth");
  };

  // If not authenticated, render the trigger that opens the dialog
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <div className="cursor-pointer">{children}</div>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-primary">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSignIn}>Sign In</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}