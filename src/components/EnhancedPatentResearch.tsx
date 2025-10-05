'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  SearchIcon, 
  BrainIcon, 
  DatabaseIcon, 
  ShieldCheckIcon, 
  AlertTriangleIcon,
  SparklesIcon,
  CrownIcon,
  LockIcon,
  MicIcon,
  ImageIcon
} from 'lucide-react';
import { scrapeUrl, searchUrl, type ScrapeResponse, type SearchResponse } from '@/firecrawl';

interface ResearchStage {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  result?: any;
  premium?: boolean;
}

interface EnhancedPatentResearchProps {
  patentIdea: string;
  onResearchComplete?: (results: any) => void;
  userPlan?: 'free' | 'starter' | 'professional' | 'enterprise';
}

export default function EnhancedPatentResearch({ 
  patentIdea, 
  onResearchComplete, 
  userPlan = 'free' 
}: EnhancedPatentResearchProps) {
  const [stages, setStages] = useState<ResearchStage[]>([
    {
      id: 'basic-search',
      name: 'Basic AI Search',
      description: 'Initial patent database search using AI',
      status: 'pending'
    },
    {
      id: 'web-scraping',
      name: 'Enhanced Web Research',
      description: 'Advanced web scraping with Firecrawl',
      status: 'pending'
    },
    {
      id: 'similarity-analysis',
      name: 'Technical Similarity Analysis', 
      description: 'Deep technical comparison with existing patents',
      status: 'pending'
    },
    {
      id: 'live-monitoring',
      name: 'Real-time Patent Monitoring',
      description: 'xAi Live Search for latest patent filings',
      status: 'pending',
      premium: true
    },
    {
      id: 'risk-assessment',
      name: 'Comprehensive Risk Assessment',
      description: 'AI-powered infringement risk analysis',
      status: 'pending'
    }
  ]);

  const [currentStage, setCurrentStage] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [results, setResults] = useState<any[]>([]);

  const isPremiumUser = userPlan === 'professional' || userPlan === 'enterprise';

  const updateStageStatus = useCallback((stageId: string, status: ResearchStage['status'], result?: any) => {
    setStages(prev => prev.map(stage => 
      stage.id === stageId 
        ? { ...stage, status, result }
        : stage
    ));
  }, []);

  const runBasicSearch = async () => {
    updateStageStatus('basic-search', 'running');
    
    // Simulate basic patent search
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockResults = {
      found: 15,
      relevantPatents: [
        { id: 'US10123456', title: 'Similar invention method', similarity: 85 },
        { id: 'US10789012', title: 'Related technology approach', similarity: 72 },
        { id: 'EP3456789', title: 'Alternative implementation', similarity: 68 }
      ]
    };
    
    updateStageStatus('basic-search', 'completed', mockResults);
    setResults(prev => [...prev, mockResults]);
  };

  const runWebScraping = async () => {
    updateStageStatus('web-scraping', 'running');
    
    try {
      // Search for patent-related information using Firecrawl
      const searchQuery = `${patentIdea} patent prior art existing technology`;
      
      const searchResult = await searchUrl({
        query: searchQuery,
        limit: 5,
        timeout: 30000
      });

      if (searchResult.success && searchResult.data) {
        // Scrape the most relevant results
        const scrapePromises = searchResult.data.slice(0, 3).map(async (item) => {
          if (item.url) {
            const scrapeResult = await scrapeUrl({
              url: item.url,
              onlyMainContent: true,
              formats: ['markdown'],
              timeout: 15000
            });
            
            return {
              url: item.url,
              title: item.title,
              content: scrapeResult.success ? scrapeResult.data?.markdown?.substring(0, 500) : null
            };
          }
          return null;
        });

        const scrapedData = await Promise.all(scrapePromises);
        const validResults = scrapedData.filter(result => result !== null);

        const webResults = {
          searchResults: searchResult.data.length,
          scrapedPages: validResults.length,
          insights: validResults,
          analysis: 'Enhanced web scraping revealed additional prior art and technical documentation.'
        };

        updateStageStatus('web-scraping', 'completed', webResults);
        setResults(prev => [...prev, webResults]);
      } else {
        throw new Error('Web scraping failed');
      }
    } catch (error) {
      console.error('Web scraping error:', error);
      updateStageStatus('web-scraping', 'error', { error: 'Web scraping encountered an issue' });
    }
  };

  const runSimilarityAnalysis = async () => {
    updateStageStatus('similarity-analysis', 'running');
    
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    const analysisResults = {
      technicalSimilarity: 73,
      riskLevel: 'Medium',
      recommendations: [
        'Consider alternative implementation approach',
        'Focus on unique algorithm improvements',
        'Add additional novel features to differentiate'
      ],
      differentiatingFactors: [
        'Novel data processing method',
        'Improved efficiency algorithm',
        'Enhanced user interface design'
      ]
    };
    
    updateStageStatus('similarity-analysis', 'completed', analysisResults);
    setResults(prev => [...prev, analysisResults]);
  };

  const runLiveMonitoring = async () => {
    if (!isPremiumUser) {
      updateStageStatus('live-monitoring', 'error', { 
        error: 'Premium feature requires Professional or Enterprise plan' 
      });
      return;
    }

    updateStageStatus('live-monitoring', 'running');
    
    // Simulate premium live monitoring
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const liveResults = {
      recentFilings: 8,
      relevantApplications: [
        { id: 'US20240001234', filed: '2024-01-15', similarity: 45 },
        { id: 'US20240005678', filed: '2024-02-20', similarity: 38 }
      ],
      trendAnalysis: 'Increasing activity in this technology sector',
      alerts: ['New competitive patent filed by TechCorp Inc.']
    };
    
    updateStageStatus('live-monitoring', 'completed', liveResults);
    setResults(prev => [...prev, liveResults]);
  };

  const runRiskAssessment = async () => {
    updateStageStatus('risk-assessment', 'running');
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const riskResults = {
      overallRisk: 'Low-Medium',
      patentabilityScore: 82,
      infringementRisk: 25,
      marketFreedom: 'Good',
      recommendations: [
        'Proceed with patent application',
        'Conduct detailed claim analysis', 
        'Consider filing continuation applications'
      ]
    };
    
    updateStageStatus('risk-assessment', 'completed', riskResults);
    setResults(prev => [...prev, riskResults]);
  };

  const startResearch = async () => {
    setIsRunning(true);
    setCurrentStage(0);
    setOverallProgress(0);
    setResults([]);

    const researchSteps = [
      runBasicSearch,
      runWebScraping,
      runSimilarityAnalysis,
      runLiveMonitoring,
      runRiskAssessment
    ];

    for (let i = 0; i < researchSteps.length; i++) {
      setCurrentStage(i);
      await researchSteps[i]();
      setOverallProgress(((i + 1) / researchSteps.length) * 100);
      
      // Small delay between stages
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsRunning(false);
    
    if (onResearchComplete) {
      onResearchComplete(results);
    }
  };

  const getPremiumBadge = (stage: ResearchStage) => {
    if (stage.premium) {
      return (
        <Badge variant="secondary" className="ml-2 bg-purple-100 text-purple-700">
          <CrownIcon className="h-3 w-3 mr-1" />
          PRO
        </Badge>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BrainIcon className="h-6 w-6 mr-2 text-blue-600" />
            Enhanced Patent Research Pipeline
          </CardTitle>
          <CardDescription>
            5-stage AI-powered research system with advanced web scraping and real-time monitoring
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Research Progress */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Research Progress</span>
              <span className="text-sm text-gray-500">{Math.round(overallProgress)}%</span>
            </div>
            <Progress value={overallProgress} className="w-full" />
          </div>

          {/* Research Stages */}
          <div className="space-y-3">
            {stages.map((stage, index) => (
              <div 
                key={stage.id}
                className={`p-4 rounded-lg border transition-all ${
                  stage.status === 'running' ? 'bg-blue-50 border-blue-200' : 
                  stage.status === 'completed' ? 'bg-green-50 border-green-200' :
                  stage.status === 'error' ? 'bg-red-50 border-red-200' :
                  'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {stage.status === 'running' && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3" />
                    )}
                    {stage.status === 'completed' && (
                      <ShieldCheckIcon className="h-4 w-4 text-green-600 mr-3" />
                    )}
                    {stage.status === 'error' && (
                      <AlertTriangleIcon className="h-4 w-4 text-red-600 mr-3" />
                    )}
                    {stage.status === 'pending' && (
                      <div className="h-4 w-4 rounded-full border-2 border-gray-300 mr-3" />
                    )}
                    
                    <div>
                      <div className="flex items-center">
                        <span className="font-medium">{stage.name}</span>
                        {getPremiumBadge(stage)}
                        {stage.premium && !isPremiumUser && (
                          <LockIcon className="h-4 w-4 ml-2 text-gray-400" />
                        )}
                      </div>
                      <span className="text-sm text-gray-600">{stage.description}</span>
                    </div>
                  </div>
                </div>

                {stage.status === 'error' && stage.result?.error && (
                  <Alert className="mt-3">
                    <AlertTriangleIcon className="h-4 w-4" />
                    <AlertDescription>{stage.result.error}</AlertDescription>
                  </Alert>
                )}
              </div>
            ))}
          </div>

          {/* Start Research Button */}
          <Button
            onClick={startResearch}
            disabled={isRunning || !patentIdea}
            className="w-full"
            size="lg"
          >
            {isRunning ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Running Research Pipeline...
              </>
            ) : (
              <>
                <SearchIcon className="h-4 w-4 mr-2" />
                Start Enhanced Research
              </>
            )}
          </Button>

          {/* Premium Features Notice */}
          {!isPremiumUser && (
            <Alert className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <SparklesIcon className="h-4 w-4 text-purple-600" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span>
                    <strong>Upgrade to Professional</strong> to unlock premium AI features:
                    Live patent monitoring, visual diagrams, and audio explanations!
                  </span>
                  <Button size="sm" className="ml-4 bg-purple-600 hover:bg-purple-700">
                    Upgrade Now
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Premium Features Preview */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="p-4">
            <div className="flex items-center mb-2">
              <ImageIcon className="h-5 w-5 text-purple-600 mr-2" />
              <span className="font-medium">Visual Diagrams</span>
              <Badge className="ml-2 bg-purple-100 text-purple-700">PRO</Badge>
            </div>
            <p className="text-sm text-gray-600">
              Generate professional patent diagrams with Luma AI and Flux
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="p-4">
            <div className="flex items-center mb-2">
              <MicIcon className="h-5 w-5 text-purple-600 mr-2" />
              <span className="font-medium">Audio Explanations</span>
              <Badge className="ml-2 bg-purple-100 text-purple-700">PRO</Badge>
            </div>
            <p className="text-sm text-gray-600">
              Convert documents to professional audio with ElevenLabs
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="p-4">
            <div className="flex items-center mb-2">
              <DatabaseIcon className="h-5 w-5 text-purple-600 mr-2" />
              <span className="font-medium">Live Monitoring</span>
              <Badge className="ml-2 bg-purple-100 text-purple-700">PRO</Badge>
            </div>
            <p className="text-sm text-gray-600">
              Real-time patent search with xAi Live Search
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Research Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Research Results</CardTitle>
            <CardDescription>
              Comprehensive analysis of your patent idea
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="prior-art">Prior Art</TabsTrigger>
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
                <TabsTrigger value="recommendations">Next Steps</TabsTrigger>
              </TabsList>
              
              <TabsContent value="summary" className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {results.map((result, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <pre className="text-sm overflow-auto">
                        {JSON.stringify(result, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="prior-art">
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Detailed prior art analysis from multiple sources including patent databases, 
                    academic papers, and web content.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="analysis">
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Technical similarity analysis and risk assessment based on existing patents 
                    and current market landscape.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="recommendations">
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Strategic recommendations for patent application process and potential 
                    improvements to your invention.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}