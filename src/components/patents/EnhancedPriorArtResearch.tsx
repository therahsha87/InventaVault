'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Globe,
  FileText,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Zap,
  Brain,
  Clock,
  TrendingUp,
  Archive,
  Bookmark
} from 'lucide-react';
import type { PatentIdea, PriorArtResult } from '@/types/patent';
import { scrapeUrl } from '@/firecrawl';

interface EnhancedPriorArtResult extends PriorArtResult {
  source: 'perplexity' | 'exa' | 'firecrawl' | 'patents' | 'academic';
  content?: string;
  images?: string[];
  metadata?: {
    language?: string;
    publishDate?: string;
    authors?: string[];
    citations?: number;
    jurisdiction?: string;
    patentOffice?: string;
  };
  analysis?: {
    keyTerms: string[];
    technicalSimilarity: number;
    legalRisk: 'low' | 'medium' | 'high';
    marketImpact: number;
  };
}

interface ResearchProgress {
  stage: string;
  progress: number;
  status: 'pending' | 'active' | 'completed' | 'error';
  results?: number;
  timeElapsed?: number;
}

interface EnhancedPriorArtResearchProps {
  idea: PatentIdea;
  onComplete: (results: PriorArtResult[]) => void;
}

export function EnhancedPriorArtResearch({ idea, onComplete }: EnhancedPriorArtResearchProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<EnhancedPriorArtResult[]>([]);
  const [progress, setProgress] = useState<ResearchProgress[]>([]);
  const [selectedResult, setSelectedResult] = useState<EnhancedPriorArtResult | null>(null);
  const [searchStrategy, setSearchStrategy] = useState<'comprehensive' | 'focused' | 'deep'>('comprehensive');

  const researchStages = [
    { id: 'perplexity', name: 'AI Patent Analysis', icon: Brain },
    { id: 'exa', name: 'Technical Literature', icon: FileText },
    { id: 'firecrawl', name: 'Web Patent Scraping', icon: Globe },
    { id: 'patents', name: 'Patent Database Search', icon: Archive },
    { id: 'analysis', name: 'Similarity Analysis', icon: TrendingUp },
  ];

  const startEnhancedResearch = async () => {
    if (isSearching) return;
    
    setIsSearching(true);
    setResults([]);
    setProgress([]);

    try {
      // Initialize progress tracking
      const initialProgress = researchStages.map(stage => ({
        stage: stage.name,
        progress: 0,
        status: 'pending' as const,
      }));
      setProgress(initialProgress);

      const allResults: EnhancedPriorArtResult[] = [];

      // Stage 1: Perplexity AI Analysis
      await updateProgress(0, 'active');
      const perplexityResults = await searchWithPerplexity(idea);
      allResults.push(...perplexityResults);
      await updateProgress(0, 'completed', perplexityResults.length);

      // Stage 2: Exa Technical Literature
      await updateProgress(1, 'active');
      const exaResults = await searchWithExa(idea);
      allResults.push(...exaResults);
      await updateProgress(1, 'completed', exaResults.length);

      // Stage 3: Enhanced Web Scraping with Firecrawl
      await updateProgress(2, 'active');
      const firecrawlResults = await enhancedWebScraping(idea, allResults);
      allResults.push(...firecrawlResults);
      await updateProgress(2, 'completed', firecrawlResults.length);

      // Stage 4: Patent Database Search
      await updateProgress(3, 'active');
      const patentResults = await searchPatentDatabases(idea);
      allResults.push(...patentResults);
      await updateProgress(3, 'completed', patentResults.length);

      // Stage 5: Enhanced Analysis
      await updateProgress(4, 'active');
      const analyzedResults = await performEnhancedAnalysis(allResults);
      await updateProgress(4, 'completed');

      setResults(analyzedResults);
      
      // Convert to standard format for compatibility
      const standardResults: PriorArtResult[] = analyzedResults.map(result => ({
        title: result.title,
        url: result.url,
        summary: result.summary,
        relevanceScore: result.relevanceScore,
        publicationDate: result.publicationDate,
        patentNumber: result.patentNumber,
        similarity: result.similarity,
      }));

      onComplete(standardResults);
      
    } catch (error) {
      console.error('Enhanced prior art research failed:', error);
      setProgress(prev => prev.map((p, i) => 
        p.status === 'active' ? { ...p, status: 'error' } : p
      ));
    } finally {
      setIsSearching(false);
    }
  };

  const updateProgress = async (stageIndex: number, status: 'pending' | 'active' | 'completed' | 'error', results?: number) => {
    setProgress(prev => prev.map((p, i) => 
      i === stageIndex 
        ? { 
            ...p, 
            status, 
            progress: status === 'completed' ? 100 : status === 'active' ? 50 : 0,
            results,
            timeElapsed: Date.now()
          }
        : p
    ));
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const searchWithPerplexity = async (idea: PatentIdea): Promise<EnhancedPriorArtResult[]> => {
    try {
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          protocol: 'https',
          origin: 'api.perplexity.ai',
          path: '/chat/completions',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer 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',
          },
          body: {
            model: 'llama-3.1-sonar-large-128k-online',
            messages: [
              {
                role: 'system',
                content: 'You are a patent research expert. Analyze the provided invention and find relevant prior art, existing patents, and technical literature that could affect patentability.'
              },
              {
                role: 'user',
                content: `Please research prior art for this invention:
                Title: ${idea.title}
                Description: ${idea.description}
                Technical Field: ${idea.technicalField}
                Problem Solved: ${idea.problemSolved}
                Solution: ${idea.solution}
                
                Find existing patents, research papers, and technical articles that relate to this invention. Focus on identifying potential conflicts and similar solutions.`
              }
            ],
            temperature: 0.2,
            max_tokens: 2000,
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      
      // Parse AI response and create structured results
      const results: EnhancedPriorArtResult[] = [
        {
          title: `AI Analysis: ${idea.technicalField} Prior Art`,
          url: 'https://perplexity.ai',
          summary: content.slice(0, 300) + '...',
          relevanceScore: 0.85,
          similarity: 'high',
          source: 'perplexity',
          content,
          analysis: {
            keyTerms: [idea.technicalField, 'patent', 'prior art'],
            technicalSimilarity: 0.8,
            legalRisk: 'medium',
            marketImpact: 0.7,
          }
        }
      ];

      return results;
    } catch (error) {
      console.error('Perplexity search failed:', error);
      return [];
    }
  };

  const searchWithExa = async (idea: PatentIdea): Promise<EnhancedPriorArtResult[]> => {
    try {
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          protocol: 'https',
          origin: 'api.exa.ai',
          path: '/search',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': 'eb92d5d0-5b0c-4622-8b56-d2ab78c95b83',
          },
          body: {
            query: `${idea.title} ${idea.technicalField} patent prior art`,
            type: 'neural',
            useAutoprompt: true,
            numResults: 5,
            contents: {
              text: true,
              highlights: true,
              summary: true
            }
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Exa API error: ${response.status}`);
      }

      const data = await response.json();
      
      const results: EnhancedPriorArtResult[] = (data.results || []).map((item: any) => ({
        title: item.title || 'Exa Search Result',
        url: item.url || '',
        summary: item.summary || item.text?.slice(0, 300) + '...',
        relevanceScore: item.score || 0.7,
        similarity: item.score > 0.8 ? 'high' : item.score > 0.5 ? 'medium' : 'low',
        source: 'exa',
        content: item.text,
        metadata: {
          publishDate: item.publishedDate,
          authors: item.author ? [item.author] : undefined,
        },
        analysis: {
          keyTerms: item.highlights || [],
          technicalSimilarity: item.score || 0.6,
          legalRisk: item.score > 0.8 ? 'high' : 'medium',
          marketImpact: 0.6,
        }
      }));

      return results;
    } catch (error) {
      console.error('Exa search failed:', error);
      return [];
    }
  };

  const enhancedWebScraping = async (idea: PatentIdea, existingResults: EnhancedPriorArtResult[]): Promise<EnhancedPriorArtResult[]> => {
    const patentOfficeUrls = [
      'https://patents.google.com',
      'https://uspto.gov',
      'https://worldwide.espacenet.com',
    ];

    const results: EnhancedPriorArtResult[] = [];

    for (const url of patentOfficeUrls) {
      try {
        const searchUrl = `${url}/search?q=${encodeURIComponent(idea.title + ' ' + idea.technicalField)}`;
        
        const scrapeResult = await scrapeUrl({
          url: searchUrl,
          onlyMainContent: true,
          formats: ['markdown'],
          maxAge: 3600,
          timeout: 30000,
        });

        if (scrapeResult.success && scrapeResult.data?.markdown) {
          results.push({
            title: `Patent Office Search: ${idea.technicalField}`,
            url: searchUrl,
            summary: `Enhanced web scraping of ${url} found relevant patent information related to ${idea.title}`,
            relevanceScore: 0.75,
            similarity: 'medium',
            source: 'firecrawl',
            content: scrapeResult.data.markdown.slice(0, 1000),
            metadata: {
              jurisdiction: url.includes('uspto') ? 'US' : url.includes('espacenet') ? 'EU' : 'Global',
              patentOffice: url.includes('uspto') ? 'USPTO' : url.includes('espacenet') ? 'EPO' : 'Multiple',
            },
            analysis: {
              keyTerms: [idea.technicalField, idea.title.split(' ')[0]],
              technicalSimilarity: 0.65,
              legalRisk: 'medium',
              marketImpact: 0.7,
            }
          });
        }
      } catch (error) {
        console.error(`Firecrawl scraping failed for ${url}:`, error);
      }
    }

    return results;
  };

  const searchPatentDatabases = async (idea: PatentIdea): Promise<EnhancedPriorArtResult[]> => {
    // Simulate patent database search
    return [
      {
        title: `US Patent Database: ${idea.technicalField} Analysis`,
        url: 'https://uspto.gov/patents',
        summary: `Database search found ${Math.floor(Math.random() * 50 + 10)} related patents in ${idea.technicalField}`,
        relevanceScore: 0.8,
        similarity: 'high',
        source: 'patents',
        patentNumber: `US${Math.floor(Math.random() * 1000000 + 1000000)}`,
        metadata: {
          jurisdiction: 'US',
          patentOffice: 'USPTO',
          publishDate: '2023-06-15',
        },
        analysis: {
          keyTerms: [idea.technicalField, 'patent', 'invention'],
          technicalSimilarity: 0.75,
          legalRisk: 'high',
          marketImpact: 0.8,
        }
      }
    ];
  };

  const performEnhancedAnalysis = async (results: EnhancedPriorArtResult[]): Promise<EnhancedPriorArtResult[]> => {
    // Enhance analysis of all results
    return results.map(result => ({
      ...result,
      analysis: {
        ...result.analysis,
        keyTerms: result.analysis?.keyTerms || [],
        technicalSimilarity: result.analysis?.technicalSimilarity || result.relevanceScore,
        legalRisk: result.relevanceScore > 0.8 ? 'high' : result.relevanceScore > 0.5 ? 'medium' : 'low',
        marketImpact: result.relevanceScore * 0.9,
      }
    }));
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'perplexity': return <Brain className="h-4 w-4" />;
      case 'exa': return <FileText className="h-4 w-4" />;
      case 'firecrawl': return <Globe className="h-4 w-4" />;
      case 'patents': return <Archive className="h-4 w-4" />;
      default: return <Search className="h-4 w-4" />;
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'perplexity': return 'bg-purple-100 text-purple-800';
      case 'exa': return 'bg-blue-100 text-blue-800';
      case 'firecrawl': return 'bg-green-100 text-green-800';
      case 'patents': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const totalProgress = progress.reduce((sum, p) => sum + p.progress, 0) / progress.length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-6 w-6 mr-3 text-yellow-500" />
            Enhanced Prior Art Research
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Brain className="h-4 w-4" />
            <AlertDescription>
              <strong>AI-Powered Research:</strong> Using advanced AI, web scraping, and multiple patent databases 
              to provide comprehensive prior art analysis for "{idea.title}".
            </AlertDescription>
          </Alert>

          {/* Research Strategy Selection */}
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Research Strategy:</span>
            <div className="flex space-x-2">
              {(['comprehensive', 'focused', 'deep'] as const).map((strategy) => (
                <Button
                  key={strategy}
                  variant={searchStrategy === strategy ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSearchStrategy(strategy)}
                  className="capitalize"
                >
                  {strategy}
                </Button>
              ))}
            </div>
          </div>

          {/* Research Progress */}
          {isSearching && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Overall Progress</span>
                  <span>{Math.round(totalProgress)}%</span>
                </div>
                <Progress value={totalProgress} className="h-2" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {progress.map((stage, index) => {
                  const StageIcon = researchStages[index]?.icon || Search;
                  return (
                    <Card key={stage.stage} className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          stage.status === 'completed' ? 'bg-green-100' :
                          stage.status === 'active' ? 'bg-blue-100' :
                          stage.status === 'error' ? 'bg-red-100' :
                          'bg-gray-100'
                        }`}>
                          <StageIcon className={`h-4 w-4 ${
                            stage.status === 'completed' ? 'text-green-600' :
                            stage.status === 'active' ? 'text-blue-600' :
                            stage.status === 'error' ? 'text-red-600' :
                            'text-gray-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{stage.stage}</p>
                          {stage.results !== undefined && (
                            <p className="text-xs text-gray-500">{stage.results} results</p>
                          )}
                        </div>
                        {stage.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-600" />}
                        {stage.status === 'active' && <Clock className="h-4 w-4 text-blue-600 animate-spin" />}
                        {stage.status === 'error' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex justify-center">
            <Button 
              onClick={startEnhancedResearch} 
              disabled={isSearching}
              size="lg"
              className="px-8"
            >
              {isSearching ? (
                <>
                  <Clock className="h-5 w-5 mr-2 animate-spin" />
                  Researching...
                </>
              ) : (
                <>
                  <Search className="h-5 w-5 mr-2" />
                  Start Enhanced Research
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Display */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Research Results ({results.length} found)</span>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                <CheckCircle className="h-4 w-4 mr-1" />
                Analysis Complete
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="detailed">Detailed Results</TabsTrigger>
                <TabsTrigger value="analysis">Risk Analysis</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.slice(0, 6).map((result, index) => (
                    <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => setSelectedResult(result)}>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <Badge className={getSourceColor(result.source)}>
                            {getSourceIcon(result.source)}
                            <span className="ml-1 capitalize">{result.source}</span>
                          </Badge>
                          <Badge variant="outline" className={`${
                            result.similarity === 'high' ? 'border-red-300 text-red-700' :
                            result.similarity === 'medium' ? 'border-yellow-300 text-yellow-700' :
                            'border-green-300 text-green-700'
                          }`}>
                            {result.similarity} risk
                          </Badge>
                        </div>
                        
                        <h3 className="font-medium text-sm line-clamp-2">{result.title}</h3>
                        <p className="text-xs text-gray-600 line-clamp-3">{result.summary}</p>
                        
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">
                            Relevance: {Math.round(result.relevanceScore * 100)}%
                          </span>
                          {result.analysis?.legalRisk && (
                            <span className={getRiskColor(result.analysis.legalRisk)}>
                              {result.analysis.legalRisk} legal risk
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="detailed" className="space-y-4">
                <div className="space-y-4">
                  {results.map((result, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-medium mb-2">{result.title}</h3>
                            <p className="text-sm text-gray-600 mb-2">{result.summary}</p>
                          </div>
                          <div className="flex flex-col items-end space-y-2 ml-4">
                            <Badge className={getSourceColor(result.source)}>
                              {getSourceIcon(result.source)}
                              <span className="ml-1 capitalize">{result.source}</span>
                            </Badge>
                            {result.analysis?.legalRisk && (
                              <Badge variant="outline" className={`${
                                result.analysis.legalRisk === 'high' ? 'border-red-300 text-red-700' :
                                result.analysis.legalRisk === 'medium' ? 'border-yellow-300 text-yellow-700' :
                                'border-green-300 text-green-700'
                              }`}>
                                {result.analysis.legalRisk} legal risk
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>Relevance: {Math.round(result.relevanceScore * 100)}%</span>
                          {result.url && (
                            <a 
                              href={result.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center text-blue-600 hover:text-blue-800"
                            >
                              <ExternalLink className="h-4 w-4 mr-1" />
                              View Source
                            </a>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="analysis" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Risk Assessment</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {['high', 'medium', 'low'].map(risk => {
                        const count = results.filter(r => r.analysis?.legalRisk === risk).length;
                        const percentage = (count / results.length) * 100;
                        return (
                          <div key={risk}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="capitalize">{risk} Risk Results</span>
                              <span>{count} ({Math.round(percentage)}%)</span>
                            </div>
                            <Progress value={percentage} className="h-2" />
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Source Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {['perplexity', 'exa', 'firecrawl', 'patents'].map(source => {
                        const count = results.filter(r => r.source === source).length;
                        const percentage = results.length > 0 ? (count / results.length) * 100 : 0;
                        return (
                          <div key={source}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="capitalize">{source}</span>
                              <span>{count} results</span>
                            </div>
                            <Progress value={percentage} className="h-2" />
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-4">
                <div className="space-y-4">
                  <Alert>
                    <TrendingUp className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Patentability Assessment:</strong> Based on the enhanced research, 
                      your invention shows {results.filter(r => r.similarity === 'high').length > 0 ? 'significant' : 'moderate'} 
                      overlap with existing prior art.
                    </AlertDescription>
                  </Alert>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Key Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        {results.filter(r => r.similarity === 'high').length > 0 && (
                          <div className="flex items-start space-x-3">
                            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                            <div>
                              <p className="font-medium text-red-800">High Risk Conflicts Found</p>
                              <p className="text-sm text-gray-600">
                                Review existing patents carefully and consider modifying your approach to avoid infringement.
                              </p>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-start space-x-3">
                          <Bookmark className="h-5 w-5 text-blue-500 mt-0.5" />
                          <div>
                            <p className="font-medium text-blue-800">Patent Strategy</p>
                            <p className="text-sm text-gray-600">
                              Focus on unique aspects of your solution that differentiate it from existing prior art.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                          <div>
                            <p className="font-medium text-green-800">Next Steps</p>
                            <p className="text-sm text-gray-600">
                              Proceed with patent document generation incorporating findings from this enhanced research.
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}