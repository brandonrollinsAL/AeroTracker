import { Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/hooks/use-theme";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { SubscriptionProvider } from "@/hooks/use-subscription";
import { queryClient } from "@/lib/queryClient";
import { ProtectedRoute } from "@/lib/protected-route";
import { Footer } from "@/components/Footer";
import HomePage from "@/pages/Home";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import SubscriptionPage from "@/pages/subscription-page";
import SubscriptionSuccessPage from "@/pages/subscription-success";
import PrivacyPolicy from "@/pages/privacy-policy";
import NotFound from "@/pages/not-found";
import HistoryPage from "@/pages/history-page";

// Import i18n (needs to be bundled)
import '@/i18n';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="aerotracker-theme">
        <AuthProvider>
          <SubscriptionProvider>
            <div className="flex flex-col min-h-screen">
              <main className="flex-grow">
                <Switch>
                  <Route path="/auth" component={AuthPage} />
                  {/* Protected routes */}
                  <ProtectedRoute path="/dashboard" component={DashboardPage} />
                  <ProtectedRoute path="/profile" component={() => <div>Profile Page</div>} />
                  <ProtectedRoute path="/subscription" component={SubscriptionPage} />
                  <ProtectedRoute path="/subscription/success" component={SubscriptionSuccessPage} />
                  {/* Public routes */}
                  <Route path="/privacy-policy" component={PrivacyPolicy} />
                  <Route path="/history" component={HistoryPage} />
                  <Route path="/" component={HomePage} />
                  <Route component={NotFound} />
                </Switch>
              </main>
              <Footer />
            </div>
            <Toaster />
          </SubscriptionProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;