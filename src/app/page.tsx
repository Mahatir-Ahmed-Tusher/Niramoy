
'use client';

import { useSettings } from '@/hooks/use-settings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HeartPulse, Search, BookOpen, Pill, FileText, Info, MessageSquareQuote } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import HealthAnimations from '@/components/health-animations';

const features = [
  {
    icon: HeartPulse,
    titleKey: 'healthAssistantAI',
    descriptionKey: 'healthAssistantAIDescription',
    href: '/health-ai',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    glowColor: 'shadow-red-500/20',
    borderColor: 'border-red-500/30',
    isSpecial: true,
  },
  {
    icon: MessageSquareQuote,
    titleKey: 'generalInquiryTitle',
    descriptionKey: 'generalInquiryDescriptionShort',
    href: '/general-inquiry',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    glowColor: 'shadow-purple-500/20',
    borderColor: 'border-purple-500/30',
  },
  {
    icon: FileText,
    titleKey: 'reportAnalyzerTitle',
    descriptionKey: 'reportAnalyzerDescriptionShort',
    href: '/report-analyzer',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    glowColor: 'shadow-blue-500/20',
    borderColor: 'border-blue-500/30',
  },
  {
    icon: Search,
    titleKey: 'findDoctor',
    descriptionKey: 'findDoctorDescriptionShort',
    href: '/find-doctor',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    glowColor: 'shadow-green-500/20',
    borderColor: 'border-green-500/30',
  },
  {
    icon: Pill,
    titleKey: 'drugDictionary',
    descriptionKey: 'drugDictionaryDescriptionShort',
    href: '/drug-dictionary',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    glowColor: 'shadow-yellow-500/20',
    borderColor: 'border-yellow-500/30',
  },
  {
    icon: BookOpen,
    titleKey: 'medicalDictionary',
    descriptionKey: 'dictionaryDescriptionShort',
    href: '/dictionary',
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500/10',
    glowColor: 'shadow-indigo-500/20',
    borderColor: 'border-indigo-500/30',
  },
  {
    icon: Info,
    titleKey: 'about',
    descriptionKey: 'aboutDescriptionShort',
    href: '/about',
    color: 'text-gray-500',
    bgColor: 'bg-gray-500/10',
    glowColor: 'shadow-gray-500/20',
    borderColor: 'border-gray-500/30',
  },
];

export default function LandingPage() {
  const { t } = useSettings();

  return (
    <div className="container mx-auto max-w-7xl p-4 md:p-8">
      <div className="relative overflow-hidden text-center mb-12 bg-primary text-primary-foreground p-8 md:p-12 rounded-2xl shadow-lg">
        <HealthAnimations />
        <div className="relative z-10 flex flex-col items-center">
          <div className="mb-6">
            <Image
              src="/niramoy-logo-landing-2.png"
              alt="নিরাময় লোগো"
              width={100}
              height={100}
              className="rounded-full shadow-lg"
            />
          </div>
          <p className="text-sm md:text-xl max-w-3xl mx-auto">
            {t('appSubtitle')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 md:gap-8">
        {features.map((feature) => (
          <Link href={feature.href} passHref key={feature.titleKey}>
            <Card
              className={`group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col shadow-lg ${feature.glowColor} border ${feature.borderColor} h-full ${feature.isSpecial ? 'animate-glow' : ''}`}
            >
              <CardHeader className="flex flex-col items-center text-center p-4">
                <div className={`p-3 rounded-full ${feature.bgColor} mb-2`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <CardTitle className="font-headline text-xs md:text-base leading-tight">{t(feature.titleKey as any)}</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-muted-foreground flex-grow p-4 pt-0">
                <p className="text-xs hidden md:block">{t(feature.descriptionKey as any)}</p>
              </CardContent>
              <div className="p-4 pt-0 mt-auto hidden md:block">
                  <Button className="w-full h-9 text-xs" variant="outline">
                    {t('goToFeature')}
                  </Button>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
