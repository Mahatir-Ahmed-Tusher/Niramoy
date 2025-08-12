'use client';

import { useSettings } from '@/hooks/use-settings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AboutPage() {
  const { t } = useSettings();

  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-primary">{t('aboutTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-lg">
          <p>{t('aboutP1')}</p>
          <p>{t('aboutP2')}</p>
          <p className="font-semibold text-accent">{t('aboutP3')}</p>
        </CardContent>
      </Card>
    </div>
  );
}
