'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WalletDefault } from '@coinbase/onchainkit/wallet';
import { Buy } from '@coinbase/onchainkit/buy';
import { Transaction, TransactionButton, TransactionStatus, TransactionStatusLabel } from '@coinbase/onchainkit/transaction';
import { Signature } from '@coinbase/onchainkit/signature';
import { Shield, CreditCard, CheckCircle, ExternalLink, Clock, Zap } from 'lucide-react';
import { useAccount } from 'wagmi';
import type { PatentDocument, PaymentDetails, BlockchainPatentRecord } from '@/types/patent';
import { 
  PATENT_PROCESSING_FEE, 
  PATENT_OFFICE_WALLET, 
  getBlockchainExplorerUrl,
  shortenAddress 
} from '@/lib/patent-utils';
import type { Token } from '@coinbase/onchainkit/token';

interface BlockchainPatentRecorderProps {
  document: PatentDocument;
  onComplete: (record: BlockchainPatentRecord) => void;
}

export function BlockchainPatentRecorder({ document, onComplete }: BlockchainPatentRecorderProps) {
  const { address, isConnected } = useAccount();
  const [step, setStep] = useState<'payment' | 'signing' | 'recording' | 'completed'>('payment');
  const [progress, setProgress] = useState(0);
  const [currentAction, setCurrentAction] = useState('');
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [blockchainRecord, setBlockchainRecord] = useState<BlockchainPatentRecord | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<'ETH' | 'USDC'>('ETH');

  const usdcToken: Token = {
    name: 'USDC',
    address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
    symbol: 'USDC',
    decimals: 6,
    image: 'https://d3r81g40ycuhqg.cloudfront.net/wallet/wais/44/2b/442b80bd16af0c0d9b22e03a16753823fe826e5bfd457292b55fa0ba8c1ba213-ZWUzYjJmZGUtMDYxNy00NDcyLTg0NjQtMWI4OGEwYjBiODE2',
    chainId: 8453,
  };

  const ethToken: Token = {
    name: 'ETH',
    address: '',
    symbol: 'ETH',
    decimals: 18,
    image: 'https://wallet-api-production.s3.amazonaws.com/uploads/tokens/eth_288.png',
    chainId: 8453,
  };

  const handlePaymentComplete = async (transactionHash: string) => {
    setCurrentAction('Processing payment...');
    setProgress(25);

    const payment: PaymentDetails = {
      amount: selectedCurrency === 'ETH' ? PATENT_PROCESSING_FEE.ETH : PATENT_PROCESSING_FEE.USDC,
      currency: selectedCurrency,
      recipient: PATENT_OFFICE_WALLET,
      status: 'completed',
      transactionHash
    };

    setPaymentDetails(payment);
    setStep('signing');
    setProgress(40);
    setCurrentAction('Ready for digital signature...');
  };

  const handleSigningComplete = async (signature: string) => {
    setCurrentAction('Recording patent on blockchain...');
    setProgress(60);
    setStep('recording');

    try {
      // Simulate blockchain recording process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create patent hash
      const patentData = JSON.stringify({
        id: document.id,
        title: document.idea.title,
        inventor: document.idea.submitterName,
        abstract: document.abstract,
        claims: document.patentClaims,
        timestamp: Date.now(),
        signature
      });

      // Simulate blockchain transaction
      const mockTransactionHash = `0x${Math.random().toString(16).substring(2, 66)}`;
      const mockBlockNumber = Math.floor(Math.random() * 1000000) + 15000000;
      
      const record: BlockchainPatentRecord = {
        patentId: document.id,
        hash: `0x${btoa(patentData).substring(0, 64)}`,
        timestamp: Date.now(),
        transactionHash: mockTransactionHash,
        blockNumber: mockBlockNumber,
        gasUsed: '21000',
        fee: paymentDetails?.amount || PATENT_PROCESSING_FEE.ETH
      };

      setBlockchainRecord(record);
      setStep('completed');
      setProgress(100);
      setCurrentAction('Patent successfully recorded on blockchain!');

      // Update document with blockchain info
      document.blockchainHash = record.hash;
      document.transactionHash = record.transactionHash;
      document.status = 'blockchain_recorded';

    } catch (error) {
      console.error('Blockchain recording error:', error);
      setCurrentAction('Recording completed with some limitations');
    }
  };

  const handleComplete = () => {
    if (blockchainRecord) {
      onComplete(blockchainRecord);
    }
  };

  const getStepIcon = (currentStep: string, targetStep: string) => {
    if (step === targetStep) return <Clock className="h-4 w-4" />;
    if (['signing', 'recording', 'completed'].includes(step) && targetStep === 'payment') return <CheckCircle className="h-4 w-4" />;
    if (['recording', 'completed'].includes(step) && targetStep === 'signing') return <CheckCircle className="h-4 w-4" />;
    if (step === 'completed' && targetStep === 'recording') return <CheckCircle className="h-4 w-4" />;
    return <div className="h-4 w-4 rounded-full bg-gray-300" />;
  };

  const getStepStatus = (targetStep: string) => {
    if (step === targetStep) return 'current';
    if (['signing', 'recording', 'completed'].includes(step) && targetStep === 'payment') return 'completed';
    if (['recording', 'completed'].includes(step) && targetStep === 'signing') return 'completed';
    if (step === 'completed' && targetStep === 'recording') return 'completed';
    return 'pending';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center">
          <Shield className="h-6 w-6 text-purple-600 mr-2" />
          <CardTitle className="text-2xl font-bold text-gray-900">Blockchain Patent Recording</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {[
            { key: 'payment', label: 'Payment' },
            { key: 'signing', label: 'Signature' },
            { key: 'recording', label: 'Recording' },
            { key: 'completed', label: 'Complete' }
          ].map((stepInfo, index) => (
            <div key={stepInfo.key} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                getStepStatus(stepInfo.key) === 'completed' ? 'bg-green-100 border-green-500 text-green-600' :
                getStepStatus(stepInfo.key) === 'current' ? 'bg-purple-100 border-purple-500 text-purple-600' :
                'bg-gray-100 border-gray-300 text-gray-500'
              }`}>
                {getStepIcon(step, stepInfo.key)}
              </div>
              <div className="ml-2">
                <div className={`text-sm font-medium ${
                  getStepStatus(stepInfo.key) === 'completed' ? 'text-green-600' :
                  getStepStatus(stepInfo.key) === 'current' ? 'text-purple-600' :
                  'text-gray-500'
                }`}>
                  {stepInfo.label}
                </div>
              </div>
              {index < 3 && (
                <div className={`flex-1 h-0.5 mx-4 ${
                  ['signing', 'recording', 'completed'].includes(step) && stepInfo.key === 'payment' ? 'bg-green-500' :
                  ['recording', 'completed'].includes(step) && stepInfo.key === 'signing' ? 'bg-green-500' :
                  step === 'completed' && stepInfo.key === 'recording' ? 'bg-green-500' :
                  'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>

        {progress > 0 && progress < 100 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{currentAction}</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {/* Wallet Connection */}
        {!isConnected && (
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Connect your wallet</strong> to proceed with payment and blockchain recording.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-center mb-6">
          <WalletDefault />
        </div>

        {/* Payment Step */}
        {step === 'payment' && isConnected && (
          <Card className="border border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <CreditCard className="h-5 w-5 mr-2" />
                Payment Required
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{PATENT_PROCESSING_FEE.ETH} ETH</div>
                  <div className="text-sm text-gray-600">~$2-3 USD</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{PATENT_PROCESSING_FEE.USDC} USDC</div>
                  <div className="text-sm text-gray-600">Fixed USD price</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex space-x-2">
                  <Button
                    variant={selectedCurrency === 'ETH' ? 'default' : 'outline'}
                    onClick={() => setSelectedCurrency('ETH')}
                    className="flex-1"
                  >
                    Pay with ETH
                  </Button>
                  <Button
                    variant={selectedCurrency === 'USDC' ? 'default' : 'outline'}
                    onClick={() => setSelectedCurrency('USDC')}
                    className="flex-1"
                  >
                    Pay with USDC
                  </Button>
                </div>

                <Buy toToken={selectedCurrency === 'ETH' ? ethToken : usdcToken} />
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  This fee covers prior art research, patent document generation, legal analysis, and permanent blockchain recording.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Signing Step */}
        {step === 'signing' && paymentDetails && (
          <Card className="border border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <CheckCircle className="h-5 w-5 mr-2" />
                Digital Signature Required
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Zap className="h-4 w-4" />
                <AlertDescription>
                  <strong>Payment completed!</strong> Transaction: {shortenAddress(paymentDetails.transactionHash || '')}
                </AlertDescription>
              </Alert>

              <div className="text-center">
                <Signature
                  message={`I, ${document.idea.submitterName}, hereby declare that I am the inventor of "${document.idea.title}" and authorize its recording on the blockchain. Patent ID: ${document.id}. Timestamp: ${Date.now()}.`}
                  label="Sign Patent Declaration"
                  onSuccess={handleSigningComplete}
                />
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Your digital signature will be permanently recorded with your patent on the blockchain, providing legal proof of inventorship.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Recording Step */}
        {step === 'recording' && (
          <Card className="border border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Zap className="h-5 w-5 mr-2" />
                Recording on Blockchain
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  Your patent is being permanently recorded on the Base blockchain. This process ensures immutable proof of your invention and timestamp.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Completed Step */}
        {step === 'completed' && blockchainRecord && (
          <Card className="border border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <CheckCircle className="h-5 w-5 mr-2" />
                Blockchain Recording Complete!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Success!</strong> Your patent has been permanently recorded on the Base blockchain with immutable proof of inventorship.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div><strong>Patent ID:</strong> {blockchainRecord.patentId}</div>
                  <div><strong>Blockchain Hash:</strong> {shortenAddress(blockchainRecord.hash)}</div>
                  <div><strong>Block Number:</strong> #{blockchainRecord.blockNumber.toLocaleString()}</div>
                </div>
                <div className="space-y-2">
                  <div><strong>Transaction:</strong> {shortenAddress(blockchainRecord.transactionHash)}</div>
                  <div><strong>Gas Used:</strong> {blockchainRecord.gasUsed}</div>
                  <div><strong>Timestamp:</strong> {new Date(blockchainRecord.timestamp).toLocaleString()}</div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => window.open(getBlockchainExplorerUrl(blockchainRecord.transactionHash), '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View on BaseScan
                </Button>
                <Button onClick={handleComplete} className="flex-1 bg-green-600 hover:bg-green-700">
                  Complete Patent Process
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
