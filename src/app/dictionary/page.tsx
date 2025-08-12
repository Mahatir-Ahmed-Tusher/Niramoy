
'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSettings } from '@/hooks/use-settings';
import { getDictionaryEntry, DictionaryEntry } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Loader2, Search, Volume2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { AudioPlayer } from '@/components/audio-player';

const searchSchema = z.object({
  query: z.string().min(1, 'Please enter a word to search.'),
});
type FormData = z.infer<typeof searchSchema>;

export default function DictionaryPage() {
  const { t } = useSettings();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<DictionaryEntry[] | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  const form = useForm<FormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: { query: '' },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setResults(null);
    setSuggestions([]);
    try {
      const response = await getDictionaryEntry(data.query);
      if (response.error) {
        toast({ variant: 'destructive', title: 'Error', description: response.error });
      } else if (response.suggestions) {
        setSuggestions(response.suggestions);
        toast({ title: 'Not Found', description: "The word was not found. Here are some suggestions." });
      } else {
        setResults(response.results ?? null);
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'An unexpected error occurred.' });
    } finally {
      setIsLoading(false);
    }
  };

  const getTextToPlayForEntry = (entry: DictionaryEntry) => {
    const definitionText = entry.definitions.map((def, i) => `Definition ${i+1}: ${def}. Bengali: ${entry.bengaliDefinitions[i]}`).join('\n');
    return `${entry.word}. Part of speech: ${entry.partOfSpeech}. ${entry.pronunciation ? `Pronounced as: ${entry.pronunciation}.` : ''} ${definitionText}`;
  };


  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-primary">{t('medicalDictionary')}</CardTitle>
          <CardDescription>{t('dictionaryDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-4">
              <FormField
                control={form.control}
                name="query"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormControl>
                      <Input placeholder={t('dictionaryPlaceholder')} {...field} />
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

          <div className="mt-8 space-y-6">
            {results && results.map((entry, index) => (
              <Card key={index} className="shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-headline text-accent">{entry.word}</CardTitle>
                     <div className="flex items-center gap-2">
                        {entry.pronunciation && (
                             <span className="text-muted-foreground">{entry.pronunciation}</span>
                        )}
                        <AudioPlayer textToPlay={getTextToPlayForEntry(entry)} />
                    </div>
                  </div>
                   <CardDescription className="font-semibold italic">{entry.partOfSpeech}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="list-none space-y-4 p-0">
                    {entry.definitions.map((def, i) => (
                      <li key={i}>
                        <p className="font-sans text-base">{def}</p>
                        <p className="font-headline text-base text-primary/90 mt-1">{entry.bengaliDefinitions[i]}</p>
                        {i < entry.definitions.length - 1 && <Separator className="my-4"/>}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}

            {suggestions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('suggestions')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc space-y-2 pl-5">
                    {suggestions.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
