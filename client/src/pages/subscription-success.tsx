import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Check } from 'lucide-react';

export default function SubscriptionSuccessPage() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'succeeded' | 'failed' | 'pending' | null>(null);

  useEffect(() => {
    // Check the payment status from the URL params
    const query = new URLSearchParams(window.location.search);
    const paymentIntent = query.get('payment_intent');
    const paymentIntentClientSecret = query.get('payment_intent_client_secret');
    const redirectStatus = query.get('redirect_status');

    const verifyPayment = async () => {
      try {
        if (!paymentIntent || !paymentIntentClientSecret) {
          setError('Payment information is missing');
          setIsLoading(false);
          return;
        }

        if (redirectStatus === 'succeeded') {
          setPaymentStatus('succeeded');
        } else if (redirectStatus === 'failed') {
          setPaymentStatus('failed');
        } else {
          // If we don't have a redirect status, manually check the payment
          const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY as string);
          if (!stripe) {
            setError('Failed to load payment processor');
            setIsLoading(false);
            return;
          }

          const { paymentIntent: retrievedIntent } = await stripe.retrievePaymentIntent(
            paymentIntentClientSecret
          );

          if (retrievedIntent) {
            setPaymentStatus(retrievedIntent.status as any);
          } else {
            setError('Could not verify payment status');
          }
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred while verifying your payment');
      } finally {
        setIsLoading(false);
      }
    };

    verifyPayment();
  }, []);

  if (isLoading) {
    return (
      <div className="container py-16">
        <div className="max-w-md mx-auto text-center">
          <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary" />
          <h1 className="mt-6 text-2xl font-bold">Verifying your payment...</h1>
          <p className="mt-2 text-muted-foreground">
            Please wait while we confirm your subscription.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-16">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Payment Verification Error</CardTitle>
            <CardDescription>
              We encountered an issue while verifying your payment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{error}</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button asChild>
              <Link to="/subscription">Return to Subscriptions</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (paymentStatus === 'succeeded') {
    return (
      <div className="container py-16">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Payment Successful!</CardTitle>
            <CardDescription>
              Your premium subscription has been activated.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p>
              Thank you for subscribing to AeroTracker Premium. You now have access to all premium features.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center space-x-4">
            <Button asChild>
              <Link to="/">Go to Dashboard</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/subscription">Manage Subscription</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <div className="container py-16">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Payment Failed</CardTitle>
            <CardDescription>
              Your payment could not be processed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              We were unable to process your payment. Please check your payment details and try again.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button asChild>
              <Link to="/subscription">Try Again</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-16">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Payment Processing</CardTitle>
          <CardDescription>
            Your payment is being processed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            We're still processing your payment. This may take a moment. You'll receive an email confirmation once completed.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link to="/subscription">Return to Subscriptions</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}