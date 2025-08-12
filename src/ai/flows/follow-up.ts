
'use server';
/**
 * @fileOverview This file defines a Genkit flow for answering follow-up questions based on a conversation history.
 *
 * - answerFollowUp - A function that takes the conversation history and a new question, and returns an answer.
 * - FollowUpInput - The input type for the answerFollowUp function.
 * - FollowUpOutput - The return type for the answerFollowUp function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FollowUpInputSchema = z.object({
  conversationHistory: z.string().describe('The entire conversation history up to this point.'),
  question: z.string().describe('The follow-up question from the user in Bengali.'),
});
export type FollowUpInput = z.infer<typeof FollowUpInputSchema>;

const FollowUpOutputSchema = z.object({
  answer: z.string().describe('The answer to the follow-up question in Bengali.'),
});
export type FollowUpOutput = z.infer<typeof FollowUpOutputSchema>;

export async function answerFollowUp(input: FollowUpInput): Promise<FollowUpOutput> {
  return followUpFlow(input);
}

const prompt = ai.definePrompt({
  name: 'followUpPrompt',
  input: {schema: FollowUpInputSchema},
  output: {schema: FollowUpOutputSchema},
  prompt: `You are a helpful assistant for community health workers in rural Bangladesh. Based on the provided conversation history and the new question, provide a helpful and concise answer.

The ENTIRE response MUST be in the Bengali language. Do not use any Hindi or other languages.

  Conversation History:
  {{{conversationHistory}}}

  New Question: {{{question}}}
  
  Your Answer:`,
});

const followUpFlow = ai.defineFlow(
  {
    name: 'followUpFlow',
    inputSchema: FollowUpInputSchema,
    outputSchema: FollowUpOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
