
'use client';

import { Home, Info, Settings, HeartPulse, Search, BookOpen, Pill, FileText, MessageSquareQuote } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSettings } from '@/hooks/use-settings';
import { useIsMobile } from '@/hooks/use-mobile';
import { useUserSync } from '@/hooks/use-user-sync';
import Image from 'next/image';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { ThemeToggle } from './theme-toggle';
import { Toaster } from './ui/toaster';
import { UserProfile } from './user-profile';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useSettings();
  const isMobile = useIsMobile();
  
  // Sync user data with Convex
  useUserSync();

  const navItems = [
    { href: '/', label: t('home'), icon: Home },
    { href: '/health-ai', label: t('healthAssistantAI'), shortLabel: t('healthAssistantAIShort'), icon: HeartPulse },
    { href: '/general-inquiry', label: t('generalInquiryTitle'), shortLabel: t('generalInquiryTitleShort'), icon: MessageSquareQuote },
    { href: '/report-analyzer', label: t('reportAnalyzerTitle'), shortLabel: t('reportAnalyzerTitleShort'), icon: FileText },
    { href: '/find-doctor', label: t('findDoctor'), icon: Search },
    { href: '/drug-dictionary', label: t('drugDictionary'), icon: Pill },
    { href: '/dictionary', label: t('medicalDictionary'), icon: BookOpen },
    { href: '/about', label: t('about'), icon: Info },
    { href: '/settings', label: t('settings'), icon: Settings },
  ];

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
            <Link href="/" className="flex items-center justify-center">
                <Image
                  src="/niramoy-logo.png"
                  alt="নিরাময় লোগো"
                  width={160}
                  height={160}
                  className="rounded-lg"
                />
            </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => {
              const label = isMobile && item.shortLabel ? item.shortLabel : item.label;
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={{ children: item.label, side: 'right' }}
                  >
                    <a href={item.href}>
                      <item.icon />
                      <span className="font-headline">{label}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col h-full">
            <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/80 p-2 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                  <SidebarTrigger className="md:hidden" />
                  <Link href="/" className="flex items-center">
                      <Image
                        src="/niramoy-logo.png"
                        alt="নিরাময় লোগো"
                        width={148}
                        height={148}
                        className="rounded-lg"
                      />
                  </Link>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <UserProfile />
              </div>
            </header>
            <div className="flex-grow overflow-y-auto">
                {children}
            </div>
        </div>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  );
}
