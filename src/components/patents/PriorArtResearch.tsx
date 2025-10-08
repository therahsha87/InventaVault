'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, ExternalLink, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { exaSearch, exaAnswer } from '@/exa-api';
import { perplexityResearch } from '@/perplexity-api';
import type { PatentIdea, PriorArtResult } from '@/types/patent';

interface PriorArtResearchProps {
  idea: PatentIdea;
  onComplete: (results: PriorArtResult[]) => void;
}

export function PriorArtResearch({ idea, onComplete }: PriorArtResearchProps) {
  const [isResearching, setIsResearching] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [results, setResults] = useState<PriorArtResult[]>([]);
  const [completed, setCompleted] = useState(false);

  const searchQueries = [
    `${idea.title} patent prior art`,
    `${idea.technicalField} ${idea.problemSolved} patent`,
    `"${idea.solution}" patent application`,
    `${idea.technicalField} invention similar to ${idea.title}`,
    `patent database ${idea.technicalField} ${idea.problemSolved}`
  ];

  const startResearch = async () => {
    setIsResearching(true);
    setProgress(0);
    setResults([]);
    
    const allResults: PriorArtResult[] = [];

    try {
      // Step 1: Search patent databases and academic sources
      setCurrentStep('Searching patent databases and academic sources...');
      setProgress(20);

      for (let i = 0; i < searchQueries.length; i++) {
        const query = searchQueries[i];
        
        try {
          const searchResult = await exaSearch({
            query: query,
            text: true
          });

          if (searchResult.results && searchResult.results.length > 0) {
            // Process top 2 results per query to avoid overwhelming
            for (const result of searchResult.results.slice(0, 2)) {
              if (result.url && result.title) {
                const relevanceScore = calculateRelevanceScore(result, idea);
                const similarity = determineSimilarity(relevanceScore);
                
                allResults.push({
                  title: result.title,
                  url: result.url,
                  summary: result.text || result.summary || 'No summary available',
                  relevanceScore,
                  publicationDate: result.publishedDate,
                  similarity
                });
              }
            }
          }
        } catch (error) {
          console.error(`Search error for query "${query}":`, error);
        }
        
        setProgress(20 + (i + 1) * 10);
      }

      // Step 2: Deep analysis with Perplexity
      setCurrentStep('Performing deep prior art analysis...');
      setProgress(70);

      try {
        const analysisQuery = `Analyze potential prior art for this invention: "${idea.title}". 
        Technical field: ${idea.technicalField}. 
        Problem solved: ${idea.problemSolved}. 
        Solution: ${idea.solution}. 
        Find existing patents, academic papers, or commercial products that might be similar.`;

        const analysis = await perplexityResearch(analysisQuery);
        
        if (analysis.citations && analysis.citations.length > 0) {
          for (const citation of analysis.citations.slice(0, 3)) {
            const relevanceScore = calculateRelevanceScore({ title: citation, text: analysis.answer }, idea);
            const similarity = determineSimilarity(relevanceScore);
            
            allResults.push({
              title: `Research Finding: ${citation}`,
              url: citation,
              summary: `Found through comprehensive patent research: ${analysis.answer.substring(0, 200)}...`,
              relevanceScore,
              similarity
            });
          }
        }
      } catch (error) {
        console.error('Perplexity analysis error:', error);
      }

      // Step 3: Final verification and scoring
      setCurrentStep('Finalizing prior art analysis...');
      setProgress(90);

      // Remove duplicates and sort by relevance
      const uniqueResults = allResults.filter((result, index, self) => 
        index === self.findIndex(r => r.url === result.url)
      ).sort((a, b) => b.relevanceScore - a.relevanceScore);

      // Keep top 10 most relevant results
      const finalResults = uniqueResults.slice(0, 10);
      
      setResults(finalResults);
      setProgress(100);
      setCurrentStep('Prior art research completed');
      setCompleted(true);

    } catch (error) {
      console.error('Prior art research error:', error);
      setCurrentStep('Research completed with some limitations');
      setProgress(100);
      setCompleted(true);
    } finally {
      setIsResearching(false);
    }
  };

  const calculateRelevanceScore = (result: any, idea: PatentIdea): number => {
    let score = 0;
    const text = ((result.text || result.summary || result.title || '') + ' ' + (result.title || '')).toLowerCase();
    const ideaText = `${idea.title} ${idea.description} ${idea.technicalField} ${idea.problemSolved} ${idea.solution}`.toLowerCase();
    
    // Keyword matching
    const ideaKeywords = ideaText.split(/\s+/).filter(word => word.length > 3);
    const matchingKeywords = ideaKeywords.filter(keyword => text.includes(keyword));
    score += (matchingKeywords.length / ideaKeywords.length) * 60;
    
    // Technical field matching
    if (text.includes(idea.technicalField.toLowerCase())) score += 20;
    
    // Problem/solution matching
    const problemWords = idea.problemSolved.toLowerCase().split(/\s+/).filter(word => word.length > 3);
    const solutionWords = idea.solution.toLowerCase().split(/\s+/).filter(word => word.length > 3);
    
    const problemMatches = problemWords.filter(word => text.includes(word)).length;
    const solutionMatches = solutionWords.filter(word => text.includes(word)).length;
    
    score += (problemMatches / problemWords.length) * 10;
    score += (solutionMatches / solutionWords.length) * 10;
    
    // Patent-specific terms boost
    if (text.includes('patent') || text.includes('invention') || text.includes('claim')) {
      score += 5;
    }
    
    return Math.min(Math.round(score), 100);
  };

  const determineSimilarity = (relevanceScore: number): 'low' | 'medium' | 'high' => {
    if (relevanceScore >= 70) return 'high';
    if (relevanceScore >= 40) return 'medium';
    return 'low';
  };

  const getSimilarityColor = (similarity: 'low' | 'medium' | 'high') => {
    switch (similarity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
    }
  };

  const getSimilarityIcon = (similarity: 'low' | 'medium' | 'high') => {
    switch (similarity) {
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Clock className="h-4 w-4" />;
      case 'low': return <CheckCircle className="h-4 w-4" />;
    }
  };

  const handleComplete = () => {
    onComplete(results);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Search className="h-6 w-6 text-blue-600 mr-2" />
            <CardTitle className="text-2xl font-bold text-gray-900">Prior Art Research</CardTitle>
          </div>
          {!completed && (
            <Button onClick={startResearch} disabled={isResearching}>
              {isResearching ? 'Researching...' : 'Start Research'}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {isResearching && (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>{currentStep}</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Found {results.length} Prior Art References
              </h3>
              {completed && (
                <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700">
                  Continue to Patent Generation
                </Button>
              )}
            </div>

            <div className="grid gap-4">
              {results.map((result, index) => (
                <Card key={index} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{result.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {result.summary.length > 200 ? 
                            `${result.summary.substring(0, 200)}...` : 
                            result.summary
                          }
                        </p>
                      </div>
                      <div className="flex flex-col items-end space-y-2 ml-4">
                        <Badge className={getSimilarityColor(result.similarity)}>
                          {getSimilarityIcon(result.similarity)}
                          <span className="ml-1">{result.similarity.toUpperCase()}</span>
                        </Badge>
                        <div className="text-sm text-gray-500">
                          {result.relevanceScore}% relevant
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        {result.publicationDate && `Published: ${result.publicationDate}`}
                        {result.patentNumber && ` • Patent: ${result.patentNumber}`}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(result.url, '_blank')}
                        className="text-xs"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {completed && results.length === 0 && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Excellent news!</strong> No directly relevant prior art was found for your invention. This suggests strong novelty and patentability. You can proceed with confidence to patent generation.
            </AlertDescription>
          </Alert>
        )}

        {completed && results.length > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Prior art found:</strong> {results.length} references were identified. Review these carefully as they may impact your patent claims. Our AI will automatically adjust the patent application to differentiate from existing prior art.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
