import { useAuth } from "@/hooks/use-auth";
import { Route, Redirect } from "wouter";
import { Loader2 } from "lucide-react";

type ProtectedRouteProps = {
  path: string;
  component: React.ComponentType;
};

export function ProtectedRoute({ path, component: Component }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  // If authentication is still loading, show a loading spinner
  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-[#4995fd]" />
        </div>
      </Route>
    );
  }

  // If user is not authenticated, redirect to the auth page
  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // If user is authenticated, render the protected component
  return <Route path={path} component={Component} />;
}