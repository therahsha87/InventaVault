'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, CheckCircle, Clock, AlertTriangle, Zap } from 'lucide-react';
import type { PatentIdea, PriorArtResult, PatentDocument } from '@/types/patent';
import {
  generatePatentId,
  calculatePatentabilityScore,
  generatePatentClaims,
  generatePatentAbstract,
  generateDetailedDescription,
  generateInventorshipStatement,
  generatePatentabilityAnalysis,
  generateRecommendedNextSteps
} from '@/lib/patent-utils';

interface PatentDocumentGeneratorProps {
  idea: PatentIdea;
  priorArtResults: PriorArtResult[];
  onComplete: (document: PatentDocument) => void;
}

export function PatentDocumentGenerator({ idea, priorArtResults, onComplete }: PatentDocumentGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [document, setDocument] = useState<PatentDocument | null>(null);
  const [completed, setCompleted] = useState(false);

  const startGeneration = async () => {
    setIsGenerating(true);
    setProgress(0);
    setDocument(null);

    try {
      // Step 1: Generate basic structure
      setCurrentStep('Creating patent document structure...');
      setProgress(15);

      const patentId = generatePatentId();
      const patentabilityScore = calculatePatentabilityScore(priorArtResults);

      // Step 2: Generate patent claims
      setCurrentStep('Drafting patent claims...');
      setProgress(25);

      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing time
      const patentClaims = generatePatentClaims(idea);

      // Step 3: Generate abstract
      setCurrentStep('Creating patent abstract...');
      setProgress(40);

      await new Promise(resolve => setTimeout(resolve, 1000));
      const abstract = generatePatentAbstract(idea, priorArtResults);

      // Step 4: Generate detailed description
      setCurrentStep('Writing detailed technical description...');
      setProgress(55);

      await new Promise(resolve => setTimeout(resolve, 2000));
      const detailedDescription = generateDetailedDescription(idea);

      // Step 5: Generate inventorship statement
      setCurrentStep('Preparing inventorship documentation...');
      setProgress(70);

      await new Promise(resolve => setTimeout(resolve, 1000));
      const inventorshipStatement = generateInventorshipStatement(idea);

      // Step 6: Generate patentability analysis
      setCurrentStep('Analyzing patentability and prior art...');
      setProgress(85);

      await new Promise(resolve => setTimeout(resolve, 1500));
      const patentabilityAnalysis = generatePatentabilityAnalysis(idea, priorArtResults, patentabilityScore);

      // Step 7: Generate recommendations
      setCurrentStep('Preparing recommendations and next steps...');
      setProgress(95);

      await new Promise(resolve => setTimeout(resolve, 1000));
      const recommendedNextSteps = generateRecommendedNextSteps(patentabilityScore);

      // Step 8: Finalize document
      setCurrentStep('Finalizing patent document...');
      setProgress(100);

      const finalDocument: PatentDocument = {
        id: patentId,
        idea,
        priorArtResults,
        patentClaims,
        abstract,
        detailedDescription,
        drawingsDescription: 'Drawings and diagrams can be added to illustrate the invention implementation and technical specifications.',
        inventorshipStatement,
        patentabilityAnalysis,
        recommendedNextSteps,
        createdAt: new Date(),
        status: 'completed'
      };

      setDocument(finalDocument);
      setCompleted(true);

    } catch (error) {
      console.error('Patent generation error:', error);
      setCurrentStep('Generation completed with limitations');
      setProgress(100);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleComplete = () => {
    if (document) {
      onComplete(document);
    }
  };

  const getPatentabilityColor = (score: number) => {
    if (score >= 70) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 40) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getPatentabilityIcon = (score: number) => {
    if (score >= 70) return <CheckCircle className="h-5 w-5" />;
    if (score >= 40) return <Clock className="h-5 w-5" />;
    return <AlertTriangle className="h-5 w-5" />;
  };

  const patentabilityScore = document ? calculatePatentabilityScore(priorArtResults) : 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FileText className="h-6 w-6 text-green-600 mr-2" />
            <CardTitle className="text-2xl font-bold text-gray-900">Patent Document Generation</CardTitle>
          </div>
          {!completed && (
            <Button onClick={startGeneration} disabled={isGenerating}>
              <Zap className="h-4 w-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Generate Patent'}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {isGenerating && (
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

        {document && (
          <div className="space-y-6">
            {/* Patent Header */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{document.idea.title}</h3>
                  <p className="text-sm text-gray-600">Patent ID: {document.id}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Generated: {document.createdAt.toLocaleDateString()}</div>
                  <Badge className={getPatentabilityColor(patentabilityScore)}>
                    {getPatentabilityIcon(patentabilityScore)}
                    <span className="ml-1">Patentability: {patentabilityScore}%</span>
                  </Badge>
                </div>
              </div>
            </div>

            {/* Document Sections */}
            <div className="grid gap-6">
              <Card className="border border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Patent Abstract</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose text-sm text-gray-700 whitespace-pre-line">
                    {document.abstract}
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Patent Claims ({document.patentClaims.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {document.patentClaims.map((claim, index) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-4">
                        <p className="text-sm text-gray-700">{claim}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Detailed Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose text-sm text-gray-700 whitespace-pre-line">
                    {document.detailedDescription}
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Patentability Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose text-sm text-gray-700 whitespace-pre-line">
                    {document.patentabilityAnalysis}
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Recommended Next Steps</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {document.recommendedNextSteps.map((step, index) => (
                      <div key={index} className="flex items-start">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs font-medium flex items-center justify-center mr-3 mt-0.5">
                          {index + 1}
                        </div>
                        <p className="text-sm text-gray-700">{step}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Inventorship Statement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose text-sm text-gray-700 whitespace-pre-line">
                    {document.inventorshipStatement}
                  </div>
                </CardContent>
              </Card>
            </div>

            {completed && (
              <div className="flex flex-col space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Patent document generated successfully!</strong> Your comprehensive patent application is ready. Proceed to blockchain recording and payment to finalize the process.
                  </AlertDescription>
                </Alert>
                
                <Button 
                  onClick={handleComplete} 
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3"
                  size="lg"
                >
                  Continue to Blockchain Recording & Payment
                </Button>
              </div>
            )}
          </div>
        )}

        {!isGenerating && !document && (
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              Ready to generate your comprehensive patent document. This will include claims, detailed descriptions, patentability analysis, and legal documentation.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
