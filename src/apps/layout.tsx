import type { Metadata } from 'next'
import '@coinbase/onchainkit/styles.css';
import './globals.css';
import { Providers } from './providers';
import { ThemeProvider } from '@/lib/theme-provider';
import FarcasterWrapper from "@/components/FarcasterWrapper";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
        <html lang="en" suppressHydrationWarning>
          <body className="antialiased">
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
            >
              <Providers>
                <FarcasterWrapper>
                  {children}
                </FarcasterWrapper>
              </Providers>
            </ThemeProvider>
          </body>
        </html>
      );
}

export const metadata: Metadata = {
        title: "InventaVault - AI Patent Protection Platform",
        description: "Transform your ideas into secured patents with InventaVault. AI-powered prior art research, real-time collaboration, and blockchain recording on Base. Professional patent protection made simple.",
        other: { "fc:frame": JSON.stringify({"version":"next","imageUrl":"https://usdozf7pplhxfvrl.public.blob.vercel-storage.com/thumbnail_c0eecb69-2e90-4f7a-823c-e689b4e4590d-QE4tEIliaLLCuuyxO75rlLq2zFTHz9","button":{"title":"Open with Ohara","action":{"type":"launch_frame","name":"InventaVault","url":"https://neighborhood-serious-256.app.ohara.ai","splashImageUrl":"https://usdozf7pplhxfvrl.public.blob.vercel-storage.com/farcaster/splash_images/splash_image1.svg","splashBackgroundColor":"#ffffff"}}}
        ) }
    };
