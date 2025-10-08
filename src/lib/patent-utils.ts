import type { PatentIdea, PatentDocument, PriorArtResult } from '@/types/patent';
import { v4 as uuidv4 } from 'uuid';

export const PATENT_PROCESSING_FEE = {
  ETH: '0.001', // 0.001 ETH (~$2-3)
  USDC: '5.00'   // $5 USDC
};

export const PATENT_OFFICE_WALLET = '0x742d35Cc7BB7fb6d3d4b9C1e4b8bF2b2a8f8B8a8';

export function generatePatentId(): string {
  return `PAT-${Date.now()}-${uuidv4().slice(0, 8).toUpperCase()}`;
}

export function calculatePatentabilityScore(priorArtResults: PriorArtResult[]): number {
  if (priorArtResults.length === 0) return 85; // High novelty if no prior art found
  
  const averageRelevance = priorArtResults.reduce((acc, result) => acc + result.relevanceScore, 0) / priorArtResults.length;
  const highSimilarityCount = priorArtResults.filter(result => result.similarity === 'high').length;
  
  let score = 100 - averageRelevance;
  score -= highSimilarityCount * 15; // Penalize high similarity findings
  
  return Math.max(Math.min(score, 100), 0);
}

export function generatePatentClaims(idea: PatentIdea): string[] {
  const claims: string[] = [];
  
  // Independent claim 1
  claims.push(`1. A method for ${idea.problemSolved.toLowerCase()}, comprising: ${idea.solution}`);
  
  // Dependent claims
  claims.push(`2. The method of claim 1, wherein the technical field relates to ${idea.technicalField.toLowerCase()}.`);
  claims.push(`3. The method of claim 1, providing the advantage of ${idea.advantages.toLowerCase()}.`);
  claims.push(`4. The method of claim 1, further comprising additional implementations as described in the detailed description.`);
  
  return claims;
}

export function generatePatentAbstract(idea: PatentIdea, priorArtResults: PriorArtResult[]): string {
  const noveltyStatement = priorArtResults.length === 0 
    ? "This invention presents a novel approach with no direct prior art identified."
    : `This invention addresses limitations found in ${priorArtResults.length} related prior art references.`;
  
  return `ABSTRACT

${idea.title}

This patent application discloses ${idea.description} in the field of ${idea.technicalField}. The invention solves the problem of ${idea.problemSolved} through ${idea.solution}. ${noveltyStatement} The primary advantages include ${idea.advantages}. This application provides detailed claims, technical specifications, and implementation guidance for the disclosed invention.`;
}

export function generateDetailedDescription(idea: PatentIdea): string {
  return `DETAILED DESCRIPTION

Field of the Invention:
This invention relates to ${idea.technicalField}, and more particularly to methods and systems for ${idea.problemSolved.toLowerCase()}.

Background of the Invention:
The technical field of ${idea.technicalField} has long faced challenges related to ${idea.problemSolved}. Current solutions have limitations that this invention addresses through innovative approaches.

Summary of the Invention:
${idea.description}

The present invention provides ${idea.solution}, resulting in significant advantages including ${idea.advantages}.

Detailed Description of Preferred Embodiments:
The invention can be implemented through various embodiments, each providing the core benefits described. The technical implementation involves systematic approaches that ensure reliability and effectiveness.

Technical Specifications:
- Primary Function: ${idea.problemSolved}
- Technical Domain: ${idea.technicalField}
- Key Innovation: ${idea.solution}
- Primary Benefits: ${idea.advantages}

Implementation Examples:
Various implementations are possible within the scope of this invention, each maintaining the core innovative principles while adapting to specific use cases and requirements.`;
}

export function generateInventorshipStatement(idea: PatentIdea): string {
  return `INVENTORSHIP STATEMENT

The undersigned declares that they are the sole inventor of the subject matter disclosed in this patent application. The invention titled "${idea.title}" was conceived and developed by ${idea.submitterName}.

Inventor Information:
Name: ${idea.submitterName}
Email: ${idea.submitterEmail}
Date of Conception: ${idea.createdAt.toDateString()}

Declaration:
I hereby declare that I believe myself to be the original inventor of the subject matter disclosed and claimed in this application. I acknowledge that willful false statements are punishable by fine or imprisonment under applicable laws.

Digital Signature: ${idea.submitterName}
Date: ${new Date().toDateString()}`;
}

export function generatePatentabilityAnalysis(
  idea: PatentIdea,
  priorArtResults: PriorArtResult[],
  patentabilityScore: number
): string {
  const noveltyAssessment = patentabilityScore > 70 ? 'HIGH' : patentabilityScore > 40 ? 'MODERATE' : 'LOW';
  
  return `PATENTABILITY ANALYSIS

Overall Patentability Score: ${patentabilityScore}/100
Novelty Assessment: ${noveltyAssessment}

Prior Art Analysis:
${priorArtResults.length} prior art references were identified and analyzed for relevance and similarity.

${priorArtResults.map((result, index) => `
Reference ${index + 1}: ${result.title}
- Relevance Score: ${result.relevanceScore}/100
- Similarity Level: ${result.similarity.toUpperCase()}
- Publication: ${result.publicationDate || 'Unknown'}
- Analysis: ${result.summary}
`).join('')}

Patentability Assessment:
${noveltyAssessment === 'HIGH' 
  ? 'This invention demonstrates high novelty and non-obviousness. The prior art search revealed limited directly relevant references, suggesting strong patentability.'
  : noveltyAssessment === 'MODERATE'
  ? 'This invention shows moderate patentability. Some related prior art exists, but distinguishing features may support patent claims.'
  : 'This invention faces patentability challenges due to closely related prior art. Consider refining the claims to emphasize novel aspects.'
}

Recommendation:
${noveltyAssessment === 'HIGH' 
  ? 'Proceed with patent filing. Strong likelihood of successful examination.'
  : noveltyAssessment === 'MODERATE'
  ? 'Consider claim refinement to emphasize distinguishing features before filing.'
  : 'Recommend significant claim modification or consideration of alternative IP protection strategies.'
}`;
}

export function generateRecommendedNextSteps(patentabilityScore: number): string[] {
  const steps: string[] = [];
  
  if (patentabilityScore > 70) {
    steps.push('✅ Patent shows high patentability - proceed with formal filing');
    steps.push('📋 Prepare formal patent application with USPTO');
    steps.push('🔍 Conduct professional prior art search for confirmation');
    steps.push('⚖️ Consider filing provisional patent application for early priority date');
  } else if (patentabilityScore > 40) {
    steps.push('⚠️ Moderate patentability - refine claims before filing');
    steps.push('🔄 Modify invention claims to emphasize novel aspects');
    steps.push('🔍 Conduct additional prior art research');
    steps.push('💼 Consult with patent attorney for claim strategy');
  } else {
    steps.push('🚨 Low patentability - significant modifications needed');
    steps.push('🔄 Major revision of invention concept required');
    steps.push('🔍 Extensive prior art analysis and claim differentiation');
    steps.push('💼 Mandatory consultation with patent professional');
    steps.push('🤔 Consider alternative IP protection strategies');
  }
  
  steps.push('💾 Document saved to blockchain for permanent record');
  steps.push('🖨️ Patent documentation available for download and printing');
  
  return steps;
}

export function formatCurrency(amount: string, currency: 'ETH' | 'USDC'): string {
  return `${amount} ${currency}`;
}

export function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function shortenAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function getBlockchainExplorerUrl(transactionHash: string): string {
  return `https://basescan.org/tx/${transactionHash}`;
}
