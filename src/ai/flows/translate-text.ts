
'use server';
/**
 * @fileOverview This file defines a Genkit flow for translating text to Bengali.
 *
 * - translateToBengali - A function that takes English text and returns the Bengali translation.
 * - TranslateInput - The input type for the translateToBengali function.
 * - TranslateOutput - The return type for the translateToBengali function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateInputSchema = z.object({
  text: z.string().describe('The English text to translate.'),
});
export type TranslateInput = z.infer<typeof TranslateInputSchema>;

const TranslateOutputSchema = z.object({
  translatedText: z.string().describe('The translated Bengali text.'),
});
export type TranslateOutput = z.infer<typeof TranslateOutputSchema>;

export async function translateToBengali(input: TranslateInput): Promise<TranslateOutput> {
  return translateFlow(input);
}

const prompt = ai.definePrompt({
  name: 'translatePrompt',
  input: {schema: TranslateInputSchema},
  output: {schema: TranslateOutputSchema},
  prompt: `Translate the following English text to Bengali. Provide only the translated text.

English Text:
"{{{text}}}"

Bengali Translation:`,
});

const translateFlow = ai.defineFlow(
  {
    name: 'translateFlow',
    inputSchema: TranslateInputSchema,
    outputSchema: TranslateOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
