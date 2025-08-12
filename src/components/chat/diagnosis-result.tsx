
'use client';

import React from 'react';
import { useSettings } from '@/hooks/use-settings';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { Stethoscope, Pill, TestTube2 } from 'lucide-react';
import { AudioPlayer } from '../audio-player';

export type Diagnosis = {
  probableDiagnosis: string;
  recommendedCareActions: string;
  suggestedDiagnosticTests: string;
};

interface DiagnosisResultProps {
  diagnosis: Diagnosis;
}

export const DiagnosisResult = React.forwardRef<HTMLDivElement, DiagnosisResultProps>(({ diagnosis }, ref) => {
  const { t } = useSettings();

  const getFullReportText = () => {
    return `
      ${t('probableDiagnosis')}: ${diagnosis.probableDiagnosis}.
      ${t('recommendedCare')}: ${diagnosis.recommendedCareActions}.
      ${t('suggestedTests')}: ${diagnosis.suggestedDiagnosticTests}.
    `;
  };

  return (
    <div ref={ref} className="bg-background p-4 rounded-lg">
      <div className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-3">
              <Stethoscope className="h-6 w-6 text-primary" />
              <CardTitle className="text-lg font-headline">{t('probableDiagnosis')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p>{diagnosis.probableDiagnosis}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
            <Pill className="h-6 w-6 text-primary" />
            <CardTitle className="text-lg font-headline">{t('recommendedCare')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{diagnosis.recommendedCareActions}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
            <TestTube2 className="h-6 w-6 text-primary" />
            <CardTitle className="text-lg font-headline">{t('suggestedTests')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{diagnosis.suggestedDiagnosticTests}</p>
          </CardContent>
        </Card>
        <CardFooter className="flex-col items-center gap-4">
           <AudioPlayer textToPlay={getFullReportText} />
           <p className="text-xs text-muted-foreground">Powered by Niramoy AI</p>
        </CardFooter>
      </div>
    </div>
  );
});

DiagnosisResult.displayName = "DiagnosisResult";
