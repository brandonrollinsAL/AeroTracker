import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Create mock types for Stripe to avoid import issues
type MockStripe = {
  customers: {
    create: (params: any) => Promise<{ id: string }>;
  };
  paymentIntents: {
    create: (params: any) => Promise<{ client_secret: string | null }>;
  };
  subscriptions: {
    create: (params: any) => Promise<any>;
    retrieve: (id: string) => Promise<any>;
    update: (id: string, params: any) => Promise<any>;
    cancel: (id: string) => Promise<any>;
  };
  prices: {
    list: (params: any) => Promise<{ data: any[] }>;
  };
  webhooks: {
    constructEvent: (body: any, signature: string, secret: string) => any;
  };
};

// Create a mock implementation for development
const createMockStripe = (): MockStripe => {
  console.warn('Using mock Stripe implementation');
  return {
    customers: {
      create: async () => ({ id: 'mock_customer_id' }),
    },
    paymentIntents: {
      create: async () => ({ client_secret: 'mock_client_secret' }),
    },
    subscriptions: {
      create: async () => ({
        id: 'mock_subscription_id',
        status: 'active',
        current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days from now
        items: { data: [{ id: 'mock_item_id', price: { id: 'mock_price_id' } }] },
        latest_invoice: {
          payment_intent: { client_secret: 'mock_client_secret' },
        },
      }),
      retrieve: async () => ({
        id: 'mock_subscription_id',
        status: 'active',
        current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
        items: { data: [{ id: 'mock_item_id', price: { id: 'mock_price_id' } }] },
      }),
      update: async () => ({}),
      cancel: async () => ({}),
    },
    prices: {
      list: async () => ({
        data: [
          {
            id: 'mock_price_basic',
            currency: 'usd',
            unit_amount: 995,
            recurring: { interval: 'month' },
            product: {
              name: 'Basic Plan',
              description: 'Access to basic features',
              features: [],
            },
          },
          {
            id: 'mock_price_premium',
            currency: 'usd',
            unit_amount: 1995,
            recurring: { interval: 'month' },
            product: {
              name: 'Premium Plan',
              description: 'Access to all premium features',
              features: [],
            },
          },
        ],
      }),
    },
    webhooks: {
      constructEvent: () => ({
        type: 'unknown',
        data: { object: {} },
      }),
    },
  };
};

// Create the Stripe instance or use mock
let stripeInstance: MockStripe;

// Warning for missing API key
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('Missing STRIPE_SECRET_KEY environment variable. Using mock Stripe implementation.');
  stripeInstance = createMockStripe();
} else {
  try {
    // Only import Stripe if we have an API key
    const { default: Stripe } = require('stripe');
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });
  } catch (error) {
    console.warn('Failed to initialize Stripe:', error);
    stripeInstance = createMockStripe();
  }
}

// Export the service with type-safe methods
export const stripeService = {
  // Create or get a Stripe customer for a user
  async getOrCreateCustomer(userId: number, email: string, name?: string): Promise<string> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    
    if (user?.stripeCustomerId) {
      return user.stripeCustomerId;
    }
    
    const customer = await stripeInstance.customers.create({
      email,
      name: name || email,
      metadata: {
        userId: userId.toString(),
      },
    });
    
    await db.update(users)
      .set({ stripeCustomerId: customer.id })
      .where(eq(users.id, userId));
    
    return customer.id;
  },
  
  // Create a payment intent for one-time payments
  async createPaymentIntent(
    amount: number, 
    currency: string = 'usd', 
    customerId?: string
  ): Promise<{ client_secret: string | null }> {
    const paymentIntent = await stripeInstance.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      customer: customerId,
      automatic_payment_methods: { enabled: true },
    });
    
    return { client_secret: paymentIntent.client_secret };
  },
  
  // Create or update a subscription for a user
  async createOrUpdateSubscription(
    userId: number, 
    priceId: string
  ): Promise<{
    clientSecret: string | null;
    subscriptionId: string;
  }> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    
    if (!user) {
      throw new Error('User not found');
    }
    
    if (!user.email) {
      throw new Error('User email is required for subscriptions');
    }
    
    // Make sure we have a customer ID
    const customerId = user.stripeCustomerId || 
      await this.getOrCreateCustomer(userId, user.email, user.username);
    
    if (user.stripeSubscriptionId) {
      // Update existing subscription
      const subscription = await stripeInstance.subscriptions.retrieve(user.stripeSubscriptionId);
      
      if (subscription.status === 'active' || subscription.status === 'trialing') {
        // Update subscription if price changed
        const currentPriceId = subscription.items.data[0].price.id;
        if (currentPriceId !== priceId) {
          await stripeInstance.subscriptions.update(subscription.id, {
            items: [{
              id: subscription.items.data[0].id,
              price: priceId,
            }],
          });
        }
        
        return {
          subscriptionId: subscription.id,
          clientSecret: null,
        };
      }
    }
    
    // Create new subscription
    const subscription = await stripeInstance.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });
    
    // Update user record with subscription information
    const subscriptionStatus = subscription.status as 
      'active' | 'canceled' | 'past_due' | 'trialing' | 'inactive' || 'inactive';
    
    const expiresAt = new Date((subscription.current_period_end || 0) * 1000);
    
    await db.update(users)
      .set({
        stripeSubscriptionId: subscription.id,
        subscriptionStatus: subscriptionStatus,
        subscriptionExpiresAt: expiresAt.toISOString(),
      })
      .where(eq(users.id, userId));
    
    // Get client secret for payment (if available)
    const clientSecret = subscription.latest_invoice?.payment_intent?.client_secret || null;
    
    return {
      subscriptionId: subscription.id,
      clientSecret,
    };
  },
  
  // Cancel a subscription
  async cancelSubscription(subscriptionId: string, cancelImmediately: boolean = false): Promise<void> {
    if (cancelImmediately) {
      await stripeInstance.subscriptions.cancel(subscriptionId);
    } else {
      await stripeInstance.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
    }
  },
  
  // Update user subscription status based on Stripe webhook events
  async updateUserSubscriptionStatus(subscriptionId: string, status: string): Promise<void> {
    const [user] = await db.select().from(users)
      .where(eq(users.stripeSubscriptionId, subscriptionId));
    
    if (!user) {
      return;
    }
    
    const subscriptionStatus = status as 
      'active' | 'canceled' | 'past_due' | 'trialing' | 'inactive' || 'inactive';
    
    const subscription = await stripeInstance.subscriptions.retrieve(subscriptionId);
    const expiresAt = new Date((subscription.current_period_end || 0) * 1000);
    
    await db.update(users)
      .set({
        subscriptionStatus: subscriptionStatus,
        subscriptionExpiresAt: expiresAt.toISOString(),
        subscriptionTier: status === 'active' ? 'premium' : 'free',
      })
      .where(eq(users.id, user.id));
  },
  
  // Get available subscription plans
  async getSubscriptionPlans(): Promise<{
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    interval: string;
    features: string[];
  }[]> {
    const prices = await stripeInstance.prices.list({
      expand: ['data.product'],
      active: true,
    });
    
    return prices.data.map(price => {
      const product = price.product || {};
      return {
        id: price.id,
        name: product.name || 'Unnamed Plan',
        description: product.description || '',
        price: (price.unit_amount || 0) / 100,
        currency: price.currency || 'usd',
        interval: price.recurring?.interval || 'month',
        features: (product.features || []).map((f: any) => f.name || ''),
      };
    });
  },
};