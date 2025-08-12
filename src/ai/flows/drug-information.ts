'use server';
/**
 * @fileOverview A Genkit flow to get information about a drug using Tavily Search.
 *
 * - getDrugInformationFlow - A function that takes a drug name, searches for it using Tavily,
 *   and uses Gemini to structure the information in Bengali.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { searchTavily, TavilySearchResult } from '@/services/tavily';

const DrugInformationInputSchema = z.object({
  drugName: z.string().describe('The brand name of the drug, common in Bangladesh.'),
});
export type DrugInformationInput = z.infer<typeof DrugInformationInputSchema>;

const DrugInformationOutputSchema = z.object({
  genericName: z.string().describe('The generic name of the medicine in simple Bengali.'),
  overview: z.string().describe('A detailed but easy-to-understand explanation of what the medicine is, its therapeutic purpose, and how it works, in simple Bengali.'),
  dosageAndAdministration: z.string().describe('A general guide on recommended dosages, frequency, and method of administration, in simple Bengali. It must include a disclaimer to follow a doctor\'s prescription.'),
  sideEffects: z.string().describe('Common and serious adverse effects, in simple Bengali.'),
  pharmacology: z.string().describe('Mechanism of action, drug class, and relevant pharmacokinetic data, in simple Bengali.'),
  priceInBangladesh: z.string().describe('The possible price of the drug in Bangladesh, including the source URL. If not found, state that.'),
});
export type DrugInformationOutput = z.infer<typeof DrugInformationOutputSchema>;

export async function getDrugInformationFlow(input: DrugInformationInput): Promise<DrugInformationOutput> {
  return drugInformationFlow(input);
}

const DrugInformationContextSchema = z.object({
    drugName: z.string(),
    searchResults: z.array(z.custom<TavilySearchResult>()),
});

const prompt = ai.definePrompt({
  name: 'drugInformationPrompt',
  input: { schema: DrugInformationContextSchema },
  output: { schema: DrugInformationOutputSchema },
  prompt: `You are an expert digital pharmacist providing structured drug information for users in Bangladesh.
Your task is to analyze the provided search results for a drug and generate a clear, accurate, and easy-to-understand summary in very simple Bengali.
You MUST base your entire response ONLY on the content from the provided search results. Do not use any external knowledge.
If information for a specific section is not available in the search results, you MUST state that clearly in Bengali (e.g., "এই তথ্যটি পাওয়া যায়নি।").

Drug Brand Name: {{{drugName}}}

Search Results:
{{#each searchResults}}
- Title: {{{this.title}}}
  URL: {{{this.url}}}
  Content: {{{this.content}}}
---
{{/each}}

Based ONLY on the search results above, provide the following information in simple, clear Bengali:

- **Generic Name (জেনেরিক নাম):** Extract the generic name of the medicine.
- **Overview (ওভারভিউ):** Provide a detailed yet easy-to-understand explanation of the medicine. Explain its primary use and what it does in the body in simple terms.
- **Dosage & Administration (মাত্রা ও সেবনবিধি):** Describe a general dosage guideline based on the search results. **CRITICALLY IMPORTANT: You MUST end this section with the following sentence in Bengali: 'বিশেষ দ্রষ্টব্য: এখানে দেওয়া তথ্য শুধুমাত্র প্রাথমিক ধারণার জন্য। ঔষধের সঠিক মাত্রা ও সেবনবিধি জানতে সর্বদা একজন রেজিস্টার্ড ডাক্তারের পরামর্শ নিন।'**
- **Side Effects (পার্শ্বপ্রতিক্রিয়া):** List the common side effects mentioned in the search results.
- **Pharmacology (ফার্মাকোলজি):** Briefly explain the mechanism of action and drug class in simple terms.
- **Estimated Price in BDT (আনুমানিক মূল্য):** State the approximate cost in Bangladeshi Taka as found in the search results. Mention the source URL if possible.

Frame your entire response as general information, not as a prescription or medical advice. Your tone should be helpful and cautious.`,
});

const drugInformationFlow = ai.defineFlow(
  {
    name: 'drugInformationFlow',
    inputSchema: DrugInformationInputSchema,
    outputSchema: DrugInformationOutputSchema,
  },
  async (input) => {
    // 1. Perform the search first to get grounded results.
    const searchResults = await searchTavily(input.drugName);

    // 2. Pass the search results into the prompt context.
    const promptInput = {
        drugName: input.drugName,
        searchResults: searchResults,
    };

    const { output } = await prompt(promptInput);
    
    if (!output) {
      throw new Error("The AI model failed to generate a structured output.");
    }

    return output;
  }
);
