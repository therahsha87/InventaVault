import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_YOUR_STRIPE_SECRET_KEY_HERE', {
  apiVersion: '2024-12-18.acacia',
});

interface CustomerPortalRequest {
  customerId?: string;
  userEmail?: string;
  subscriptionId?: string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { customerId, userEmail, subscriptionId }: CustomerPortalRequest = await req.json();

    let customer;

    // If we have a customerId, use it directly
    if (customerId) {
      customer = await stripe.customers.retrieve(customerId);
    } 
    // Otherwise, try to find customer by email
    else if (userEmail) {
      const customers = await stripe.customers.list({
        email: userEmail,
        limit: 1,
      });
      
      if (customers.data.length > 0) {
        customer = customers.data[0];
      } else {
        return NextResponse.json(
          { error: 'No customer found with this email' },
          { status: 404 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Either customerId or userEmail is required' },
        { status: 400 }
      );
    }

    if (!customer || customer.deleted) {
      return NextResponse.json(
        { error: 'Customer not found or deleted' },
        { status: 404 }
      );
    }

    // Create customer portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: `${req.nextUrl.origin}/dashboard?portal=true`,
    });

    return NextResponse.json({
      url: session.url
    });

  } catch (error: unknown) {
    console.error('Error creating customer portal session:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { error: `Failed to create customer portal session: ${errorMessage}` },
      { status: 500 }
    );
  }
}