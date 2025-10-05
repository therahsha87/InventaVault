'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CrownIcon, 
  RocketIcon, 
  SparklesIcon, 
  BrainIcon, 
  ShieldIcon,
  MessageSquareIcon,
  BarChart3Icon,
  SearchIcon,
  WalletIcon,
  ImageIcon,
  MicIcon,
  VaultIcon,
  Zap
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

// Import Enhanced Components
import SubscriptionTiers from '@/components/SubscriptionTiers';
import EnhancedPatentResearch from '@/components/EnhancedPatentResearch';
import PremiumFeatureCard from '@/components/PremiumFeatureCard';

// Import OnchainKit Components
import { WalletDefault } from '@coinbase/onchainkit/wallet';
import { Avatar, Name, Address, EthBalance } from '@coinbase/onchainkit/identity';
import { sdk } from "@farcaster/miniapp-sdk";

export default function InventaVaultApp() {
    useEffect(() => {
      const initializeFarcaster = async () => {
        try {
          await new Promise(resolve => setTimeout(resolve, 100));
          if (document.readyState !== 'complete') {
            await new Promise(resolve => {
              if (document.readyState === 'complete') {
                resolve(void 0);
              } else {
                window.addEventListener('load', () => resolve(void 0), { once: true });
              }

            });
          }

          await sdk.actions.ready();
          console.log("Farcaster SDK initialized successfully - app fully loaded");
        } catch (error) {
          console.error('Failed to initialize Farcaster SDK:', error);
          setTimeout(async () => {
            try {
              await sdk.actions.ready();
              console.log('Farcaster SDK initialized on retry');
            } catch (retryError) {
              console.error('Farcaster SDK retry failed:', retryError);
            }

          }, 1000);
        }

      };
      initializeFarcaster();
    }, []);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userPlan, setUserPlan] = useState<'free' | 'starter' | 'professional' | 'enterprise'>('free');
  const [patentIdea, setPatentIdea] = useState('');

  const handleUpgrade = (tierId: string) => {
    setUserPlan(tierId as any);
    // In a real app, this would integrate with payment processing
    console.log(`Upgrading to ${tierId}`);
  };

  const handlePremiumUpgrade = () => {
    setActiveTab('pricing');
  };

  const isPremiumUser = userPlan === 'professional' || userPlan === 'enterprise';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Header */}
      <div className="bg-card/50 backdrop-blur-sm border-b border-border/50 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                <VaultIcon className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  InventaVault
                </h1>
                <p className="text-sm text-muted-foreground">
                  AI-Powered Patent Protection Platform
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Badge 
                className={`${
                  userPlan === 'free' ? 'bg-secondary text-secondary-foreground border border-border' : 
                  userPlan === 'starter' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                  userPlan === 'professional' ? 'bg-primary/10 text-primary border border-primary/20' :
                  'bg-accent/10 text-accent-foreground border border-accent/20'
                }`}
              >
                {userPlan === 'free' ? 'FREE' : 
                 userPlan === 'starter' ? 'STARTER' :
                 userPlan === 'professional' ? 'PRO' : 'ENTERPRISE'}
              </Badge>
              
              <ThemeToggle />
              <WalletDefault />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="research">Enhanced Research</TabsTrigger>
            <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="premium">Premium Features</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Portfolio Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ShieldIcon className="h-5 w-5 mr-2 text-green-600" />
                    Patent Portfolio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Active Patents</span>
                      <span className="font-bold text-green-600">12</span>
                    </div>
                    <div className="flex justify-between">
                      <span>In Progress</span>
                      <span className="font-bold text-blue-600">3</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Value</span>
                      <span className="font-bold text-purple-600">$2.4M</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3Icon className="h-5 w-5 mr-2 text-blue-600" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="p-2 bg-primary/10 rounded border border-primary/20">
                      Patent #12345 research completed
                    </div>
                    <div className="p-2 bg-green-500/10 rounded border border-green-500/20">
                      Blockchain recording successful
                    </div>
                    <div className="p-2 bg-accent/10 rounded border border-accent/20">
                      New collaboration started
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <RocketIcon className="h-5 w-5 mr-2 text-orange-600" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button 
                      className="w-full" 
                      onClick={() => setActiveTab('research')}
                    >
                      <SearchIcon className="h-4 w-4 mr-2" />
                      New Patent Research
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setActiveTab('collaboration')}
                    >
                      <MessageSquareIcon className="h-4 w-4 mr-2" />
                      Start Collaboration
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Premium Features Preview */}
            {!isPremiumUser && (
              <Alert className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
                <SparklesIcon className="h-4 w-4 text-primary" />
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <div>
                      <strong>Unlock Premium Features!</strong> Get visual patent diagrams, 
                      audio explanations, real-time monitoring, and advanced AI research.
                    </div>
                    <Button 
                      size="sm" 
                      className="ml-4 bg-primary hover:bg-primary/90"
                      onClick={() => setActiveTab('pricing')}
                    >
                      Upgrade Now
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Enhanced Research Preview */}
            <Card className="bg-gradient-to-br from-card to-card/50 border border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-primary" />
                  Enhanced Patent Research Pipeline
                </CardTitle>
                <CardDescription>
                  5-stage AI-powered research with Firecrawl web scraping and OnchainKit blockchain integration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-medium">Available Features:</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center">
                        <Badge className="mr-2 bg-green-500/10 text-green-500 border border-green-500/20">FREE</Badge>
                        Basic AI patent search
                      </div>
                      <div className="flex items-center">
                        <Badge className="mr-2 bg-primary/10 text-primary border border-primary/20">ENHANCED</Badge>
                        Firecrawl web scraping
                      </div>
                      <div className="flex items-center">
                        <Badge className="mr-2 bg-accent/10 text-accent-foreground border border-accent/20">PRO</Badge>
                        xAi Live Search monitoring
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-medium">Premium AI Features:</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center">
                        <ImageIcon className="h-4 w-4 mr-2 text-primary" />
                        Luma AI visual diagrams
                      </div>
                      <div className="flex items-center">
                        <MicIcon className="h-4 w-4 mr-2 text-primary" />
                        ElevenLabs audio explanations
                      </div>
                      <div className="flex items-center">
                        <WalletIcon className="h-4 w-4 mr-2 text-primary" />
                        Advanced OnchainKit features
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="research" className="space-y-6">
            {/* Patent Idea Input */}
            <Card>
              <CardHeader>
                <CardTitle>Enter Your Patent Idea</CardTitle>
                <CardDescription>
                  Describe your invention in detail for comprehensive AI analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <textarea
                  className="w-full p-3 border rounded-lg resize-vertical min-h-[100px]"
                  placeholder="Describe your invention, its technical aspects, and unique features..."
                  value={patentIdea}
                  onChange={(e) => setPatentIdea(e.target.value)}
                />
              </CardContent>
            </Card>

            {/* Enhanced Research Component */}
            <EnhancedPatentResearch 
              patentIdea={patentIdea}
              userPlan={userPlan}
              onResearchComplete={(results) => {
                console.log('Research completed:', results);
              }}
            />
          </TabsContent>

          <TabsContent value="collaboration" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquareIcon className="h-6 w-6 mr-2 text-blue-600" />
                  Real-time Collaboration Hub
                </CardTitle>
                <CardDescription>
                  Connect with inventors and experts using XMTP decentralized messaging
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isPremiumUser ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquareIcon className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Collaboration Hub Active</h3>
                    <p className="text-muted-foreground mb-4">
                      XMTP messaging integration ready for real-time inventor collaboration
                    </p>
                    <Button>Start New Collaboration</Button>
                  </div>
                ) : (
                  <PremiumFeatureCard
                    title="XMTP Collaboration Hub"
                    description="Real-time decentralized messaging for inventors"
                    icon={<MessageSquareIcon className="h-6 w-6 text-purple-600" />}
                    featureName="XMTP Messaging"
                    benefits={[
                      'Decentralized real-time chat',
                      'Inventor networking',
                      'Cross-patent collaboration',
                      'Secure wallet-based authentication'
                    ]}
                    onUpgrade={handlePremiumUpgrade}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3Icon className="h-6 w-6 mr-2 text-green-600" />
                  Patent Portfolio Analytics
                </CardTitle>
                <CardDescription>
                  Comprehensive insights into your patent portfolio performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isPremiumUser ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BarChart3Icon className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Analytics Dashboard Active</h3>
                    <p className="text-muted-foreground mb-4">
                      Advanced portfolio analytics with market insights and trend analysis
                    </p>
                    <Button>View Full Analytics</Button>
                  </div>
                ) : (
                  <PremiumFeatureCard
                    title="Advanced Analytics Dashboard"
                    description="Comprehensive patent portfolio insights and market analysis"
                    icon={<BarChart3Icon className="h-6 w-6 text-purple-600" />}
                    featureName="Analytics Pro"
                    benefits={[
                      'Portfolio performance tracking',
                      'Market trend analysis',
                      'Competitive intelligence',
                      'ROI calculations',
                      'Patent valuation insights'
                    ]}
                    onUpgrade={handlePremiumUpgrade}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="premium" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Premium AI Features</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Unlock cutting-edge AI capabilities for professional patent processing
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <PremiumFeatureCard
                title="Luma AI Visual Diagrams"
                description="Generate professional patent diagrams from text descriptions"
                icon={<ImageIcon className="h-6 w-6 text-purple-600" />}
                featureName="Luma AI"
                benefits={[
                  'Text-to-image generation for patents',
                  'Technical illustration creation',
                  'Multiple style variations',
                  'High-quality professional output'
                ]}
                onUpgrade={handlePremiumUpgrade}
              />

              <PremiumFeatureCard
                title="Flux Image Enhancement"
                description="High-quality image generation and editing for patent applications"
                icon={<SparklesIcon className="h-6 w-6 text-purple-600" />}
                featureName="Flux Pro"
                benefits={[
                  'Advanced image generation',
                  'Custom aspect ratios',
                  'Professional quality output',
                  'Fast processing speeds'
                ]}
                onUpgrade={handlePremiumUpgrade}
              />

              <PremiumFeatureCard
                title="ElevenLabs Audio"
                description="Convert patent documents to professional audio explanations"
                icon={<MicIcon className="h-6 w-6 text-purple-600" />}
                featureName="ElevenLabs TTS"
                benefits={[
                  'Natural voice synthesis',
                  'Multiple voice options',
                  'Patent document narration',
                  'Accessibility features'
                ]}
                onUpgrade={handlePremiumUpgrade}
              />

              <PremiumFeatureCard
                title="xAi Live Search"
                description="Real-time patent monitoring with advanced AI search"
                icon={<SearchIcon className="h-6 w-6 text-purple-600" />}
                featureName="xAi Live Search"
                benefits={[
                  'Real-time patent database monitoring',
                  'Advanced AI-powered search',
                  'Competitive intelligence',
                  'Automated alerts and notifications'
                ]}
                onUpgrade={handlePremiumUpgrade}
              />
            </div>

            <Alert className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
              <CrownIcon className="h-4 w-4 text-primary" />
              <AlertDescription>
                <div className="text-center">
                  <strong>Ready to unlock these premium AI features?</strong><br />
                  Upgrade to Professional or Enterprise plan to access Luma AI, Flux, 
                  ElevenLabs, xAi Live Search, and more advanced capabilities.
                </div>
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            <SubscriptionTiers 
              currentTier={userPlan}
              onUpgrade={handleUpgrade}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Built with Attribution */}
      <footer className="bg-card border-t mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          Built with OnchainKit SDK v0.38.17 by Modu on Ohara • 
          Enhanced with Firecrawl, XMTP, SpacetimeDB, and Premium AI Features
        </div>
      </footer>
    </div>
  );
}
