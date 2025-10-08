'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { Client, type Signer } from '@xmtp/browser-sdk';

interface XMTPContextType {
  client: Client | null;
  isLoading: boolean;
  error: string | null;
  walletAddress: string;
  initClient: (signer: Signer, env: 'dev' | 'production' | 'local') => Promise<void>;
  disconnect: () => void;
}

const XMTPContext = createContext<XMTPContextType>({
  client: null,
  isLoading: false,
  error: null,
  walletAddress: '',
  initClient: async () => {},
  disconnect: () => {},
});

export function XMTPProvider({ children }: { children: ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const initClient = async (signer: Signer, env: 'dev' | 'production' | 'local') => {
    if (client) return;
    setIsLoading(true);
    setError(null);
    
    try {
      const identifier = await signer.getIdentifier();
      const address = identifier.identifierKind === 'Ethereum' 
        ? identifier.identifier 
        : undefined;
      
      setWalletAddress(address || '');
      const encryptionKey = window.crypto.getRandomValues(new Uint8Array(32));

      const clientOptions = {
        env,
        dbEncryptionKey: encryptionKey,
      };

      const xmtpClient = await Client.create(signer, clientOptions);
      setClient(xmtpClient);
    } catch (err) {
      console.error('Error initializing XMTP client:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize XMTP client');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = useCallback(async () => {
    if (client) {
      await client.close();
      setClient(null);
      setWalletAddress('');
      setError(null);
    }
  }, [client]);

  return (
    <XMTPContext.Provider
      value={{
        client,
        isLoading,
        error,
        walletAddress,
        initClient,
        disconnect,
      }}
    >
      {children}
    </XMTPContext.Provider>
  );
}

export function useXMTPClient() {
  const context = useContext(XMTPContext);
  if (!context) {
    throw new Error('useXMTPClient must be used within an XMTPProvider');
  }
  return context;
}
