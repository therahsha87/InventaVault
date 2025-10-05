'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Search, 
  Shield, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Users,
  DollarSign,
  Eye,
  Plus,
  Filter
} from 'lucide-react';
import type { PatentDocument } from '@/types/patent';

interface PatentPortfolioEntry {
  id: string;
  patentDocument: PatentDocument;
  collaborators: string[];
  marketValue: number;
  status: 'draft' | 'research' | 'generation' | 'blockchain' | 'published';
  priority: 'high' | 'medium' | 'low';
  dateCreated: Date;
  lastActivity: Date;
}

interface PatentAnalytics {
  totalPatents: number;
  publishedPatents: number;
  totalValue: number;
  collaborators: number;
  averageCompletionTime: number;
  successRate: number;
}

export function PatentPortfolioDashboard() {
  const [portfolio, setPortfolio] = useState<PatentPortfolioEntry[]>([]);
  const [analytics, setAnalytics] = useState<PatentAnalytics>({
    totalPatents: 0,
    publishedPatents: 0,
    totalValue: 0,
    collaborators: 0,
    averageCompletionTime: 0,
    successRate: 0,
  });
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading portfolio data
    const loadPortfolioData = async () => {
      setIsLoading(true);
      
      // Mock data - in real app, this would come from SpacetimeDB
      const mockPortfolio: PatentPortfolioEntry[] = [
        {
          id: '1',
          patentDocument: {
            id: '1',
            idea: {
              title: 'AI-Powered Smart Contract Optimizer',
              description: 'Revolutionary system for optimizing smart contracts using machine learning',
              technicalField: 'Blockchain Technology',
              problemSolved: 'Gas optimization and security vulnerabilities',
              solution: 'ML algorithms that analyze and optimize contract code',
              advantages: 'Reduces gas costs by 40% and improves security',
              submitterName: 'Alice Johnson',
              submitterEmail: 'alice@example.com',
              createdAt: new Date('2024-01-15'),
            },
            priorArtResults: [],
            patentClaims: [],
            abstract: '',
            detailedDescription: '',
            drawingsDescription: '',
            inventorshipStatement: '',
            patentabilityAnalysis: '',
            recommendedNextSteps: [],
            createdAt: new Date('2024-01-15'),
            status: 'blockchain_recorded',
          },
          collaborators: ['alice@example.com', 'bob@example.com'],
          marketValue: 150000,
          status: 'published',
          priority: 'high',
          dateCreated: new Date('2024-01-15'),
          lastActivity: new Date('2024-01-20'),
        },
        {
          id: '2',
          patentDocument: {
            id: '2',
            idea: {
              title: 'Quantum-Resistant Encryption Module',
              description: 'Novel encryption method resistant to quantum computing attacks',
              technicalField: 'Cryptography',
              problemSolved: 'Vulnerability to quantum computing attacks',
              solution: 'Hybrid encryption using lattice-based cryptography',
              advantages: 'Future-proof security against quantum computers',
              submitterName: 'Carol Smith',
              submitterEmail: 'carol@example.com',
              createdAt: new Date('2024-02-01'),
            },
            priorArtResults: [],
            patentClaims: [],
            abstract: '',
            detailedDescription: '',
            drawingsDescription: '',
            inventorshipStatement: '',
            patentabilityAnalysis: '',
            recommendedNextSteps: [],
            createdAt: new Date('2024-02-01'),
            status: 'generating',
          },
          collaborators: ['carol@example.com'],
          marketValue: 200000,
          status: 'generation',
          priority: 'high',
          dateCreated: new Date('2024-02-01'),
          lastActivity: new Date('2024-02-10'),
        },
        {
          id: '3',
          patentDocument: {
            id: '3',
            idea: {
              title: 'Decentralized Identity Verification',
              description: 'Blockchain-based identity system for Web3 applications',
              technicalField: 'Identity Management',
              problemSolved: 'Centralized identity verification bottlenecks',
              solution: 'Distributed identity verification using zero-knowledge proofs',
              advantages: 'Privacy-preserving and scalable identity management',
              submitterName: 'David Lee',
              submitterEmail: 'david@example.com',
              createdAt: new Date('2024-02-15'),
            },
            priorArtResults: [],
            patentClaims: [],
            abstract: '',
            detailedDescription: '',
            drawingsDescription: '',
            inventorshipStatement: '',
            patentabilityAnalysis: '',
            recommendedNextSteps: [],
            createdAt: new Date('2024-02-15'),
            status: 'researching',
          },
          collaborators: ['david@example.com', 'eve@example.com', 'frank@example.com'],
          marketValue: 120000,
          status: 'research',
          priority: 'medium',
          dateCreated: new Date('2024-02-15'),
          lastActivity: new Date('2024-02-25'),
        },
      ];

      setPortfolio(mockPortfolio);
      
      // Calculate analytics
      const totalPatents = mockPortfolio.length;
      const publishedPatents = mockPortfolio.filter(p => p.status === 'published').length;
      const totalValue = mockPortfolio.reduce((sum, p) => sum + p.marketValue, 0);
      const allCollaborators = new Set(mockPortfolio.flatMap(p => p.collaborators));
      
      setAnalytics({
        totalPatents,
        publishedPatents,
        totalValue,
        collaborators: allCollaborators.size,
        averageCompletionTime: 14, // days
        successRate: (publishedPatents / totalPatents) * 100,
      });
      
      setIsLoading(false);
    };

    loadPortfolioData();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Clock className="h-4 w-4" />;
      case 'research': return <Search className="h-4 w-4" />;
      case 'generation': return <FileText className="h-4 w-4" />;
      case 'blockchain': return <Shield className="h-4 w-4" />;
      case 'published': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'research': return 'bg-purple-100 text-purple-800';
      case 'generation': return 'bg-blue-100 text-blue-800';
      case 'blockchain': return 'bg-orange-100 text-orange-800';
      case 'published': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredPortfolio = portfolio.filter(entry => {
    if (selectedFilter === 'all') return true;
    return entry.status === selectedFilter;
  });

  const getProgressPercentage = (status: string) => {
    switch (status) {
      case 'draft': return 10;
      case 'research': return 30;
      case 'generation': return 60;
      case 'blockchain': return 90;
      case 'published': return 100;
      default: return 0;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your patent portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <FileText className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Patents</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalPatents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Published</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.publishedPatents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Portfolio Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${analytics.totalValue.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Collaborators</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.collaborators}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="portfolio" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="portfolio">Patent Portfolio</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio" className="space-y-6">
          {/* Filter Controls */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Filter className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Filter by status:</span>
                  <div className="flex space-x-2">
                    {['all', 'draft', 'research', 'generation', 'blockchain', 'published'].map((filter) => (
                      <Button
                        key={filter}
                        variant={selectedFilter === filter ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedFilter(filter)}
                        className="capitalize"
                      >
                        {filter}
                      </Button>
                    ))}
                  </div>
                </div>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Patent
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Patent Portfolio Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredPortfolio.map((entry) => (
              <Card key={entry.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">
                        {entry.patentDocument.idea.title}
                      </CardTitle>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {entry.patentDocument.idea.description}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <Badge className={getPriorityColor(entry.priority)}>
                        {entry.priority}
                      </Badge>
                      <Badge className={getStatusColor(entry.status)}>
                        {getStatusIcon(entry.status)}
                        <span className="ml-2 capitalize">{entry.status}</span>
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{getProgressPercentage(entry.status)}%</span>
                    </div>
                    <Progress value={getProgressPercentage(entry.status)} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-600">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{entry.collaborators.length} collaborator{entry.collaborators.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <DollarSign className="h-4 w-4 mr-1" />
                      <span>${entry.marketValue.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Created {entry.dateCreated.toLocaleDateString()}</span>
                    <span>Updated {entry.lastActivity.toLocaleDateString()}</span>
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button size="sm" className="flex-1">
                      Continue
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPortfolio.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No patents found</h3>
                <p className="text-gray-600 mb-4">
                  {selectedFilter === 'all' 
                    ? "You haven't created any patents yet." 
                    : `No patents with status "${selectedFilter}" found.`}
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Patent
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Success Rate</span>
                  <span className="font-bold">{analytics.successRate.toFixed(1)}%</span>
                </div>
                <Progress value={analytics.successRate} className="h-2" />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg. Completion Time</span>
                  <span className="font-bold">{analytics.averageCompletionTime} days</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Collaborations</span>
                  <span className="font-bold">{portfolio.filter(p => p.collaborators.length > 1).length}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Financial Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Portfolio Value</span>
                  <span className="font-bold">${analytics.totalValue.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average Patent Value</span>
                  <span className="font-bold">
                    ${Math.round(analytics.totalValue / analytics.totalPatents).toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Blockchain Fees Paid</span>
                  <span className="font-bold">${(analytics.publishedPatents * 5).toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="collaboration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Collaboration Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Real-time Collaboration Coming Soon
                </h3>
                <p className="text-gray-600 mb-4">
                  Connect with other inventors and collaborate on patents in real-time using XMTP messaging.
                </p>
                <Button variant="outline">
                  Learn More About Collaboration
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}