'use client';

import { useState, useEffect, useCallback } from 'react';
import { stripePromise } from '@/lib/stripe';

export interface SubscriptionStatus {
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'incomplete' | 'trialing' | 'none';
  tier: string | null;
  currentPeriodStart: number | null;
  currentPeriodEnd: number | null;
  cancelAtPeriodEnd: boolean;
  subscriptionId: string | null;
  customerId: string | null;
}

export interface UseSubscriptionReturn {
  subscription: SubscriptionStatus | null;
  isLoading: boolean;
  error: string | null;
  checkSubscriptionStatus: (userEmail?: string, customerId?: string) => Promise<void>;
  createCheckoutSession: (priceId: string, tierName: string, userEmail?: string) => Promise<void>;
  openCustomerPortal: (customerId?: string, userEmail?: string) => Promise<void>;
  refreshSubscription: () => Promise<void>;
}

export function useSubscription(): UseSubscriptionReturn {
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Check subscription status
  const checkSubscriptionStatus = useCallback(async (
    userEmail?: string, 
    customerId?: string
  ): Promise<void> => {
    if (!userEmail && !customerId) {
      setSubscription({
        status: 'none',
        tier: null,
        currentPeriodStart: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        subscriptionId: null,
        customerId: null
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/stripe/subscription-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail,
          customerId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to check subscription status');
      }

      const subscriptionData: SubscriptionStatus = await response.json();
      setSubscription(subscriptionData);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error checking subscription:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create checkout session and redirect to Stripe
  const createCheckoutSession = useCallback(async (
    priceId: string,
    tierName: string,
    userEmail?: string
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          tierName,
          userEmail,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();

      // Redirect to Stripe checkout
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL received');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error creating checkout session:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Open customer portal
  const openCustomerPortal = useCallback(async (
    customerId?: string,
    userEmail?: string
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/stripe/customer-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          userEmail,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to open customer portal');
      }

      const { url } = await response.json();

      // Open portal in new tab
      if (url) {
        window.open(url, '_blank');
      } else {
        throw new Error('No portal URL received');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error opening customer portal:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh subscription data
  const refreshSubscription = useCallback(async (): Promise<void> => {
    if (subscription?.customerId) {
      await checkSubscriptionStatus(undefined, subscription.customerId);
    }
  }, [subscription?.customerId, checkSubscriptionStatus]);

  return {
    subscription,
    isLoading,
    error,
    checkSubscriptionStatus,
    createCheckoutSession,
    openCustomerPortal,
    refreshSubscription,
  };
}