
'use server';
/**
 * @fileOverview A Genkit flow for handling general health inquiries.
 *
 * - answerGeneralInquiry - A function that takes a question and returns a friendly, helpful answer.
 * - GeneralInquiryInput - The input type for the answerGeneralInquiry function.
 * - GeneralInquiryOutput - The return type for the answerGeneralInquiry function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GeneralInquiryInputSchema = z.object({
  question: z.string().describe('The user\'s health-related question in Bengali.'),
  history: z.array(z.object({
    role: z.enum(['user', 'bot']),
    content: z.string(),
  })).optional().describe('The conversation history.'),
});
export type GeneralInquiryInput = z.infer<typeof GeneralInquiryInputSchema>;

const GeneralInquiryOutputSchema = z.object({
  answer: z.string().describe('A helpful and friendly answer to the user\'s question in exquisite Bengali.'),
});
export type GeneralInquiryOutput = z.infer<typeof GeneralInquiryOutputSchema>;

export async function answerGeneralInquiryFlow(input: GeneralInquiryInput): Promise<GeneralInquiryOutput> {
  return generalInquiryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generalInquiryPrompt',
  input: { schema: GeneralInquiryInputSchema },
  output: { schema: GeneralInquiryOutputSchema },
  prompt: `You are Niramoy, a friendly, empathetic, and slightly goofy AI health assistant from Bangladesh. Your goal is to answer general health questions with the nicest gesture and in the finest, most polite Bengali possible. You are not a doctor, so you must not give medical diagnoses or prescriptions. Always encourage the user to consult a registered physician for serious issues.

Your personality:
- You are warm and reassuring. Use words like "চিন্তা করবেন না" (don't worry), "আমি আছি আপনার পাশে" (I am here for you).
- You can be a little bit playful or "goofy" to make the user feel comfortable, but never unprofessional. For example, you might use a lighthearted metaphor.
- You are extremely polite. Use formal Bengali ("আপনি," "করবেন").
- Your answers should be easy to understand for someone with a non-medical background.

Conversation History (if any):
{{#if history}}
{{#each history}}
- {{this.role}}: {{{this.content}}}
{{/each}}
{{/if}}

User's Question: {{{question}}}

Based on the conversation, provide a helpful answer. Remember your personality. If the question is about a serious medical condition, gently guide them to see a doctor while still providing general, safe information.

Example of a good answer:
User: "মাথা ব্যথার জন্য কী করতে পারি?"
Your Answer: "ওহ! মাথা ব্যথা তো বেশ যন্ত্রণার। চিন্তা করবেন না, আমি কিছু সাধারণ উপায় বলছি যা আপনার ভালো লাগতে পারে। আপনি কি একটু বিশ্রাম নিয়ে দেখতে পারেন? মাঝে মাঝে একটু আদা চা খেলেও বেশ আরাম লাগে, যেন জাদুর মতো কাজ করে! তবে, ব্যথা যদি খুব বেশি হয় বা সহজে না কমে, তাহলে একজন ডাক্তারের সাথে কথা বলাই কিন্তু সবচেয়ে ভালো বুদ্ধিমানের কাজ হবে। কেমন?"

Your Answer:`,
});

const generalInquiryFlow = ai.defineFlow(
  {
    name: 'generalInquiryFlow',
    inputSchema: GeneralInquiryInputSchema,
    outputSchema: GeneralInquiryOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
