'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Download, 
  Printer, 
  FileText, 
  Shield, 
  CheckCircle, 
  ExternalLink,
  Share2,
  Copy,
  Calendar
} from 'lucide-react';
import type { PatentDocument, BlockchainPatentRecord } from '@/types/patent';
import { 
  calculatePatentabilityScore,
  getBlockchainExplorerUrl,
  shortenAddress
} from '@/lib/patent-utils';

interface PatentDocumentViewerProps {
  document: PatentDocument;
  blockchainRecord?: BlockchainPatentRecord;
}

export function PatentDocumentViewer({ document, blockchainRecord }: PatentDocumentViewerProps) {
  const [activeSection, setActiveSection] = useState('overview');

  const patentabilityScore = calculatePatentabilityScore(document.priorArtResults);

  const handleDownload = () => {
    const patentContent = generatePatentDocumentText(document, blockchainRecord);
    const blob = new Blob([patentContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Patent_${document.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const printContent = generateHTMLPatentDocument(document, blockchainRecord);
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Patent: ${document.idea.title}`,
          text: `Check out this patent application: ${document.idea.title}`,
          url: blockchainRecord ? getBlockchainExplorerUrl(blockchainRecord.transactionHash) : ''
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback to clipboard
      const shareText = `Patent: ${document.idea.title}\nPatent ID: ${document.id}\nBlockchain: ${blockchainRecord?.transactionHash ? getBlockchainExplorerUrl(blockchainRecord.transactionHash) : 'Recording in progress'}`;
      navigator.clipboard.writeText(shareText);
      alert('Patent details copied to clipboard!');
    }
  };

  const copyPatentId = () => {
    navigator.clipboard.writeText(document.id);
    alert('Patent ID copied to clipboard!');
  };

  const sections = [
    { id: 'overview', label: 'Overview' },
    { id: 'abstract', label: 'Abstract' },
    { id: 'claims', label: 'Claims' },
    { id: 'description', label: 'Description' },
    { id: 'analysis', label: 'Analysis' },
    { id: 'blockchain', label: 'Blockchain' }
  ];

  const getPatentabilityColor = (score: number) => {
    if (score >= 70) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 40) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-start space-x-4">
              <div className="bg-indigo-100 p-3 rounded-lg">
                <FileText className="h-8 w-8 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{document.idea.title}</h1>
                <p className="text-gray-600">Patent ID: {document.id}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge className={getPatentabilityColor(patentabilityScore)}>
                    Patentability: {patentabilityScore}%
                  </Badge>
                  {blockchainRecord && (
                    <Badge className="bg-blue-100 text-blue-800">
                      <Shield className="h-3 w-3 mr-1" />
                      Blockchain Recorded
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col space-y-2">
              <div className="flex space-x-2">
                <Button onClick={handleDownload} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button onClick={handlePrint} variant="outline" size="sm">
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
                <Button onClick={handleShare} variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {sections.map((section) => (
              <Button
                key={section.id}
                variant={activeSection === section.id ? 'default' : 'outline'}
                onClick={() => setActiveSection(section.id)}
                size="sm"
              >
                {section.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Content Sections */}
      <div className="space-y-6">
        {/* Overview */}
        {activeSection === 'overview' && (
          <Card>
            <CardHeader>
              <CardTitle>Patent Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Inventor Information</h3>
                    <div className="text-sm space-y-1">
                      <p><strong>Name:</strong> {document.idea.submitterName}</p>
                      <p><strong>Email:</strong> {document.idea.submitterEmail}</p>
                      <p><strong>Filed:</strong> {document.createdAt.toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Technical Details</h3>
                    <div className="text-sm space-y-1">
                      <p><strong>Technical Field:</strong> {document.idea.technicalField}</p>
                      <p><strong>Claims Count:</strong> {document.patentClaims.length}</p>
                      <p><strong>Prior Art Found:</strong> {document.priorArtResults.length} references</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {blockchainRecord && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Blockchain Record</h3>
                      <div className="text-sm space-y-1">
                        <p><strong>Transaction:</strong> 
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => window.open(getBlockchainExplorerUrl(blockchainRecord.transactionHash), '_blank')}
                            className="p-0 ml-1"
                          >
                            {shortenAddress(blockchainRecord.transactionHash)}
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </Button>
                        </p>
                        <p><strong>Block:</strong> #{blockchainRecord.blockNumber.toLocaleString()}</p>
                        <p><strong>Hash:</strong> {shortenAddress(blockchainRecord.hash)}</p>
                        <p><strong>Recorded:</strong> {new Date(blockchainRecord.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Actions</h3>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyPatentId}
                        className="w-full justify-start"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Patent ID
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Problem & Solution Summary</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <strong>Problem Solved:</strong>
                    <p className="mt-1 text-gray-700">{document.idea.problemSolved}</p>
                  </div>
                  <div>
                    <strong>Solution Approach:</strong>
                    <p className="mt-1 text-gray-700">{document.idea.solution}</p>
                  </div>
                  <div>
                    <strong>Key Advantages:</strong>
                    <p className="mt-1 text-gray-700">{document.idea.advantages}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Abstract */}
        {activeSection === 'abstract' && (
          <Card>
            <CardHeader>
              <CardTitle>Patent Abstract</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none text-sm text-gray-700 whitespace-pre-line">
                {document.abstract}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Claims */}
        {activeSection === 'claims' && (
          <Card>
            <CardHeader>
              <CardTitle>Patent Claims ({document.patentClaims.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {document.patentClaims.map((claim, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="text-sm text-gray-700">{claim}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Description */}
        {activeSection === 'description' && (
          <Card>
            <CardHeader>
              <CardTitle>Detailed Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none text-sm text-gray-700 whitespace-pre-line">
                {document.detailedDescription}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analysis */}
        {activeSection === 'analysis' && (
          <Card>
            <CardHeader>
              <CardTitle>Patentability Analysis & Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose max-w-none text-sm text-gray-700 whitespace-pre-line">
                {document.patentabilityAnalysis}
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Recommended Next Steps</h3>
                <div className="space-y-3">
                  {document.recommendedNextSteps.map((step, index) => (
                    <div key={index} className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs font-medium flex items-center justify-center mr-3 mt-0.5">
                        {index + 1}
                      </div>
                      <p className="text-sm text-gray-700">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Blockchain */}
        {activeSection === 'blockchain' && (
          <Card>
            <CardHeader>
              <CardTitle>Blockchain Record</CardTitle>
            </CardHeader>
            <CardContent>
              {blockchainRecord ? (
                <div className="space-y-4">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Patent successfully recorded on Base blockchain.</strong> This provides immutable proof of your invention and timestamp.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div className="space-y-3">
                      <div>
                        <strong>Patent ID:</strong>
                        <p className="mt-1 font-mono text-xs">{blockchainRecord.patentId}</p>
                      </div>
                      <div>
                        <strong>Blockchain Hash:</strong>
                        <p className="mt-1 font-mono text-xs">{blockchainRecord.hash}</p>
                      </div>
                      <div>
                        <strong>Transaction Hash:</strong>
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => window.open(getBlockchainExplorerUrl(blockchainRecord.transactionHash), '_blank')}
                          className="p-0 h-auto font-mono text-xs"
                        >
                          {blockchainRecord.transactionHash}
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <strong>Block Number:</strong>
                        <p className="mt-1">#{blockchainRecord.blockNumber.toLocaleString()}</p>
                      </div>
                      <div>
                        <strong>Gas Used:</strong>
                        <p className="mt-1">{blockchainRecord.gasUsed}</p>
                      </div>
                      <div>
                        <strong>Timestamp:</strong>
                        <p className="mt-1">{new Date(blockchainRecord.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={() => window.open(getBlockchainExplorerUrl(blockchainRecord.transactionHash), '_blank')}
                    className="w-full"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Full Transaction on BaseScan
                  </Button>
                </div>
              ) : (
                <Alert>
                  <Calendar className="h-4 w-4" />
                  <AlertDescription>
                    Blockchain recording is in progress or not yet initiated. Once recorded, the immutable proof will appear here.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function generatePatentDocumentText(document: PatentDocument, blockchainRecord?: BlockchainPatentRecord): string {
  return `
PATENT APPLICATION DOCUMENT
===========================

Patent ID: ${document.id}
Title: ${document.idea.title}
Inventor: ${document.idea.submitterName}
Filed: ${document.createdAt.toLocaleString()}
${blockchainRecord ? `Blockchain Hash: ${blockchainRecord.hash}` : ''}
${blockchainRecord ? `Transaction: ${blockchainRecord.transactionHash}` : ''}

${document.abstract}

PATENT CLAIMS (${document.patentClaims.length}):
${document.patentClaims.map((claim, index) => `${index + 1}. ${claim}`).join('\n')}

DETAILED DESCRIPTION:
${document.detailedDescription}

PATENTABILITY ANALYSIS:
${document.patentabilityAnalysis}

INVENTORSHIP STATEMENT:
${document.inventorshipStatement}

RECOMMENDED NEXT STEPS:
${document.recommendedNextSteps.map((step, index) => `${index + 1}. ${step}`).join('\n')}

---
Generated by Ohara Patent AI Assistant
${new Date().toLocaleString()}
  `.trim();
}

function generateHTMLPatentDocument(document: PatentDocument, blockchainRecord?: BlockchainPatentRecord): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Patent: ${document.idea.title}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
    .header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
    .section { margin-bottom: 30px; }
    .section h2 { color: #333; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
    .claims li { margin-bottom: 10px; }
    .blockchain { background: #f0f8ff; padding: 15px; border-radius: 5px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${document.idea.title}</h1>
    <p><strong>Patent ID:</strong> ${document.id}</p>
    <p><strong>Inventor:</strong> ${document.idea.submitterName}</p>
    <p><strong>Filed:</strong> ${document.createdAt.toLocaleString()}</p>
    ${blockchainRecord ? `<p><strong>Blockchain Recorded:</strong> ${new Date(blockchainRecord.timestamp).toLocaleString()}</p>` : ''}
  </div>

  <div class="section">
    <h2>Abstract</h2>
    <pre>${document.abstract}</pre>
  </div>

  <div class="section">
    <h2>Patent Claims (${document.patentClaims.length})</h2>
    <ol class="claims">
      ${document.patentClaims.map(claim => `<li>${claim}</li>`).join('')}
    </ol>
  </div>

  <div class="section">
    <h2>Detailed Description</h2>
    <pre>${document.detailedDescription}</pre>
  </div>

  <div class="section">
    <h2>Patentability Analysis</h2>
    <pre>${document.patentabilityAnalysis}</pre>
  </div>

  ${blockchainRecord ? `
  <div class="section blockchain">
    <h2>Blockchain Verification</h2>
    <p><strong>Hash:</strong> ${blockchainRecord.hash}</p>
    <p><strong>Transaction:</strong> ${blockchainRecord.transactionHash}</p>
    <p><strong>Block:</strong> #${blockchainRecord.blockNumber}</p>
  </div>
  ` : ''}

  <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #ccc; text-align: center; color: #666;">
    Generated by Ohara Patent AI Assistant • ${new Date().toLocaleString()}
  </div>
</body>
</html>
  `;
}
