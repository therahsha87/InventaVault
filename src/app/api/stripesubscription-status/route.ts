import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_YOUR_STRIPE_SECRET_KEY_HERE', {
  apiVersion: '2024-12-18.acacia',
});

interface SubscriptionStatusRequest {
  userEmail?: string;
  customerId?: string;
  subscriptionId?: string;
}

interface SubscriptionStatus {
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'incomplete' | 'trialing' | 'none';
  tier: string | null;
  currentPeriodStart: number | null;
  currentPeriodEnd: number | null;
  cancelAtPeriodEnd: boolean;
  subscriptionId: string | null;
  customerId: string | null;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { userEmail, customerId, subscriptionId }: SubscriptionStatusRequest = await req.json();

    let customer;
    let subscription;

    // Get customer
    if (customerId) {
      customer = await stripe.customers.retrieve(customerId);
    } else if (userEmail) {
      const customers = await stripe.customers.list({
        email: userEmail,
        limit: 1,
      });
      customer = customers.data.length > 0 ? customers.data[0] : null;
    } else if (subscriptionId) {
      subscription = await stripe.subscriptions.retrieve(subscriptionId);
      if (subscription.customer) {
        customer = await stripe.customers.retrieve(subscription.customer as string);
      }
    } else {
      return NextResponse.json(
        { error: 'Either userEmail, customerId, or subscriptionId is required' },
        { status: 400 }
      );
    }

    if (!customer || customer.deleted) {
      return NextResponse.json<SubscriptionStatus>({
        status: 'none',
        tier: null,
        currentPeriodStart: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        subscriptionId: null,
        customerId: null
      });
    }

    // Get active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'all',
      limit: 10,
    });

    // Find the most recent active subscription
    const activeSubscription = subscriptions.data.find(sub => 
      ['active', 'trialing', 'past_due'].includes(sub.status)
    ) || subscriptions.data[0];

    if (!activeSubscription) {
      return NextResponse.json<SubscriptionStatus>({
        status: 'none',
        tier: null,
        currentPeriodStart: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        subscriptionId: null,
        customerId: customer.id
      });
    }

    // Determine tier from subscription metadata or price ID
    let tier: string = 'starter';
    if (activeSubscription.metadata?.tierName) {
      tier = activeSubscription.metadata.tierName;
    } else if (activeSubscription.items.data.length > 0) {
      const priceId = activeSubscription.items.data[0].price.id;
      // Map price IDs to tiers (you'll need to update these with your actual price IDs)
      if (priceId.includes('professional')) tier = 'professional';
      else if (priceId.includes('enterprise')) tier = 'enterprise';
      else tier = 'starter';
    }

    const subscriptionStatus: SubscriptionStatus = {
      status: activeSubscription.status as SubscriptionStatus['status'],
      tier,
      currentPeriodStart: activeSubscription.current_period_start,
      currentPeriodEnd: activeSubscription.current_period_end,
      cancelAtPeriodEnd: activeSubscription.cancel_at_period_end,
      subscriptionId: activeSubscription.id,
      customerId: customer.id
    };

    return NextResponse.json<SubscriptionStatus>(subscriptionStatus);

  } catch (error: unknown) {
    console.error('Error checking subscription status:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { error: `Failed to check subscription status: ${errorMessage}` },
      { status: 500 }
    );
  }
}
