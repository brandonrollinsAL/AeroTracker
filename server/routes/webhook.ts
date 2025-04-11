import express, { Request, Response } from 'express';
import { handleStripeWebhook } from '../services/stripe';
import Stripe from 'stripe';

const router = express.Router();

// This route doesn't use authentication middleware since it's called by Stripe
router.post('/stripe', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.warn('STRIPE_WEBHOOK_SECRET is not set. Webhook signature verification will be skipped.');
    try {
      // Just process the event without verification in development
      const event = req.body;
      await handleStripeWebhook(event);
      res.status(200).json({ received: true });
    } catch (error: any) {
      console.error('Error handling webhook:', error);
      res.status(400).json({ error: error.message });
    }
    return;
  }

  // In production, verify the webhook signature
  let event: Stripe.Event;

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16',
    });
    
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error: any) {
    console.error('Error verifying webhook signature:', error);
    return res.status(400).json({ error: `Webhook signature verification failed: ${error.message}` });
  }

  try {
    await handleStripeWebhook(event);
    res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('Error handling webhook:', error);
    res.status(400).json({ error: error.message });
  }
});

export default router;