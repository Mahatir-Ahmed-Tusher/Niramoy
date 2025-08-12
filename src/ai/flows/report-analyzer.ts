
'use server';
/**
 * @fileOverview A Genkit flow to analyze a medical report image.
 * This flow uses a two-step process:
 * 1. OpenRouter's Llama model analyzes the image and extracts technical text.
 * 2. Gemini model takes the technical text and explains it in simple Bengali.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import fetch from 'node-fetch';

const ReportAnalyzerInputSchema = z.object({
  imageAsDataUri: z.string().describe("A cropped medical report image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type ReportAnalyzerInput = z.infer<typeof ReportAnalyzerInputSchema>;

const ReportAnalyzerOutputSchema = z.object({
  analysis: z.string().describe('A detailed explanation of the medical report in simple, understandable Bengali.'),
});
export type ReportAnalyzerOutput = z.infer<typeof ReportAnalyzerOutputSchema>;

// Gemini prompt to simplify the technical analysis from Llama
const bengaliExplanationPrompt = ai.definePrompt({
    name: 'bengaliExplanationPrompt',
    input: { schema: z.object({ technicalAnalysis: z.string() }) },
    output: { schema: ReportAnalyzerOutputSchema },
    prompt: `You are an expert medical assistant who excels at explaining complex medical topics in simple, easy-to-understand Bengali.
You have been given a technical analysis of a medical report. Your task is to re-write this analysis in plain Bengali for a non-medical person.

Do the following:
1.  Read the technical analysis provided below.
2.  Translate and explain all medical terms in very simple Bengali.
3.  Structure the output with clear headings for each section (e.g., "Test Information", "Results Analysis").
4.  When creating the results table, use the test parameters and their results from the provided analysis. However, for the "Normal Range" (স্বাভাবিক মাত্রা) column, you MUST use your own internal medical knowledge base to provide the correct standard range for each test. Do not rely on the normal range mentioned in the technical analysis text, as it might be incorrect.
5.  Ensure the tone is helpful, reassuring, and easy to follow.
6.  At the very end, you MUST include the following disclaimer in Bengali: "বিশেষ দ্রষ্টব্য: এই বিশ্লেষণটি শুধুমাত্র শিক্ষামূলক উদ্দেশ্যে প্রদান করা হয়েছে। পরীক্ষার ফলাফল ব্যাখ্যা করার আগে সর্বদা আপনার স্বাস্থ্যসেবা প্রদানকারীর সাথে পরামর্শ করুন।"

Technical Analysis to explain:
---
{{{technicalAnalysis}}}
---
`,
});

// Moved environment variable access to the top level of the module.
const openRouterApiKey = process.env.OPENROUTER_API_KEY;

export async function analyzeMedicalReportFlow(input: ReportAnalyzerInput): Promise<ReportAnalyzerOutput> {
  if (!openRouterApiKey) {
    throw new Error('OPENROUTER_API_KEY is not set in environment variables.');
  }

  // Llama Vision Prompt - This gets the technical details
  const llamaSystemPrompt = `You are an expert in analyzing medical test reports. Your task is to provide a detailed analysis of the test report image uploaded. Provide the entire response in English.

1. Test Information:
   - Name of test(s) performed
   - Date of testing (if visible)
   - Laboratory/facility information
2. Results Analysis:
   - List each parameter with its result and reference range
   - Clearly mark abnormal values (HIGH or LOW)
3. Plain Language Explanation: What each test measures in simple terms
4. Context: General information about what results might indicate (without diagnosing)
5. Quality Assessment: Note any illegible text or ambiguous information
6. Recommended Follow-up: Suggest appropriate next steps

If certain information isn't visible or legible in the image, explicitly state this rather than guessing or hallucinating content.`;

  try {
    // Step 1: Get technical analysis from Llama on OpenRouter
    const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openRouterApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.2-11b-vision-instruct:free",
        messages: [
          {
            role: "user",
            content: [
              { "type": "text", "text": llamaSystemPrompt },
              { "type": "image_url", "image_url": { "url": input.imageAsDataUri } }
            ]
          }
        ],
        max_tokens: 4096,
        temperature: 0.7,
      })
    });

    if (!openRouterResponse.ok) {
      const errorText = await openRouterResponse.text();
      throw new Error(`OpenRouter API request failed: ${errorText}`);
    }

    const llamaData = await openRouterResponse.json() as any;
    const technicalAnalysis = llamaData.choices?.[0]?.message?.content;

    if (!technicalAnalysis) {
        throw new Error("Llama model failed to return an analysis.");
    }

    // Step 2: Get simplified Bengali explanation from Gemini
    const { output } = await bengaliExplanationPrompt({ technicalAnalysis });

    if (!output) {
        throw new Error("Gemini model failed to generate a simplified explanation.");
    }
    
    return output;

  } catch (error) {
    console.error('Error in analyzeMedicalReportFlow:', error);
    throw new Error(`Failed to analyze medical report: ${error instanceof Error ? error.message : String(error)}`);
  }
}
