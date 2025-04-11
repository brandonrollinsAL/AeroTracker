import { createContext, ReactNode, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

// Types for subscription data
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
}

export interface SubscriptionStatus {
  isSubscriptionActive: boolean;
  subscriptionTier: 'free' | 'premium';
  subscriptionStatus: 'active' | 'inactive' | 'past_due' | 'canceled' | 'trialing';
  subscriptionExpiresAt?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

// Context interface
interface SubscriptionContextType {
  plans: SubscriptionPlan[] | undefined;
  status: SubscriptionStatus | undefined;
  isLoading: boolean;
  error: Error | null;
  isPremium: boolean;
  createSubscription: (planId: string) => Promise<{
    clientSecret?: string;
    subscriptionId?: string;
  }>;
  cancelSubscription: () => Promise<void>;
}

// Create context
export const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

// Provider component
export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Fetch subscription plans
  const {
    data: plans,
    error: plansError,
    isLoading: plansLoading,
  } = useQuery<SubscriptionPlan[]>({
    queryKey: ['/api/subscription/plans'],
    queryFn: async ({ queryKey }: { queryKey: readonly string[] }) => {
      const response = await apiRequest('GET', queryKey[0]);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch subscription plans');
      }
      return response.json();
    },
    enabled: !!user,
  });

  // Fetch user subscription status
  const {
    data: status,
    error: statusError,
    isLoading: statusLoading,
  } = useQuery<SubscriptionStatus>({
    queryKey: ['/api/subscription/status'],
    queryFn: async ({ queryKey }: { queryKey: readonly string[] }) => {
      const response = await apiRequest('GET', queryKey[0]);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch subscription status');
      }
      return response.json();
    },
    enabled: !!user,
  });

  // Is premium user
  const isPremium = !!(
    status?.isSubscriptionActive && 
    status?.subscriptionTier === 'premium'
  );

  // Create subscription mutation
  const createSubscriptionMutation = useMutation({
    mutationFn: async (planId: string) => {
      const response = await apiRequest('POST', '/api/subscription/create', { planId });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create subscription');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscription/status'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Subscription Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Cancel subscription mutation
  const cancelSubscriptionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/subscription/cancel');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to cancel subscription');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscription/status'] });
      toast({
        title: 'Subscription Canceled',
        description: 'Your subscription has been cancelled. You will still have access until the end of the billing period.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Cancellation Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return (
    <SubscriptionContext.Provider
      value={{
        plans,
        status,
        isLoading: plansLoading || statusLoading,
        error: plansError || statusError || null,
        isPremium,
        createSubscription: createSubscriptionMutation.mutateAsync,
        cancelSubscription: cancelSubscriptionMutation.mutateAsync,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

// Hook to use the subscription context
export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}