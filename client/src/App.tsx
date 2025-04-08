import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import AuthPage from "@/pages/auth-page";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/protected-route";
import { useIOSOptimizations } from "@/lib/ios-helpers";
import { useDevice } from "@/hooks/use-device";
import { ThemeProvider } from "@/hooks/use-theme.tsx";
import { useEffect } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Apply iOS optimizations for better iOS Mobile and iPad experience
  useIOSOptimizations();
  
  // Get device information to apply platform-specific classes
  const { isIOS, isAndroid, type } = useDevice();
  
  // Apply device-specific body classes
  useEffect(() => {
    if (isIOS) {
      document.body.classList.add('ios-device');
      document.body.classList.add(`ios-${type}`);
    } else if (isAndroid) {
      document.body.classList.add('android-device');
      document.body.classList.add(`android-${type}`);
    }
    
    document.body.classList.add(`device-${type}`);
    
    return () => {
      document.body.classList.remove('ios-device', 'android-device');
      document.body.classList.remove('ios-mobile', 'ios-tablet', 'ios-desktop');
      document.body.classList.remove('android-mobile', 'android-tablet', 'android-desktop');
      document.body.classList.remove('device-mobile', 'device-tablet', 'device-desktop');
    };
  }, [isIOS, isAndroid, type]);
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Helmet>
            <meta charSet="utf-8" />
            <title>AeroTracker - Advanced Flight Tracking Platform</title>
            <meta name="description" content="Track flights in real-time with AeroTracker, the next-generation flight tracking platform for aviation professionals and enthusiasts." />
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
            <meta name="theme-color" content="#4995fd" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
            <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
          </Helmet>
          <Router />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
