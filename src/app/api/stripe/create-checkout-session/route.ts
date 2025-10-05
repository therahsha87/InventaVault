import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_YOUR_STRIPE_SECRET_KEY_HERE', {
  apiVersion: '2024-12-18.acacia',
});

interface CheckoutSessionRequest {
  priceId: string;
  tierName: string;
  userId?: string;
  userEmail?: string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { priceId, tierName, userId, userEmail }: CheckoutSessionRequest = await req.json();

    if (!priceId || !tierName) {
      return NextResponse.json(
        { error: 'Missing required parameters: priceId and tierName' },
        { status: 400 }
      );
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.nextUrl.origin}/dashboard?success=true&tier=${tierName}`,
      cancel_url: `${req.nextUrl.origin}/pricing?canceled=true`,
      metadata: {
        userId: userId || 'anonymous',
        tierName,
        source: 'inventavault_subscription'
      },
      customer_email: userEmail,
      subscription_data: {
        metadata: {
          userId: userId || 'anonymous',
          tierName,
          source: 'inventavault_subscription'
        }
      },
      // Enable customer portal for subscription management
      allow_promotion_codes: true,
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url
    });

  } catch (error: unknown) {
    console.error('Error creating checkout session:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { error: `Failed to create checkout session: ${errorMessage}` },
      { status: 500 }
    );
  }
}
