import express, { Request, Response } from 'express';
import { authenticateJWT } from '../auth';
import { 
  createCustomer, 
  createSubscription, 
  cancelSubscription, 
  getSubscriptionPlans, 
  getUserSubscriptionStatus,
  updateUserSubscription
} from '../services/stripe';

const router = express.Router();

// Middleware to ensure user is authenticated
router.use(authenticateJWT);

// Get subscription plans
router.get('/plans', async (req: Request, res: Response) => {
  try {
    const plans = await getSubscriptionPlans();
    res.status(200).json(plans);
  } catch (error: any) {
    console.error('Error fetching subscription plans:', error);
    res.status(500).json({
      message: 'Failed to fetch subscription plans',
      error: error.message
    });
  }
});

// Get user's subscription status
router.get('/status', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const status = await getUserSubscriptionStatus(req.user.id);
    res.status(200).json(status);
  } catch (error: any) {
    console.error('Error fetching subscription status:', error);
    res.status(500).json({
      message: 'Failed to fetch subscription status',
      error: error.message
    });
  }
});

// Create a new subscription
router.post('/create', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { planId } = req.body;
    
    if (!planId) {
      return res.status(400).json({ message: 'Plan ID is required' });
    }

    // Check if user already has a Stripe customer ID
    let customerId = req.user.stripeCustomerId;

    // If not, create a new customer
    if (!customerId) {
      const customer = await createCustomer(req.user.email, req.user.username);
      customerId = customer.id;

      // Update user with the new customer ID
      await updateUserSubscription(req.user.id, {
        stripeCustomerId: customerId
      });
    }

    // Create the subscription
    const result = await createSubscription(customerId, planId);

    // Update user with the subscription data
    await updateUserSubscription(req.user.id, {
      stripeSubscriptionId: result.id,
      subscriptionTier: 'premium',
      subscriptionStatus: 'active',
    });

    res.status(200).json({
      clientSecret: result.clientSecret,
      subscriptionId: result.id
    });
  } catch (error: any) {
    console.error('Error creating subscription:', error);
    res.status(500).json({
      message: 'Failed to create subscription',
      error: error.message
    });
  }
});

// Cancel a subscription
router.post('/cancel', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!req.user.stripeSubscriptionId) {
      return res.status(400).json({ message: 'No active subscription found' });
    }

    // Cancel the subscription in Stripe
    const canceledSubscription = await cancelSubscription(req.user.stripeSubscriptionId);

    // Update the user's subscription status in the database
    await updateUserSubscription(req.user.id, {
      subscriptionStatus: 'canceled',
    });

    res.status(200).json({
      message: 'Subscription canceled successfully',
      status: canceledSubscription.status
    });
  } catch (error: any) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({
      message: 'Failed to cancel subscription',
      error: error.message
    });
  }
});

export default router;