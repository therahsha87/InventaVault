'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Scale, 
  Search, 
  FileText, 
  Shield, 
  CheckCircle, 
  Lightbulb,
  Brain,
  Zap,
  Globe,
  BarChart3,
  Users,
  MessageCircle,
  Wallet,
  Settings
} from 'lucide-react';
import { sdk } from "@farcaster/miniapp-sdk";
import { WalletDefault } from '@coinbase/onchainkit/wallet';
import { PatentSubmissionForm } from './PatentSubmissionForm';
import { EnhancedPriorArtResearch } from './EnhancedPriorArtResearch';
import { PatentDocumentGenerator } from './PatentDocumentGenerator';
import { BlockchainPatentRecorder } from './BlockchainPatentRecorder';
import { PatentDocumentViewer } from './PatentDocumentViewer';
import { PatentPortfolioDashboard } from './PatentPortfolioDashboard';
import { CollaborationHub } from './CollaborationHub';
import type { PatentIdea, PriorArtResult, PatentDocument, BlockchainPatentRecord } from '@/types/patent';

type ProcessStep = 'dashboard' | 'submission' | 'research' | 'generation' | 'blockchain' | 'completed';

export default function EnhancedPatentApp() {
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

  const [currentStep, setCurrentStep] = useState<ProcessStep>('dashboard');
  const [patentIdea, setPatentIdea] = useState<PatentIdea | null>(null);
  const [priorArtResults, setPriorArtResults] = useState<PriorArtResult[]>([]);
  const [patentDocument, setPatentDocument] = useState<PatentDocument | null>(null);
  const [blockchainRecord, setBlockchainRecord] = useState<BlockchainPatentRecord | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleIdeaSubmission = (idea: PatentIdea) => {
    setPatentIdea(idea);
    setCurrentStep('research');
    setIsProcessing(false);
  };

  const handleResearchComplete = (results: PriorArtResult[]) => {
    setPriorArtResults(results);
    setCurrentStep('generation');
  };

  const handleDocumentComplete = (document: PatentDocument) => {
    setPatentDocument(document);
    setCurrentStep('blockchain');
  };

  const handleBlockchainComplete = (record: BlockchainPatentRecord) => {
    setBlockchainRecord(record);
    setCurrentStep('completed');
  };

  const steps = [
    { 
      key: 'dashboard', 
      label: 'Dashboard', 
      icon: BarChart3, 
      description: 'Portfolio overview',
      color: 'text-indigo-600'
    },
    { 
      key: 'submission', 
      label: 'Submit Idea', 
      icon: Lightbulb, 
      description: 'Describe your invention',
      color: 'text-blue-600'
    },
    { 
      key: 'research', 
      label: 'Enhanced Research', 
      icon: Search, 
      description: 'AI + web scraping analysis',
      color: 'text-purple-600'
    },
    { 
      key: 'generation', 
      label: 'Generate Patent', 
      icon: FileText, 
      description: 'Create legal documentation',
      color: 'text-green-600'
    },
    { 
      key: 'blockchain', 
      label: 'Blockchain Recording', 
      icon: Shield, 
      description: 'Secure with OnchainKit',
      color: 'text-orange-600'
    },
    { 
      key: 'completed', 
      label: 'Completed', 
      icon: CheckCircle, 
      description: 'Download & collaborate',
      color: 'text-emerald-600'
    }
  ];

  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.key === currentStep);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <div className="p-2 bg-primary/10 rounded-lg border border-primary/20 mr-4">
                <Scale className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">InventaVault</h1>
                <p className="text-muted-foreground">Advanced patent processing with real-time collaboration</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <WalletDefault />
              <div className="text-sm text-gray-600 text-right">
                <div className="flex items-center">
                  <Globe className="h-4 w-4 mr-1" />
                  <span>Built with OnchainKit & XMTP on Base</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Enhanced Navigation */}
          <div className="border-t border-gray-200 pt-4">
            <Tabs value={currentStep} onValueChange={(value) => setCurrentStep(value as ProcessStep)} className="w-full">
              <TabsList className="grid w-full grid-cols-6 h-auto p-1">
                {steps.map((step) => {
                  const StepIcon = step.icon;
                  return (
                    <TabsTrigger 
                      key={step.key} 
                      value={step.key} 
                      className="flex flex-col items-center p-3 data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-900"
                    >
                      <StepIcon className={`h-5 w-5 mb-1 ${step.color}`} />
                      <span className="text-xs font-medium">{step.label}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Enhanced Features Banner */}
      {currentStep === 'dashboard' && (
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold mb-4">InventaVault Patent Ecosystem</h2>
              <p className="text-xl opacity-90">AI research, real-time collaboration, and blockchain security</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-6 rounded-lg bg-white/10 backdrop-blur-sm">
                <Brain className="h-12 w-12 mx-auto mb-3 opacity-80" />
                <h3 className="font-semibold mb-2">AI-Powered Research</h3>
                <p className="text-sm opacity-80">Advanced AI + web scraping for comprehensive prior art analysis</p>
              </div>
              <div className="text-center p-6 rounded-lg bg-white/10 backdrop-blur-sm">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-80" />
                <h3 className="font-semibold mb-2">Real-time Collaboration</h3>
                <p className="text-sm opacity-80">XMTP messaging for seamless inventor collaboration</p>
              </div>
              <div className="text-center p-6 rounded-lg bg-white/10 backdrop-blur-sm">
                <Wallet className="h-12 w-12 mx-auto mb-3 opacity-80" />
                <h3 className="font-semibold mb-2">OnchainKit Integration</h3>
                <p className="text-sm opacity-80">Premium Base blockchain features with wallet integration</p>
              </div>
              <div className="text-center p-6 rounded-lg bg-white/10 backdrop-blur-sm">
                <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-80" />
                <h3 className="font-semibold mb-2">Portfolio Analytics</h3>
                <p className="text-sm opacity-80">Track your patents and collaborate with insights</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps - Only show when not on dashboard */}
        {currentStep !== 'dashboard' && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                {steps.slice(1).map((step, index) => {
                  const StepIcon = step.icon;
                  const actualIndex = index + 1; // Account for dashboard step
                  const isActive = currentStep === step.key;
                  const isCompleted = getCurrentStepIndex() > actualIndex;
                  
                  return (
                    <div key={step.key} className="flex items-center">
                      <div className="flex flex-col items-center">
                        <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                          isCompleted ? 'bg-green-100 border-green-500 text-green-600' :
                          isActive ? 'bg-indigo-100 border-indigo-500 text-indigo-600' :
                          'bg-gray-100 border-gray-300 text-gray-400'
                        }`}>
                          <StepIcon className="h-6 w-6" />
                        </div>
                        <div className="mt-2 text-center">
                          <div className={`text-sm font-medium ${
                            isCompleted ? 'text-green-600' :
                            isActive ? 'text-indigo-600' :
                            'text-gray-500'
                          }`}>
                            {step.label}
                          </div>
                          <div className="text-xs text-gray-500">{step.description}</div>
                        </div>
                      </div>
                      {actualIndex < steps.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-4 ${
                          isCompleted ? 'bg-green-500' : 'bg-gray-300'
                        }`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Content Area */}
        <div className="space-y-8">
          {currentStep === 'dashboard' && (
            <Tabs defaultValue="portfolio" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="portfolio" className="flex items-center">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Portfolio
                </TabsTrigger>
                <TabsTrigger value="collaboration" className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Collaboration
                </TabsTrigger>
                <TabsTrigger value="new-patent" className="flex items-center">
                  <Lightbulb className="h-4 w-4 mr-2" />
                  New Patent
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="portfolio">
                <PatentPortfolioDashboard />
              </TabsContent>

              <TabsContent value="collaboration">
                <CollaborationHub />
              </TabsContent>

              <TabsContent value="new-patent">
                <div className="flex justify-center">
                  <div className="w-full max-w-2xl">
                    <PatentSubmissionForm
                      onSubmit={handleIdeaSubmission}
                      loading={isProcessing}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="analytics">
                <Card>
                  <CardContent className="p-8 text-center">
                    <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">Advanced Analytics Coming Soon</h3>
                    <p className="text-gray-600 mb-6">
                      Get detailed insights into your patent portfolio performance, market trends, and collaboration metrics.
                    </p>
                    <Badge className="bg-purple-100 text-purple-800">
                      <Zap className="h-4 w-4 mr-1" />
                      Premium Feature
                    </Badge>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}

          {currentStep === 'submission' && (
            <div className="flex justify-center">
              <div className="w-full max-w-2xl">
                <PatentSubmissionForm
                  onSubmit={handleIdeaSubmission}
                  loading={isProcessing}
                />
              </div>
            </div>
          )}

          {currentStep === 'research' && patentIdea && (
            <EnhancedPriorArtResearch
              idea={patentIdea}
              onComplete={handleResearchComplete}
            />
          )}

          {currentStep === 'generation' && patentIdea && (
            <PatentDocumentGenerator
              idea={patentIdea}
              priorArtResults={priorArtResults}
              onComplete={handleDocumentComplete}
            />
          )}

          {currentStep === 'blockchain' && patentDocument && (
            <BlockchainPatentRecorder
              document={patentDocument}
              onComplete={handleBlockchainComplete}
            />
          )}

          {currentStep === 'completed' && patentDocument && (
            <div className="space-y-6">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Congratulations!</strong> Your patent has been successfully processed and recorded on the blockchain. 
                  You now have immutable proof of your invention with full legal documentation and can collaborate with others in real-time.
                </AlertDescription>
              </Alert>
              
              <PatentDocumentViewer 
                document={patentDocument} 
                blockchainRecord={blockchainRecord || undefined}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-6 text-center">
                    <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Start Collaborating</h3>
                    <p className="text-gray-600 mb-4">
                      Invite other inventors to collaborate on this patent using real-time XMTP messaging.
                    </p>
                    <Button onClick={() => setCurrentStep('dashboard')}>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Open Collaboration Hub
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <BarChart3 className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">View Portfolio</h3>
                    <p className="text-gray-600 mb-4">
                      Add this patent to your portfolio and track its progress with analytics.
                    </p>
                    <Button variant="outline" onClick={() => setCurrentStep('dashboard')}>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Go to Portfolio
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Footer */}
      <div className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-600">
            <p className="mb-4">
              <strong>InventaVault</strong> - Complete patent ecosystem with real-time collaboration
            </p>
            <div className="flex items-center justify-center space-x-6 flex-wrap">
              <Badge variant="outline" className="bg-blue-50">
                <Brain className="h-3 w-3 mr-1" />
                Enhanced AI Research
              </Badge>
              <Badge variant="outline" className="bg-purple-50">
                <MessageCircle className="h-3 w-3 mr-1" />
                XMTP Collaboration
              </Badge>
              <Badge variant="outline" className="bg-orange-50">
                <Wallet className="h-3 w-3 mr-1" />
                OnchainKit Integration
              </Badge>
              <Badge variant="outline" className="bg-green-50">
                <Globe className="h-3 w-3 mr-1" />
                Base Blockchain
              </Badge>
            </div>
            <p className="mt-4 text-xs">
              Built with OnchainKit v0.38.17 by Modu on Ohara
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}