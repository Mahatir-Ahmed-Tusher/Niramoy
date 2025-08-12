
'use client';

import { SettingsProvider } from '@/contexts/settings-provider';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { ClerkProvider } from '@clerk/nextjs';
import { ConvexProviderWrapper } from './convex-provider';
import React from 'react';
import { AppLayout } from './app-layout';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <ConvexProviderWrapper>
        <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
          <SettingsProvider>
            <AppLayout>{children}</AppLayout>
          </SettingsProvider>
        </NextThemesProvider>
      </ConvexProviderWrapper>
    </ClerkProvider>
  );
}
