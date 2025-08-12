'use server';
/**
 * @fileOverview A Genkit flow to find a medical specialist based on symptoms and location.
 *
 * - findSpecialist - A function that takes symptoms and location and returns a report with specialist recommendations.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { searchSerpApi, SerpApiResult } from '@/services/serpapi';
import { FindSpecialistInputSchema } from '@/lib/schemas';

export type FindSpecialistInput = z.infer<typeof FindSpecialistInputSchema>;

const FindSpecialistOutputSchema = z.object({
  report: z.string(),
});
export type FindSpecialistOutput = z.infer<typeof FindSpecialistOutputSchema>;

const specialistFinderTool = ai.defineTool(
    {
        name: 'findSpecialistTool',
        description: 'Searches for a medical specialist based on a location query.',
        inputSchema: z.object({
            query: z.string().describe('The search query, e.g., "Cardiologist in Dhaka, Bangladesh"'),
        }),
        outputSchema: z.array(z.custom<SerpApiResult>()),
    },
    async (input) => {
        return await searchSerpApi(input.query);
    }
);


const specialistPrompt = ai.definePrompt({
    name: 'specialistPrompt',
    input: { schema: FindSpecialistInputSchema },
    output: { schema: FindSpecialistOutputSchema },
    tools: [specialistFinderTool],
    prompt: `
        You are a helpful medical assistant. Your goal is to help a user find a relevant medical specialist.

        1.  First, determine the most appropriate medical specialist (e.g., Dermatologist, Cardiologist, Neurologist) based on the user's symptoms: {{{symptoms}}}.
        2.  Construct a search query using the determined specialist and the user's location: {{{city}}}, {{{state}}}, {{{country}}}.
        3.  Use the 'findSpecialistTool' with this search query to find doctors.
        4.  Analyze the search results.
        5.  Generate a detailed report in Markdown format. The report should include:
            - The recommended specialist type and an explanation.
            - A list of specific doctors or clinics from the search results. Include their name, address, and phone number if available.
            - If the search results are limited or unavailable, suggest general actions like contacting local hospitals or clinics.
    `,
});


const findSpecialistFlow = ai.defineFlow(
  {
    name: 'findSpecialistFlow',
    inputSchema: FindSpecialistInputSchema,
    outputSchema: FindSpecialistOutputSchema,
  },
  async (input) => {
    const { output } = await specialistPrompt(input);
    return output!;
  }
);

export async function findSpecialist(input: FindSpecialistInput): Promise<FindSpecialistOutput> {
  return findSpecialistFlow(input);
}
