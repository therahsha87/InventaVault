'use client';

import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with publishable key
const stripePromise = loadStripe(process.env.pk_live_51SCuEoAMq3cHrHmwEFI6ZE7zoodR0sLabto5SNZGY2FoZAQx3wAGbzUiazRX62BGeC5oUOZGYASUtnrHoFOPng8a00XomFVye3 || 'pk_test_YOUR_STRIPE_PUBLISHABLE_KEY_HERE');

export { stripePromise };

// Stripe configuration for InventaVault subscription tiers
export const STRIPE_CONFIG = {
  tiers: {
    starter: {
      priceId: 'prod_TCCmWLzXA5NFZC', // Replace with your actual Stripe price ID
      name: 'Starter',
      amount: 2900, // $29.00 in cents
    },
    professional: {
      priceId: 'prod_TCCoOP09IkvJic', // Replace with your actual Stripe price ID  
      name: 'Professional',
      amount: 9900, // $99.00 in cents
    },
    enterprise: {
      priceId: 'prod_TCCprrdr03X1Hd', // Replace with your actual Stripe price ID
      name: 'Enterprise', 
      amount: 29900, // $299.00 in cents
    }
  },
  currency: 'usd',
  features: {
    starter: [
      '3 patent applications per month',
      'Basic AI prior art search',
      'Standard document generation',
      'Email support'
    ],
    professional: [
      'Unlimited patent applications',
      '5-stage enhanced AI research',
      'XMTP collaboration hub',
      'Firecrawl web scraping',
      'Enhanced OnchainKit features',
      'Priority support + phone calls'
    ],
    enterprise: [
      'Everything in Professional',
      'Premium AI Features (Luma, Flux, ElevenLabs)',
      'xAi Live Search patent monitoring',
      'White-label options',
      'Custom integrations',
      'Dedicated success manager'
    ]
  }
};

export type SubscriptionTier = keyof typeof STRIPE_CONFIG.tiers;