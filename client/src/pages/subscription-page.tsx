import { useState } from 'react';
import { useSubscription } from '@/hooks/use-subscription';
import { useToast } from '@/hooks/use-toast';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, Check, X } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Make sure to call loadStripe outside of a component's render to avoid
// recreating the Stripe object on every render
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY as string);

// Checkout form component
function CheckoutForm({ clientSecret }: { clientSecret: string }) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const { error: submitError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/subscription/success`,
        },
      });

      if (submitError) {
        setError(submitError.message ?? 'An error occurred');
        toast({
          title: 'Payment Failed',
          description: submitError.message,
          variant: 'destructive',
        });
      }
    } catch (e: any) {
      setError(e.message ?? 'An error occurred');
      toast({
        title: 'Payment Error',
        description: e.message,
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      
      {error && (
        <div className="p-3 text-sm text-white bg-red-500 rounded-md">
          {error}
        </div>
      )}
      
      <Button 
        type="submit" 
        className="w-full" 
        disabled={!stripe || processing}
      >
        {processing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing
          </>
        ) : (
          'Subscribe Now'
        )}
      </Button>
    </form>
  );
}

// Payment container component
function PaymentContainer({ clientSecret }: { clientSecret: string | null }) {
  if (!clientSecret) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h3 className="mb-4 text-xl font-bold">Complete your subscription</h3>
        <CheckoutForm clientSecret={clientSecret} />
      </div>
    </Elements>
  );
}

export default function SubscriptionPage() {
  const { plans, status, isLoading, isPremium, createSubscription, cancelSubscription } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleSelectPlan = async (planId: string) => {
    if (isProcessing) return;
    
    setSelectedPlan(planId);
    setIsProcessing(true);
    
    try {
      const result = await createSubscription(planId);
      if (result.clientSecret) {
        setClientSecret(result.clientSecret);
      } else {
        // Subscription was updated without requiring payment
        toast({
          title: 'Subscription Updated',
          description: 'Your subscription has been updated successfully.',
        });
        // Refresh the page or update the UI as needed
        window.location.reload();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to initiate subscription: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (isProcessing) return;
    
    if (!confirm('Are you sure you want to cancel your subscription?')) {
      return;
    }
    
    setIsProcessing(true);
    
    try {
      await cancelSubscription();
      toast({
        title: 'Subscription Cancelled',
        description: 'Your subscription has been cancelled. It will remain active until the end of the current billing period.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to cancel subscription: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            AeroTracker Premium Subscription
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Upgrade your flight tracking experience with premium features
          </p>
        </div>

        {/* Subscription Status */}
        {status && (
          <div className="mb-10 p-4 rounded-lg bg-muted">
            <h2 className="text-xl font-medium mb-2">Your Subscription</h2>
            <div className="flex items-center justify-between">
              <div>
                <p>
                  <span className="font-medium">Current Plan:</span>{' '}
                  <Badge className={isPremium ? 'bg-blue-600' : 'bg-gray-500'}>
                    {status.subscriptionTier.charAt(0).toUpperCase() + status.subscriptionTier.slice(1)}
                  </Badge>
                </p>
                <p>
                  <span className="font-medium">Status:</span>{' '}
                  <Badge className={status.isSubscriptionActive ? 'bg-green-600' : 'bg-amber-500'}>
                    {status.subscriptionStatus.charAt(0).toUpperCase() + status.subscriptionStatus.slice(1)}
                  </Badge>
                </p>
                {status.subscriptionExpiresAt && (
                  <p>
                    <span className="font-medium">Expires:</span>{' '}
                    {new Date(status.subscriptionExpiresAt).toLocaleDateString()}
                  </p>
                )}
              </div>
              {isPremium && (
                <Button 
                  variant="outline" 
                  onClick={handleCancelSubscription}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Cancel Subscription'
                  )}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* If payment is in progress, show payment form */}
        {clientSecret ? (
          <PaymentContainer clientSecret={clientSecret} />
        ) : (
          /* Otherwise show subscription plans */
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Free Plan */}
            <Card className="relative overflow-hidden border-2 border-muted">
              <CardHeader>
                <CardTitle>Free Plan</CardTitle>
                <CardDescription>Basic flight tracking features</CardDescription>
                <div className="text-3xl font-bold">$0</div>
              </CardHeader>
              <CardContent className="h-64">
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <Check className="w-5 h-5 mr-2 text-green-500" />
                    <span>Basic flight tracking</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 mr-2 text-green-500" />
                    <span>Standard map views</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 mr-2 text-green-500" />
                    <span>Limited historical data</span>
                  </li>
                  <li className="flex items-center">
                    <X className="w-5 h-5 mr-2 text-red-500" />
                    <span className="text-muted-foreground">Advanced weather overlays</span>
                  </li>
                  <li className="flex items-center">
                    <X className="w-5 h-5 mr-2 text-red-500" />
                    <span className="text-muted-foreground">Route optimization</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" disabled={!isPremium}>
                  Current Plan
                </Button>
              </CardFooter>
            </Card>

            {/* Premium Plans from API */}
            {plans?.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative overflow-hidden border-2 ${
                  isPremium && status?.subscriptionTier === 'premium' 
                    ? 'border-blue-600' 
                    : 'border-muted'
                }`}
              >
                {isPremium && status?.subscriptionTier === 'premium' && (
                  <div className="absolute top-0 right-0 px-3 py-1 text-xs font-medium text-white bg-blue-600">
                    Current
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="text-3xl font-bold">
                    ${plan.price}
                    <span className="text-sm text-muted-foreground">/{plan.interval}</span>
                  </div>
                </CardHeader>
                <CardContent className="h-64">
                  <ul className="space-y-2">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center">
                        <Check className="w-5 h-5 mr-2 text-green-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                    {!plan.features.length && (
                      <>
                        <li className="flex items-center">
                          <Check className="w-5 h-5 mr-2 text-green-500" />
                          <span>All free features</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="w-5 h-5 mr-2 text-green-500" />
                          <span>Advanced weather overlays</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="w-5 h-5 mr-2 text-green-500" />
                          <span>Route optimization</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="w-5 h-5 mr-2 text-green-500" />
                          <span>Unlimited historical data</span>
                        </li>
                        <li className="flex items-center">
                          <Check className="w-5 h-5 mr-2 text-green-500" />
                          <span>Priority customer support</span>
                        </li>
                      </>
                    )}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={
                      isProcessing || 
                      (isPremium && status?.subscriptionTier === 'premium')
                    }
                  >
                    {isProcessing && selectedPlan === plan.id ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : isPremium && status?.subscriptionTier === 'premium' ? (
                      'Current Plan'
                    ) : (
                      'Subscribe'
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-12">
          <Separator className="my-6" />
          <div className="text-sm text-muted-foreground">
            <h3 className="font-medium mb-2">Subscription Details</h3>
            <p className="mb-1">• All subscriptions are billed monthly or annually based on the selected plan.</p>
            <p className="mb-1">• You can cancel your subscription at any time.</p>
            <p className="mb-1">• Pro features are activated immediately upon successful payment.</p>
            <p className="mb-1">• For any questions, please contact our support team.</p>
          </div>
        </div>
      </div>
    </div>
  );
}