import { Router, Request, Response } from 'express';
import { stripeService } from '../services/stripe';
import { authenticateJWT } from '../auth';

const router = Router();

// Get available subscription plans
router.get('/plans', async (req: Request, res: Response) => {
  try {
    const plans = await stripeService.getSubscriptionPlans();
    res.json(plans);
  } catch (error: any) {
    console.error('Error fetching subscription plans:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create or update subscription
router.post('/create-subscription', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const { priceId } = req.body;
    
    if (!priceId) {
      return res.status(400).json({ error: 'Price ID is required' });
    }
    
    const userId = req.user!.id;
    const result = await stripeService.createOrUpdateSubscription(userId, priceId);
    
    res.json(result);
  } catch (error: any) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: error.message });
  }
});

// Cancel subscription
router.post('/cancel-subscription', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const { cancelImmediately = false } = req.body;
    const user = req.user!;
    
    if (!user.stripeSubscriptionId) {
      return res.status(400).json({ error: 'No active subscription found' });
    }
    
    await stripeService.cancelSubscription(user.stripeSubscriptionId, cancelImmediately);
    
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create a payment intent for one-time purchases
router.post('/create-payment-intent', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const { amount, currency = 'usd' } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }
    
    const user = req.user!;
    let customerId = user.stripeCustomerId ?? undefined;
    
    if (!customerId && user.email) {
      customerId = await stripeService.getOrCreateCustomer(user.id, user.email, user.username);
    }
    
    const { client_secret } = await stripeService.createPaymentIntent(amount, currency, customerId);
    
    res.json({ clientSecret: client_secret });
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get current user's subscription status
router.get('/status', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    
    res.json({
      subscriptionTier: user.subscriptionTier || 'free',
      subscriptionStatus: user.subscriptionStatus || 'inactive',
      subscriptionExpiresAt: user.subscriptionExpiresAt,
      isSubscriptionActive: user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trialing',
    });
  } catch (error: any) {
    console.error('Error fetching subscription status:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;