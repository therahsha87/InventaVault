'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  MessageCircle,
  Users,
  Send,
  Plus,
  Settings,
  Clock,
  CheckCircle2,
  AlertCircle,
  Zap,
  UserPlus,
  FileText,
  Search,
  Shield,
  Globe
} from 'lucide-react';
import { useXMTPClient } from '@/providers/XMTPProvider';
import { createWalletClient, custom } from 'viem';
import { mainnet } from 'viem/chains';
import { toBytes } from 'viem';
import type { Signer, Dm, Group } from '@xmtp/browser-sdk';

interface CollaborationMessage {
  id: string;
  content: string;
  sender: string;
  timestamp: Date;
  type: 'message' | 'system' | 'patent_update';
  metadata?: {
    patentId?: string;
    stage?: string;
    action?: string;
  };
}

interface Collaborator {
  address: string;
  name?: string;
  role: 'inventor' | 'researcher' | 'legal' | 'investor';
  joinedAt: Date;
  lastSeen: Date;
  isOnline: boolean;
}

interface PatentCollaboration {
  id: string;
  patentTitle: string;
  collaborators: Collaborator[];
  messages: CollaborationMessage[];
  stage: 'ideation' | 'research' | 'documentation' | 'filing';
  lastActivity: Date;
}

export function CollaborationHub() {
  const { client, initClient, isLoading, error } = useXMTPClient();
  const [conversations, setConversations] = useState<(Dm | Group)[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Dm | Group | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [newCollaboratorAddress, setNewCollaboratorAddress] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [collaborations, setCollaborations] = useState<PatentCollaboration[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock data for collaborations
  useEffect(() => {
    const mockCollaborations: PatentCollaboration[] = [
      {
        id: '1',
        patentTitle: 'AI-Powered Smart Contract Optimizer',
        collaborators: [
          {
            address: '0x1234...5678',
            name: 'Alice Johnson',
            role: 'inventor',
            joinedAt: new Date('2024-01-15'),
            lastSeen: new Date(),
            isOnline: true,
          },
          {
            address: '0x2345...6789',
            name: 'Bob Smith',
            role: 'researcher',
            joinedAt: new Date('2024-01-16'),
            lastSeen: new Date(Date.now() - 300000),
            isOnline: false,
          }
        ],
        messages: [
          {
            id: '1',
            content: 'I think we should focus on the gas optimization aspect for our patent claims.',
            sender: '0x1234...5678',
            timestamp: new Date(Date.now() - 3600000),
            type: 'message',
          },
          {
            id: '2',
            content: 'Patent research stage completed',
            sender: 'system',
            timestamp: new Date(Date.now() - 1800000),
            type: 'system',
            metadata: { stage: 'research', action: 'completed' }
          },
          {
            id: '3',
            content: 'Agreed! I found some interesting prior art that we should review.',
            sender: '0x2345...6789',
            timestamp: new Date(Date.now() - 1200000),
            type: 'message',
          }
        ],
        stage: 'research',
        lastActivity: new Date(Date.now() - 1200000),
      }
    ];
    setCollaborations(mockCollaborations);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('MetaMask not detected');
      }

      const walletClient = createWalletClient({
        chain: mainnet,
        transport: custom(window.ethereum),
      });

      const accounts = await walletClient.request({
        method: 'eth_requestAccounts',
        params: [],
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts returned');
      }

      const accountAddress = accounts[0];

      const createSigner = (address: `0x${string}`, walletClient: any): Signer => {
        return {
          type: 'EOA',
          getIdentifier: () => ({
            identifier: address.toLowerCase(),
            identifierKind: 'Ethereum',
          }),
          signMessage: async (message: string) => {
            const signature = await walletClient.signMessage({
              account: address,
              message,
            });
            return toBytes(signature);
          },
        };
      };

      const xmtpSigner: Signer = createSigner(accountAddress, walletClient);
      await initClient(xmtpSigner, 'dev');
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const sendMessage = async () => {
    if (!selectedConversation || !newMessage.trim() || !client) return;

    try {
      const messageId = await selectedConversation.send(newMessage);
      await selectedConversation.sync();
      
      setNewMessage('');
      // Refresh messages
      const history = await selectedConversation.messages();
      setMessages(history);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const startNewCollaboration = async () => {
    if (!client || !newCollaboratorAddress.trim()) return;

    try {
      const identifier = {
        identifier: newCollaboratorAddress.toLowerCase(),
        identifierKind: 'Ethereum' as const,
      };

      const canMessage = await client.canMessage([identifier]);
      if (!canMessage.get(newCollaboratorAddress.toLowerCase())) {
        throw new Error('Recipient is not enabled for XMTP messages');
      }

      const inboxId = await client.findInboxIdByIdentifier(identifier);
      if (!inboxId) {
        throw new Error('No inbox ID found for address');
      }

      const conversation = await client.conversations.newDm(inboxId);
      await conversation.sync();
      
      setConversations(prev => [...prev, conversation]);
      setSelectedConversation(conversation);
      setNewCollaboratorAddress('');
      
      // Send welcome message
      await conversation.send('Welcome to our patent collaboration! Let\'s work together on this invention.');
    } catch (error) {
      console.error('Failed to start collaboration:', error);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'inventor': return <Zap className="h-4 w-4" />;
      case 'researcher': return <Search className="h-4 w-4" />;
      case 'legal': return <Shield className="h-4 w-4" />;
      case 'investor': return <Globe className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'inventor': return 'bg-purple-100 text-purple-800';
      case 'researcher': return 'bg-blue-100 text-blue-800';
      case 'legal': return 'bg-orange-100 text-orange-800';
      case 'investor': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'ideation': return <Zap className="h-4 w-4" />;
      case 'research': return <Search className="h-4 w-4" />;
      case 'documentation': return <FileText className="h-4 w-4" />;
      case 'filing': return <Shield className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (!client && !isConnecting) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageCircle className="h-6 w-6 mr-3" />
            Patent Collaboration Hub
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Connect to Start Collaborating</h3>
          <p className="text-gray-600 mb-6">
            Connect your wallet to enable real-time collaboration with other inventors using XMTP messaging.
          </p>
          <Button onClick={connectWallet} disabled={isConnecting} size="lg">
            {isConnecting ? (
              <>
                <Clock className="h-5 w-5 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <UserPlus className="h-5 w-5 mr-2" />
                Connect Wallet for XMTP
              </>
            )}
          </Button>
          {error && (
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  }

  if (isLoading || isConnecting) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Setting up collaboration environment...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <MessageCircle className="h-6 w-6 mr-3" />
              Patent Collaboration Hub
            </div>
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Connected
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Active Collaborations</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {collaborations.map((collab) => (
              <Card key={collab.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg mb-2">{collab.patentTitle}</CardTitle>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        {getStageIcon(collab.stage)}
                        <span className="capitalize">{collab.stage} Stage</span>
                      </div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">
                      {collab.collaborators.length} collaborators
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Team</h4>
                    <div className="flex -space-x-2">
                      {collab.collaborators.slice(0, 4).map((collaborator, index) => (
                        <Avatar key={index} className="border-2 border-white">
                          <AvatarFallback className={`text-xs ${getRoleColor(collaborator.role)}`}>
                            {collaborator.name?.charAt(0) || collaborator.address.slice(2, 4).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {collab.collaborators.length > 4 && (
                        <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs text-gray-600">
                          +{collab.collaborators.length - 4}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Activity</h4>
                    <div className="space-y-2">
                      {collab.messages.slice(-2).map((message) => (
                        <div key={message.id} className="text-xs text-gray-600">
                          {message.type === 'system' ? (
                            <div className="flex items-center space-x-1">
                              <Settings className="h-3 w-3" />
                              <span>{message.content}</span>
                            </div>
                          ) : (
                            <div>
                              <span className="font-medium">
                                {message.sender.slice(0, 6)}...
                              </span>
                              : {message.content.slice(0, 50)}...
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Chat
                    </Button>
                    <Button size="sm" className="flex-1">
                      <FileText className="h-4 w-4 mr-2" />
                      View Patent
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Start New Collaboration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4">
                <Input
                  placeholder="Enter collaborator's wallet address..."
                  value={newCollaboratorAddress}
                  onChange={(e) => setNewCollaboratorAddress(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={startNewCollaboration} disabled={!newCollaboratorAddress.trim()}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-96">
            {/* Conversations List */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Conversations</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {conversations.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <MessageCircle className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">No conversations yet</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {conversations.map((conv, index) => (
                      <div
                        key={index}
                        className={`p-4 cursor-pointer hover:bg-gray-50 border-l-4 ${
                          selectedConversation === conv 
                            ? 'border-indigo-500 bg-indigo-50' 
                            : 'border-transparent'
                        }`}
                        onClick={() => setSelectedConversation(conv)}
                      >
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarFallback>
                              {conv instanceof Group ? 'G' : 'D'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {conv instanceof Group ? `Group ${conv.id.slice(0, 8)}` : `DM ${conv.id.slice(0, 8)}`}
                            </p>
                            <p className="text-xs text-gray-500">Active collaboration</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Messages Area */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">
                  {selectedConversation ? 'Patent Discussion' : 'Select a conversation'}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col h-80">
                {selectedConversation ? (
                  <>
                    <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                      {messages.map((message, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-xs">
                              {message.senderInboxId?.slice(0, 2) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-sm">{message.content || JSON.stringify(message)}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(Number(message.sentAtNs) / 1000000).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        className="flex-1"
                      />
                      <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <MessageCircle className="h-12 w-12 mx-auto mb-4" />
                      <p>Select a conversation to start messaging</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collaborations.flatMap(c => c.collaborators).map((collaborator, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className={getRoleColor(collaborator.role)}>
                        {collaborator.name?.charAt(0) || collaborator.address.slice(2, 4).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-medium">
                        {collaborator.name || `${collaborator.address.slice(0, 6)}...${collaborator.address.slice(-4)}`}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={getRoleColor(collaborator.role)} variant="secondary">
                          {getRoleIcon(collaborator.role)}
                          <span className="ml-1 capitalize">{collaborator.role}</span>
                        </Badge>
                        <Badge variant="outline" className={collaborator.isOnline ? 'text-green-600' : 'text-gray-600'}>
                          {collaborator.isOnline ? 'Online' : 'Offline'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}