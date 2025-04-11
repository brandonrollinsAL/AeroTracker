import { Router, Request, Response } from 'express';
import { stripeService } from '../services/stripe';

const router = Router();

// Stripe webhook endpoint to handle events
router.post('/stripe', async (req: Request, res: Response) => {
  try {
    // Verify webhook signature
    const signature = req.headers['stripe-signature'] as string;
    
    if (!process.env.STRIPE_WEBHOOK_SECRET || !signature) {
      console.warn('Stripe webhook secret not set or no signature provided');
      return res.status(400).send('Webhook secret or signature missing');
    }
    
    // Use a dynamic import for Stripe to avoid issues if it's not installed
    let event;
    try {
      // Import the webhook construction from our service instead
      const { default: Stripe } = require('stripe');
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2023-10-16',
      });
      
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (error: any) {
      console.error(`Webhook signature verification failed: ${error.message}`);
      // If we fail to verify the webhook, it's safer to return a 200 response
      // to prevent Stripe from retrying indefinitely, but we'll log the issue
      return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        await stripeService.updateUserSubscriptionStatus(
          subscription.id,
          subscription.status
        );
        break;
      }
      
      case 'payment_intent.succeeded': {
        // Handle successful payment
        const paymentIntent = event.data.object;
        // You can implement additional logic here such as granting access to purchased content
        console.log(`PaymentIntent ${paymentIntent.id} succeeded`);
        break;
      }
      
      case 'payment_intent.payment_failed': {
        // Handle failed payment
        const paymentIntent = event.data.object;
        console.log(`PaymentIntent ${paymentIntent.id} failed`);
        break;
      }
      
      default:
        // Unexpected event type
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    // Return a 200 to prevent Stripe from retrying
    res.status(200).json({ 
      received: true, 
      error: true, 
      message: 'Processed with errors'
    });
  }
});

export default router;