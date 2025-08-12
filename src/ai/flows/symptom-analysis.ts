
'use server';

/**
 * @fileOverview An AI agent to analyze patient symptoms and ask follow-up questions.
 *
 * - analyzeSymptoms - A function that handles the symptom analysis process.
 * - SymptomAnalysisInput - The input type for the analyzeSymptoms function.
 * - SymptomAnalysisOutput - The return type for the analyzeSymptoms function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SymptomAnalysisInputSchema = z.object({
  patientName: z.string().describe('The name of the patient in Bengali.'),
  patientGender: z.string().describe('The gender of the patient in Bengali.'),
  patientAge: z.number().describe('The age of the patient.'),
  symptoms: z.string().describe('The symptoms described by the patient in Bengali.'),
});
export type SymptomAnalysisInput = z.infer<typeof SymptomAnalysisInputSchema>;

const SymptomAnalysisOutputSchema = z.object({
  initialGreeting: z.string().describe('A warm, personal greeting in Bengali.'),
  followUpQuestions: z.array(z.string()).min(4).describe('An array of at least 4 relevant follow-up questions to ask the patient one by one, in Bengali.'),
});
export type SymptomAnalysisOutput = z.infer<typeof SymptomAnalysisOutputSchema>;

export async function analyzeSymptoms(input: SymptomAnalysisInput): Promise<SymptomAnalysisOutput> {
  return symptomAnalysisFlow(input);
}

const symptomAnalysisPrompt = ai.definePrompt({
  name: 'symptomAnalysisPrompt',
  input: {schema: SymptomAnalysisInputSchema},
  output: {schema: SymptomAnalysisOutputSchema},
  prompt: `You are a helpful and empathetic assistant for community health workers in rural Bangladesh. Your task is to analyze the patient's initial symptoms and generate a series of relevant follow-up questions to gather more information for a preliminary diagnosis.

The ENTIRE response MUST be in the Bengali language.

Patient Name: {{{patientName}}}
Patient Gender: {{{patientGender}}}
Patient Age: {{{patientAge}}}
Initial Symptoms: {{{symptoms}}}

Based on the information above, create a response with two parts:
1.  **initialGreeting**: A warm, personal greeting. If the patient's gender is 'পুরুষ' (Male), address them as '{{{patientName}}} সাহেব'. If the gender is 'মহিলা' (Female), address them as '{{{patientName}}} ম্যাডাম'. Then, add the sentence: "আপনার সমস্যাগুলো বিস্তারিতভাবে বুঝতে আমি কয়েকটি প্রশ্ন করব। দয়া করে একটি একটি করে উত্তর দিন।"
2.  **followUpQuestions**: A JSON array of at least FOUR (or more if necessary) important follow-up questions. The questions should be designed to be asked one by one to understand the problem better. The questions must be in Bengali and use a natural, formal, and caring tone.

Example Output Structure:
{
  "initialGreeting": "করিম সাহেব, আপনার সমস্যাগুলো বিস্তারিতভাবে বুঝতে আমি কয়েকটি প্রশ্ন করব। দয়া করে একটি একটি করে উত্তর দিন।",
  "followUpQuestions": [
    "আপনার জ্বর কত দিন ধরে?",
    "জ্বরের সাথে কি কাঁপুনি আছে?",
    "শরীরে আর কোথায় কোথায় ব্যথা অনুভব করছেন?",
    "আপনার কি খাওয়ায় অরুচি আছে?"
  ]
}
`,
});

const symptomAnalysisFlow = ai.defineFlow(
  {
    name: 'symptomAnalysisFlow',
    inputSchema: SymptomAnalysisInputSchema,
    outputSchema: SymptomAnalysisOutputSchema,
  },
  async (input) => {
    const {output} = await symptomAnalysisPrompt(input);
    return output!;
  }
);
