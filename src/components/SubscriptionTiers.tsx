'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckIcon, SparklesIcon, CrownIcon, RocketIcon, CreditCardIcon, SettingsIcon } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { STRIPE_CONFIG } from '@/lib/stripe';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SubscriptionTier {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
  icon: typeof SparklesIcon;
  upgradeRequired?: boolean;
}

interface SubscriptionTiersProps {
  currentTier?: string;
  onUpgrade?: (tierId: string) => void;
}

const tiers: SubscriptionTier[] = [
  {
    id: 'starter',
    name: 'STARTER',
    price: '$29/month',
    description: 'Perfect for inventors getting started',
    icon: SparklesIcon,
    features: [
      '3 patent applications per month',
      'Basic AI prior art search',
      'Standard document generation',
      'Email support',
      'Community forum access'
    ]
  },
  {
    id: 'professional',
    name: 'PROFESSIONAL',
    price: '$99/month',
    description: 'For serious inventors and small teams',
    icon: RocketIcon,
    popular: true,
    upgradeRequired: true,
    features: [
      'Unlimited patent applications',
      '5-stage enhanced AI research',
      'XMTP collaboration hub',
      'Firecrawl web scraping',
      'Enhanced OnchainKit features',
      'Priority support + phone calls',
      'Portfolio analytics dashboard'
    ]
  },
  {
    id: 'enterprise',
    name: 'ENTERPRISE',
    price: '$299/month',
    description: 'Complete solution for organizations',
    icon: CrownIcon,
    upgradeRequired: true,
    features: [
      'Everything in Professional',
      'Premium AI Features:', 
      '• Luma AI visual patent diagrams',
      '• Flux high-quality image generation',
      '• ElevenLabs audio explanations',
      '• xAi Live Search patent monitoring',
      'White-label options',
      'Custom integrations',
      'Dedicated success manager',
      'SLA guarantees'
    ]
  }
];

export default function SubscriptionTiers({ currentTier = 'free', onUpgrade }: SubscriptionTiersProps) {
  const [userEmail, setUserEmail] = useState<string>('user@example.com'); // In real app, get from auth
  const { 
    subscription, 
    isLoading: subscriptionLoading, 
    error, 
    checkSubscriptionStatus, 
    createCheckoutSession,
    openCustomerPortal 
  } = useSubscription();

  // Check subscription status on mount
  useEffect(() => {
    checkSubscriptionStatus(userEmail);
  }, [userEmail, checkSubscriptionStatus]);

  const actualCurrentTier = subscription?.tier || currentTier;

  const handleUpgrade = async (tierId: string) => {
    if (!STRIPE_CONFIG.tiers[tierId as keyof typeof STRIPE_CONFIG.tiers]) {
      console.error('Invalid tier ID:', tierId);
      return;
    }

    const tierConfig = STRIPE_CONFIG.tiers[tierId as keyof typeof STRIPE_CONFIG.tiers];
    
    try {
      await createCheckoutSession(tierConfig.priceId, tierConfig.name, userEmail);
      
      if (onUpgrade) {
        onUpgrade(tierId);
      }
    } catch (err) {
      console.error('Failed to create checkout session:', err);
    }
  };

  const handleManageSubscription = async () => {
    if (subscription?.customerId) {
      await openCustomerPortal(subscription.customerId, userEmail);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Choose Your InventaVault Plan</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Transform your ideas into protected intellectual property with AI-powered research, 
          real-time collaboration, and blockchain recording on Base.
        </p>
        
        {/* Current subscription status */}
        {subscription && subscription.status !== 'none' && (
          <div className="mt-4 flex flex-col items-center gap-2">
            <Alert className="max-w-md">
              <CreditCardIcon className="h-4 w-4" />
              <AlertDescription>
                Current plan: <strong>{subscription.tier?.toUpperCase()}</strong> 
                ({subscription.status === 'active' ? 'Active' : subscription.status})
                {subscription.currentPeriodEnd && (
                  <span> • Renews {new Date(subscription.currentPeriodEnd * 1000).toLocaleDateString()}</span>
                )}
              </AlertDescription>
            </Alert>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleManageSubscription}
              disabled={subscriptionLoading}
            >
              <SettingsIcon className="h-4 w-4 mr-2" />
              Manage Subscription
            </Button>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {tiers.map((tier) => {
          const Icon = tier.icon;
          const isCurrentTier = actualCurrentTier === tier.id;
          const isSubscriptionActive = subscription?.status === 'active';
          
          return (
            <Card 
              key={tier.id} 
              className={`relative ${tier.popular ? 'border-primary shadow-lg scale-105' : ''} ${isCurrentTier ? 'ring-2 ring-green-500' : ''}`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-3 py-1">
                    MOST POPULAR
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Icon className={`h-12 w-12 ${tier.upgradeRequired ? 'text-primary' : 'text-accent'}`} />
                </div>
                
                <CardTitle className="text-xl font-bold">
                  {tier.name}
                </CardTitle>
                
                <div className="text-3xl font-bold text-primary">
                  {tier.price}
                </div>
                
                <CardDescription>
                  {tier.description}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className={`text-sm ${feature.startsWith('•') ? 'ml-4 text-muted-foreground' : ''}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleUpgrade(tier.id)}
                  disabled={isCurrentTier || subscriptionLoading}
                  className={`w-full ${tier.popular ? 'bg-primary hover:bg-primary/90' : ''} ${tier.upgradeRequired ? 'bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90' : ''}`}
                  variant={isCurrentTier ? "outline" : "default"}
                >
                  {subscriptionLoading ? (
                    <>
                      <CreditCardIcon className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : isCurrentTier && isSubscriptionActive ? (
                    "Current Plan"
                  ) : tier.upgradeRequired ? (
                    <>
                      <CreditCardIcon className="h-4 w-4 mr-2" />
                      Subscribe Now
                    </>
                  ) : (
                    <>
                      <CreditCardIcon className="h-4 w-4 mr-2" />
                      Get Started
                    </>
                  )}
                </Button>

                {tier.upgradeRequired && (
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    💳 Secure payment powered by Stripe
                  </p>
                )}
                
                {error && tier.id === 'professional' && (
                  <Alert className="mt-2">
                    <AlertDescription className="text-xs text-red-600">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-12 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-6 border border-primary/20">
        <h3 className="text-xl font-bold mb-4 text-center">🚀 Why Upgrade to Professional or Enterprise?</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-2 text-primary">Enhanced AI Research</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• 5-stage AI research pipeline</li>
              <li>• Advanced web scraping with Firecrawl</li>
              <li>• Real-time patent monitoring</li>
              <li>• Comprehensive risk assessment</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2 text-accent">Premium Features</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Professional patent diagrams</li>
              <li>• Audio patent explanations</li>
              <li>• Real-time collaboration hub</li>
              <li>• Advanced blockchain features</li>
            </ul>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            💎 <strong>Enterprise users get access to cutting-edge AI models:</strong> Luma, Flux, ElevenLabs, and more!
          </p>
        </div>
      </div>
    </div>
  );
}