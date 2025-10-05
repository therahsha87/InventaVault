import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_YOUR_STRIPE_SECRET_KEY_HERE', {
  apiVersion: '2024-12-18.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_YOUR_WEBHOOK_SECRET_HERE';

interface SubscriptionData {
  userId: string;
  tierName: string;
  subscriptionId: string;
  customerId: string;
  status: string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      console.error('Missing Stripe signature');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Webhook signature verification failed:', errorMessage);
      return NextResponse.json({ error: `Webhook verification failed: ${errorMessage}` }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        await handleSubscriptionCreated(session);
        break;

      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(updatedSubscription);
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCanceled(deletedSubscription);
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(failedInvoice);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Webhook error:', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

async function handleSubscriptionCreated(session: Stripe.Checkout.Session): Promise<void> {
  console.log('Subscription created:', {
    sessionId: session.id,
    customerId: session.customer,
    subscriptionId: session.subscription,
    metadata: session.metadata
  });

  // Here you would update your database with the new subscription
  // Example: Update user's subscription status in SpacetimeDB or your database
  const subscriptionData: SubscriptionData = {
    userId: session.metadata?.userId || 'anonymous',
    tierName: session.metadata?.tierName || 'starter',
    subscriptionId: session.subscription as string,
    customerId: session.customer as string,
    status: 'active'
  };

  // TODO: Update user subscription in your database
  console.log('New subscription data to save:', subscriptionData);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
  console.log('Subscription updated:', {
    subscriptionId: subscription.id,
    customerId: subscription.customer,
    status: subscription.status,
    metadata: subscription.metadata
  });

  // TODO: Update subscription status in your database
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription): Promise<void> {
  console.log('Subscription canceled:', {
    subscriptionId: subscription.id,
    customerId: subscription.customer,
    metadata: subscription.metadata
  });

  // TODO: Update user's subscription status to canceled in your database
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
  console.log('Payment succeeded:', {
    invoiceId: invoice.id,
    customerId: invoice.customer,
    subscriptionId: invoice.subscription,
    amountPaid: invoice.amount_paid
  });

  // TODO: Update payment history in your database
}

async function handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  console.log('Payment failed:', {
    invoiceId: invoice.id,
    customerId: invoice.customer,
    subscriptionId: invoice.subscription,
    attemptCount: invoice.attempt_count
  });

  // TODO: Handle failed payment - maybe send notification to user
}
