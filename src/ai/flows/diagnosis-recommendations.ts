
// diagnosis-recommendations.ts
'use server';
/**
 * @fileOverview This file defines a Genkit flow for providing probable diagnosis, care actions, and suggested diagnostic tests based on patient symptoms.
 *
 * - getDiagnosisAndRecommendations - A function that takes patient information and returns diagnosis, care actions, and suggested tests.
 * - DiagnosisAndRecommendationsInput - The input type for the getDiagnosisAndRecommendations function.
 * - DiagnosisAndRecommendationsOutput - The return type for the getDiagnosisAndRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { searchKnowledgeBase, MedicalInfo } from '@/services/knowledge-base';

const DiagnosisAndRecommendationsInputSchema = z.object({
  patientDetails: z.string().describe('Details about the patient including name, gender, age, and symptoms, all in Bengali.'),
  symptomDetails: z.string().describe('Details of the symptoms including answers to the follow up questions, all in Bengali.'),
});
export type DiagnosisAndRecommendationsInput = z.infer<typeof DiagnosisAndRecommendationsInputSchema>;

const DiagnosisAndRecommendationsOutputSchema = z.object({
  probableDiagnosis: z.string().describe('The probable diagnosis in Bengali.'),
  recommendedCareActions: z.string().describe('Recommended care actions in Bengali. This may include suggestions for common, over-the-counter Bangladeshi medicine brands for simple ailments. It MUST include a strong disclaimer to consult a doctor.'),
  suggestedDiagnosticTests: z.string().describe('Suggested diagnostic tests in Bengali.'),
});
export type DiagnosisAndRecommendationsOutput = z.infer<typeof DiagnosisAndRecommendationsOutputSchema>;

export async function getDiagnosisAndRecommendations(input: DiagnosisAndRecommendationsInput): Promise<DiagnosisAndRecommendationsOutput> {
  return diagnosisAndRecommendationsFlow(input);
}

const findMedicalInfoTool = ai.defineTool(
    {
        name: 'findMedicalInfo',
        description: 'Search for medical information based on patient symptoms to ground the diagnosis and recommendations.',
        inputSchema: z.object({ symptoms: z.string().describe('The patient symptoms in Bengali.') }),
        outputSchema: z.array(z.custom<MedicalInfo>()),
    },
    async (input) => {
        return await searchKnowledgeBase(input.symptoms) || [];
    }
);

const prompt = ai.definePrompt({
  name: 'diagnosisAndRecommendationsPrompt',
  input: {schema: DiagnosisAndRecommendationsInputSchema},
  output: {schema: DiagnosisAndRecommendationsOutputSchema},
  tools: [findMedicalInfoTool],
  prompt: `You are a helpful and cautious assistant for community health workers in rural Bangladesh. Your primary goal is to provide safe and accurate medical guidance. The ENTIRE response MUST be in the Bengali language.

  1.  First, use the 'findMedicalInfo' tool to search for information based on the combined patient symptoms and symptom details. The 'symptoms' parameter for the tool should include both initial symptoms and the details from the follow-up questions.
  2.  If the tool returns relevant information, use it as the PRIMARY SOURCE for your response. Synthesize the information if multiple matches are found.
  3.  If the tool returns no information or the information doesn't seem to match well, rely on your general knowledge but be EXTRA CAUTIOUS. Prefer to recommend seeing a doctor over providing a specific diagnosis you are not confident about.
  4.  For simple, non-threatening ailments (like a common fever or mild pain), you may suggest common, over-the-counter Bangladeshi medicine brand names (e.g., 'Napa' for Paracetamol) as part of the 'recommendedCareActions'.
  5.  **CRITICALLY IMPORTANT**: For any medicine suggestion, you MUST include the following disclaimer in Bengali, exactly as written: 'বিশেষ দ্রষ্টব্য: এই পরামর্শ শুধুমাত্র প্রাথমিক ধারণার জন্য। যেকোনো ঔষধ সেবনের পূর্বে অবশ্যই একজন রেজিস্টার্ড ডাক্তারের পরামর্শ নিন।'
  6.  Always provide the response in Bengali. Do not use any Hindi or other languages.

  Patient Details: {{{patientDetails}}}
  Symptom Details: {{{symptomDetails}}}
  `,
});

const diagnosisAndRecommendationsFlow = ai.defineFlow(
  {
    name: 'diagnosisAndRecommendationsFlow',
    inputSchema: DiagnosisAndRecommendationsInputSchema,
    outputSchema: DiagnosisAndRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
