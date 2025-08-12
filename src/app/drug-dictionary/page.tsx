
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSettings } from '@/hooks/use-settings';
import { getDrugInformation } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Loader2, Search, Pill, AlertTriangle, ShieldCheck, Beaker, CircleDollarSign, Info, FlaskConical, Stethoscope } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AudioPlayer } from '@/components/audio-player';

const searchSchema = z.object({
  drugName: z.string().min(1, 'Please enter a drug name to search.'),
});
type FormData = z.infer<typeof searchSchema>;

type DrugInfo = {
  genericName: string;
  overview: string;
  dosageAndAdministration: string;
  sideEffects: string;
  pharmacology: string;
  priceInBangladesh: string;
};

export default function DrugDictionaryPage() {
  const { t } = useSettings();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DrugInfo | null>(null);
  const [searchedDrug, setSearchedDrug] = useState('');

  const form = useForm<FormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: { drugName: '' },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setResult(null);
    setSearchedDrug(data.drugName);
    try {
      const response = await getDrugInformation(data.drugName);
      if (response.error || !response.info) {
        toast({ variant: 'destructive', title: 'Error', description: response.error || 'Failed to retrieve drug information.' });
        setResult(null);
      } else {
        setResult(response.info);
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'An unexpected error occurred.' });
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getFullReportText = () => {
    if (!result) return '';
    return `
      Drug: ${searchedDrug}.
      Generic Name: ${result.genericName}.
      Overview: ${result.overview}.
      Dosage: ${result.dosageAndAdministration}.
      Side Effects: ${result.sideEffects}.
      Pharmacology: ${result.pharmacology}.
      Price: ${result.priceInBangladesh}.
      Disclaimer: ${t('importantDisclaimer')}
    `;
  };

  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-primary">{t('drugDictionary')}</CardTitle>
          <CardDescription>{t('drugDictionaryDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-4">
              <FormField
                control={form.control}
                name="drugName"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormControl>
                      <Input placeholder={t('drugDictionaryPlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                {t('search')}
              </Button>
            </form>
          </Form>

          {result && (
            <div className="mt-8 space-y-6">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="text-2xl font-headline text-accent capitalize">{searchedDrug}</CardTitle>
                                <CardDescription className="text-lg font-semibold">{t('genericName')}: {result.genericName}</CardDescription>
                            </div>
                            <AudioPlayer textToPlay={getFullReportText()} />
                        </div>
                    </CardHeader>
                </Card>

              <Card>
                <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                  <Info className="h-6 w-6 text-primary" />
                  <CardTitle className="text-lg font-headline">{t('drugOverview')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{result.overview}</p>
                </CardContent>
              </Card>

               <Card>
                <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                  <Pill className="h-6 w-6 text-green-600" />
                  <CardTitle className="text-lg font-headline">{t('drugDosage')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{result.dosageAndAdministration}</p>
                </CardContent>
              </Card>
              
               <Card>
                <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                  <FlaskConical className="h-6 w-6 text-blue-500" />
                  <CardTitle className="text-lg font-headline">{t('drugPharmacology')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{result.pharmacology}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                  <CardTitle className="text-lg font-headline">{t('drugSideEffects')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{result.sideEffects}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                  <CircleDollarSign className="h-6 w-6 text-yellow-500" />
                  <CardTitle className="text-lg font-headline">{t('drugPrice')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{result.priceInBangladesh}</p>
                </CardContent>
              </Card>

              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{t('importantDisclaimerTitle')}</AlertTitle>
                <AlertDescription>
                  {t('importantDisclaimer')}
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
