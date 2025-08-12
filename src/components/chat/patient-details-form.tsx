
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSettings } from '@/hooks/use-settings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Mic, Square } from 'lucide-react';
import { useSpeechToText } from '@/hooks/use-speech-to-text';
import { useEffect } from 'react';

interface PatientDetailsFormProps {
  onSubmit: (data: z.infer<typeof formSchema>) => void;
  isLoading: boolean;
}

const formSchema = z.object({
  patientName: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  patientGender: z.string({ required_error: 'Please select a gender.' }),
  patientAge: z.coerce.number().int().min(0, { message: 'Age cannot be negative.' }),
  symptoms: z.string().min(10, { message: 'Please describe the symptoms in at least 10 characters.' }),
});

export function PatientDetailsForm({ onSubmit, isLoading }: PatientDetailsFormProps) {
  const { t } = useSettings();
  const { transcript, isListening, startListening, stopListening } = useSpeechToText();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientName: '',
      patientAge: '' as any, // Use empty string to avoid uncontrolled component warning
      symptoms: '',
    },
  });
  
  useEffect(() => {
    if(isListening) {
      form.setValue('symptoms', transcript);
    }
  }, [transcript, isListening, form]);

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      form.setValue('symptoms', '');
      startListening();
    }
  };


  return (
    <Card className="w-full shadow-lg">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="font-headline text-primary">{t('healthAssistantAI')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="patientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('patientName')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('patientName')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="patientGender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('patientGender')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('patientGender')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="পুরুষ">{t('male')}</SelectItem>
                        <SelectItem value="মহিলা">{t('female')}</SelectItem>
                        <SelectItem value="অন্যান্য">{t('other')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="patientAge"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('patientAge')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={t('patientAge')}
                        {...field}
                        onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                        value={field.value === undefined ? '' : field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="symptoms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('symptoms')}</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={isListening ? t('listening') : t('symptoms')} 
                      {...field} 
                      rows={4}
                      onChange={(e) => {
                        field.onChange(e);
                        if(isListening) stopListening();
                      }}
                     />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
             <Button type="button" variant="outline" className="w-full" onClick={handleMicClick} disabled={isLoading}>
              {isListening ? (
                <>
                  <Square className="mr-2 h-4 w-4 text-destructive animate-pulse" />
                  {t('stopRecording')}
                </>
              ) : (
                <>
                  <Mic className="mr-2 h-4 w-4" />
                  {t('recordSymptoms')}
                </>
              )}
            </Button>
            <Button type="submit" disabled={isLoading || isListening} className="w-full">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('getFollowUp')}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
