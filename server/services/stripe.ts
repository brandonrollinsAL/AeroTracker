import Stripe from 'stripe';
import { pool } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { db } from '../db';

// Initialize Stripe with graceful degradation for development environment
let stripe: Stripe | null = null;

// Environment variable flag to check if Stripe is configured
let isStripeConfigured = false;

try {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('⚠️ STRIPE_SECRET_KEY is not set. Stripe functionality will be mocked.');
    isStripeConfigured = false;
  } else {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });
    isStripeConfigured = true;
    console.log('✅ Stripe initialized successfully');
  }
} catch (error) {
  console.error('❌ Failed to initialize Stripe:', error);
  isStripeConfigured = false;
}

// Mock subscription plans for development when Stripe is not configured
const mockSubscriptionPlans = [
  {
    id: 'price_mock_premium_monthly',
    name: 'Premium Plan',
    description: 'Access to all premium features',
    price: 9.99,
    interval: 'month',
    features: [
      'Unlimited flight tracking',
      'Advanced weather data',
      'Route optimization',
      'Historical data access',
      'Priority customer support'
    ]
  },
  {
    id: 'price_mock_premium_yearly',
    name: 'Premium Plan (Annual)',
    description: 'Save 16% with annual billing',
    price: 99.99,
    interval: 'year',
    features: [
      'Unlimited flight tracking',
      'Advanced weather data',
      'Route optimization',
      'Historical data access',
      'Priority customer support'
    ]
  }
];

// Helper function to retrieve subscription plans
export async function getSubscriptionPlans() {
  if (!isStripeConfigured || !stripe) {
    return mockSubscriptionPlans;
  }

  try {
    const prices = await stripe.prices.list({
      active: true,
      expand: ['data.product'],
    });

    return prices.data.map(price => {
      const product = price.product as Stripe.Product;
      return {
        id: price.id,
        name: product.name,
        description: product.description || '',
        price: price.unit_amount! / 100,
        interval: price.recurring?.interval || 'month',
        features: product.metadata?.features ? JSON.parse(product.metadata.features) : [],
      };
    });
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return mockSubscriptionPlans;
  }
}

// Create a customer in Stripe
export async function createCustomer(email: string, name: string) {
  if (!isStripeConfigured || !stripe) {
    return { id: `cus_mock_${Date.now()}` };
  }

  try {
    return await stripe.customers.create({
      email,
      name,
    });
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    throw error;
  }
}

// Create a subscription
export async function createSubscription(customerId: string, priceId: string) {
  if (!isStripeConfigured || !stripe) {
    // For development, return a mock subscription with client secret
    return {
      id: `sub_mock_${Date.now()}`,
      clientSecret: `pi_mock_${Date.now()}_secret_${Math.random().toString(36).substring(2, 15)}`,
    };
  }

  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });

    const invoice = subscription.latest_invoice as Stripe.Invoice;
    const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;

    return {
      id: subscription.id,
      clientSecret: paymentIntent.client_secret,
    };
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
}

// Cancel a subscription
export async function cancelSubscription(subscriptionId: string) {
  if (!isStripeConfigured || !stripe) {
    return { id: subscriptionId, status: 'canceled' };
  }

  try {
    return await stripe.subscriptions.cancel(subscriptionId);
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
}

// Get subscription details
export async function getSubscription(subscriptionId: string) {
  if (!isStripeConfigured || !stripe) {
    return {
      id: subscriptionId,
      status: 'active',
      current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days from now
      items: {
        data: [
          {
            price: {
              id: 'price_mock_premium_monthly',
              product: 'prod_mock_premium',
            },
          },
        ],
      },
    };
  }

  try {
    return await stripe.subscriptions.retrieve(subscriptionId);
  } catch (error) {
    console.error('Error retrieving subscription:', error);
    throw error;
  }
}

// Update user's subscription details in database
export async function updateUserSubscription(
  userId: number,
  subscriptionDetails: {
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    subscriptionTier?: string;
    subscriptionStatus?: string;
    subscriptionExpiresAt?: Date;
  }
) {
  try {
    const [updatedUser] = await db
      .update(users)
      .set(subscriptionDetails)
      .where(eq(users.id, userId))
      .returning();
    
    return updatedUser;
  } catch (error) {
    console.error('Error updating user subscription details:', error);
    throw error;
  }
}

// Webhook handler to process Stripe events
export async function handleStripeWebhook(event: any) {
  // Handle different event types
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      // Process the checkout session
      break;
      
    case 'invoice.paid':
      const invoice = event.data.object;
      // Update subscription status to active
      if (invoice.subscription) {
        const subscription = await getSubscription(invoice.subscription);
        const userQuery = await db
          .select()
          .from(users)
          .where(eq(users.stripeCustomerId, invoice.customer));
        
        if (userQuery.length > 0) {
          const user = userQuery[0];
          const expiresAt = new Date(subscription.current_period_end * 1000);
          
          await updateUserSubscription(user.id, {
            subscriptionStatus: 'active',
            subscriptionExpiresAt: expiresAt,
          });
        }
      }
      break;
      
    case 'invoice.payment_failed':
      // Handle failed payment
      break;
      
    case 'customer.subscription.updated':
      const updatedSubscription = event.data.object;
      // Update the subscription status in your database
      const userQuery = await db
        .select()
        .from(users)
        .where(eq(users.stripeSubscriptionId, updatedSubscription.id));
      
      if (userQuery.length > 0) {
        const user = userQuery[0];
        const expiresAt = new Date(updatedSubscription.current_period_end * 1000);
        
        await updateUserSubscription(user.id, {
          subscriptionStatus: updatedSubscription.status,
          subscriptionExpiresAt: expiresAt,
        });
      }
      break;
      
    case 'customer.subscription.deleted':
      const canceledSubscription = event.data.object;
      // Update the subscription status in your database
      const userQueryCancel = await db
        .select()
        .from(users)
        .where(eq(users.stripeSubscriptionId, canceledSubscription.id));
      
      if (userQueryCancel.length > 0) {
        const user = userQueryCancel[0];
        const expiresAt = new Date(canceledSubscription.current_period_end * 1000);
        
        await updateUserSubscription(user.id, {
          subscriptionStatus: 'canceled',
          subscriptionExpiresAt: expiresAt,
        });
      }
      break;
      
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
  
  return { received: true };
}

// Function to get a user's subscription status
export async function getUserSubscriptionStatus(userId: number) {
  try {
    const userQuery = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    
    if (!userQuery.length) {
      throw new Error('User not found');
    }
    
    const user = userQuery[0];
    
    // If user has no subscription, return free tier status
    if (!user.stripeSubscriptionId) {
      return {
        isSubscriptionActive: false,
        subscriptionTier: 'free',
        subscriptionStatus: 'inactive',
      };
    }
    
    // If Stripe is not configured or we're in development mode
    if (!isStripeConfigured || !stripe) {
      return {
        isSubscriptionActive: user.subscriptionStatus === 'active',
        subscriptionTier: user.subscriptionTier || 'free',
        subscriptionStatus: user.subscriptionStatus || 'inactive',
        subscriptionExpiresAt: user.subscriptionExpiresAt,
        stripeCustomerId: user.stripeCustomerId,
        stripeSubscriptionId: user.stripeSubscriptionId,
      };
    }
    
    // Fetch the latest subscription data from Stripe
    try {
      const subscription = await getSubscription(user.stripeSubscriptionId);
      const isActive = ['active', 'trialing'].includes(subscription.status);
      const expiresAt = new Date(subscription.current_period_end * 1000);
      
      // Update the user record if needed
      if (
        subscription.status !== user.subscriptionStatus ||
        expiresAt.toISOString() !== user.subscriptionExpiresAt
      ) {
        await updateUserSubscription(user.id, {
          subscriptionStatus: subscription.status,
          subscriptionExpiresAt: expiresAt,
        });
      }
      
      return {
        isSubscriptionActive: isActive,
        subscriptionTier: user.subscriptionTier || 'free',
        subscriptionStatus: subscription.status,
        subscriptionExpiresAt: expiresAt.toISOString(),
        stripeCustomerId: user.stripeCustomerId,
        stripeSubscriptionId: user.stripeSubscriptionId,
      };
    } catch (error) {
      console.error('Error fetching subscription from Stripe:', error);
      
      // Return data from the database if Stripe API fails
      return {
        isSubscriptionActive: user.subscriptionStatus === 'active',
        subscriptionTier: user.subscriptionTier || 'free',
        subscriptionStatus: user.subscriptionStatus || 'inactive',
        subscriptionExpiresAt: user.subscriptionExpiresAt,
        stripeCustomerId: user.stripeCustomerId,
        stripeSubscriptionId: user.stripeSubscriptionId,
      };
    }
  } catch (error) {
    console.error('Error getting user subscription status:', error);
    throw error;
  }
}