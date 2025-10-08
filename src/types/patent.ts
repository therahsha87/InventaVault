export interface PatentIdea {
  title: string;
  description: string;
  technicalField: string;
  problemSolved: string;
  solution: string;
  advantages: string;
  submitterName: string;
  submitterEmail: string;
  createdAt: Date;
}

export interface PriorArtResult {
  title: string;
  url: string;
  summary: string;
  relevanceScore: number;
  publicationDate?: string;
  patentNumber?: string;
  similarity: 'low' | 'medium' | 'high';
}

export interface PatentDocument {
  id: string;
  idea: PatentIdea;
  priorArtResults: PriorArtResult[];
  patentClaims: string[];
  abstract: string;
  detailedDescription: string;
  drawingsDescription: string;
  inventorshipStatement: string;
  patentabilityAnalysis: string;
  recommendedNextSteps: string[];
  blockchainHash?: string;
  transactionHash?: string;
  createdAt: Date;
  status: 'draft' | 'researching' | 'generating' | 'completed' | 'blockchain_recorded';
}

export interface PatentProcessingStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  result?: any;
  error?: string;
}

export interface BlockchainPatentRecord {
  patentId: string;
  hash: string;
  timestamp: number;
  transactionHash: string;
  blockNumber: number;
  gasUsed: string;
  fee: string;
}

export interface PaymentDetails {
  amount: string;
  currency: 'ETH' | 'USDC';
  recipient: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  transactionHash?: string;
}
