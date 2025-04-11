import { createContext, ReactNode, useContext } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getQueryFn, apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

type SubscriptionPlan = {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
};

type SubscriptionStatus = {
  subscriptionTier: 'free' | 'premium' | 'enterprise';
  subscriptionStatus: 'active' | 'canceled' | 'past_due' | 'trialing' | 'inactive';
  subscriptionExpiresAt: string | null;
  isSubscriptionActive: boolean;
};

type SubscriptionContext = {
  plans: SubscriptionPlan[] | undefined;
  status: SubscriptionStatus | undefined;
  isLoading: boolean;
  isStatusLoading: boolean;
  isPremium: boolean;
  error: Error | null;
  createSubscription: (priceId: string) => Promise<{ clientSecret: string | null; subscriptionId: string }>;
  cancelSubscription: (cancelImmediately?: boolean) => Promise<{ success: boolean }>;
};

const SubscriptionContext = createContext<SubscriptionContext | null>(null);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  const {
    data: plans,
    isLoading,
    error
  } = useQuery<SubscriptionPlan[], Error>({
    queryKey: ['/api/subscription/plans'],
    queryFn: getQueryFn(),
  });
  
  const {
    data: status,
    isLoading: isStatusLoading,
  } = useQuery<SubscriptionStatus, Error>({
    queryKey: ['/api/subscription/status'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
  });
  
  const createSubscriptionMutation = useMutation({
    mutationFn: async (priceId: string) => {
      const response = await apiRequest('POST', '/api/subscription/create-subscription', { priceId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscription/status'] });
      toast({
        title: 'Success',
        description: 'Subscription created successfully!',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to create subscription: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  const cancelSubscriptionMutation = useMutation({
    mutationFn: async (cancelImmediately: boolean = false) => {
      const response = await apiRequest('POST', '/api/subscription/cancel-subscription', { cancelImmediately });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscription/status'] });
      toast({
        title: 'Subscription Canceled',
        description: 'Your subscription has been canceled successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to cancel subscription: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  const createSubscription = async (priceId: string) => {
    return createSubscriptionMutation.mutateAsync(priceId);
  };
  
  const cancelSubscription = async (cancelImmediately: boolean = false) => {
    return cancelSubscriptionMutation.mutateAsync(cancelImmediately);
  };
  
  const isPremium = status?.isSubscriptionActive && 
    (status.subscriptionTier === 'premium' || status.subscriptionTier === 'enterprise');
  
  return (
    <SubscriptionContext.Provider
      value={{
        plans,
        status,
        isLoading,
        isStatusLoading,
        isPremium,
        error: error || null,
        createSubscription,
        cancelSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  
  return context;
}