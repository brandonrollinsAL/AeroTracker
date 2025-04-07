import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Helmet>
        <meta charSet="utf-8" />
        <title>AeroTracker - Advanced Flight Tracking Platform</title>
        <meta name="description" content="Track flights in real-time with AeroTracker, the next-generation flight tracking platform for aviation professionals and enthusiasts." />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      </Helmet>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
