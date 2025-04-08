import { Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { queryClient } from "@/lib/queryClient";
import { ProtectedRoute } from "@/components/protected-route";
import HomePage from "@/pages/Home";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="aerotracker-theme">
        <AuthProvider>
          <main className="min-h-screen">
            <Switch>
              <Route path="/auth" component={AuthPage} />
              {/* Protected routes */}
              <ProtectedRoute path="/dashboard" component={() => <div>Dashboard Page</div>} />
              <ProtectedRoute path="/profile" component={() => <div>Profile Page</div>} />
              {/* Public routes */}
              <Route path="/" component={HomePage} />
              <Route component={NotFound} />
            </Switch>
          </main>
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;