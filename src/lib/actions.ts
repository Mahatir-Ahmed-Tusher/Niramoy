
'use server';

import 'dotenv/config';
import { analyzeSymptoms, SymptomAnalysisInput } from '@/ai/flows/symptom-analysis';
import { getDiagnosisAndRecommendations, DiagnosisAndRecommendationsInput } from '@/ai/flows/diagnosis-recommendations';
import { answerFollowUp as answerFollowUpFlow, FollowUpInput } from '@/ai/flows/follow-up';
import { findSpecialist as findSpecialistFlow } from '@/ai/flows/find-specialist';
import { translateToBengali } from '@/ai/flows/translate-text';
import { getDrugInformationFlow } from '@/ai/flows/drug-information';
import { answerGeneralInquiryFlow, GeneralInquiryInput } from '@/ai/flows/general-inquiry';
import { analyzeMedicalReportFlow, ReportAnalyzerInput } from '@/ai/flows/report-analyzer';
import { textToSpeechFlow, TextToSpeechInput } from '@/ai/flows/text-to-speech';
import { FindSpecialistInputSchema } from '@/lib/schemas';
import type { FindSpecialistInput } from '@/ai/flows/find-specialist';

import { z } from 'zod';

const patientDetailsSchema = z.object({
  patientName: z.string().min(1),
  patientGender: z.string().min(1),
  patientAge: z.coerce.number().min(0),
  symptoms: z.string().min(1),
});

export async function askFollowUpQuestions(data: unknown) {
  const validation = patientDetailsSchema.safeParse(data);
  if (!validation.success) {
    return { error: 'Invalid input.' };
  }

  try {
    const result = await analyzeSymptoms(validation.data as SymptomAnalysisInput);
    // The flow returns both initialGreeting and followUpQuestions
    return { 
        initialGreeting: result.initialGreeting,
        questions: result.followUpQuestions 
    };
  } catch (error) {
    console.error('Error in askFollowUpQuestions:', error);
    return { error: 'Failed to get follow-up questions from AI.' };
  }
}


const diagnosisSchema = z.object({
    patientDetails: z.string().min(1),
    symptomDetails: z.string().min(1),
});

export async function getFinalDiagnosis(data: unknown) {
    const validation = diagnosisSchema.safeParse(data);
    if (!validation.success) {
        return { error: 'Invalid input for diagnosis.' };
    }

    try {
        const result = await getDiagnosisAndRecommendations(validation.data as DiagnosisAndRecommendationsInput);
        return { diagnosis: result };
    } catch (error) {
        console.error('Error in getFinalDiagnosis:', error);
        return { error: 'Failed to get diagnosis from AI.' };
    }
}

const followUpSchema = z.object({
    conversationHistory: z.string().min(1),
    question: z.string().min(1),
});

export async function answerFollowUp(data: unknown) {
    const validation = followUpSchema.safeParse(data);
    if (!validation.success) {
        return { error: 'Invalid input for follow-up.' };
    }

    try {
        const result = await answerFollowUpFlow(validation.data as FollowUpInput);
        return { answer: result.answer };
    } catch (error) {
        console.error('Error in answerFollowUp:', error);
        return { error: 'Failed to get follow-up answer from AI.' };
    }
}

export async function findSpecialist(data: unknown): Promise<{ report?: string | null; error?: string }> {
  const validation = FindSpecialistInputSchema.safeParse(data);
  if (!validation.success) {
    const issues = validation.error.issues.map(issue => issue.message).join(' ');
    return { error: `Invalid input for finding a specialist: ${issues}` };
  }

  try {
    const result = await findSpecialistFlow(validation.data as FindSpecialistInput);
    return { report: result.report };
  } catch (error) {
    console.error('Error in findSpecialist:', error);
    return { error: 'Failed to find a specialist.' };
  }
}

export type DictionaryEntry = {
  word: string;
  partOfSpeech: string;
  pronunciation?: string;
  audioUrl?: string;
  definitions: string[];
  bengaliDefinitions: string[];
};

export async function getDictionaryEntry(query: string): Promise<{ results?: DictionaryEntry[] | null; suggestions?: string[], error?: string }> {
  const apiKey = process.env.MEDICAL_DICTIONARY_API_KEY;
  if (!apiKey || apiKey === 'your-api-key-here') {
    return { error: 'Medical Dictionary API key is not configured.' };
  }

  try {
    const url = `https://www.dictionaryapi.com/api/v3/references/medical/json/${encodeURIComponent(query)}?key=${apiKey}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
    }
    const data = await response.json();

    if (!data || data.length === 0) {
      return { results: null };
    }

    if (typeof data[0] === 'string') {
        return { suggestions: data.slice(0, 5) };
    }

    const rawResults = data
      .filter((item: any) => item.meta && item.hwi && Array.isArray(item.shortdef) && item.shortdef.length > 0)
      .map((item: any) => {
        const meta = item.meta;
        const hwi = item.hwi;
        const prs = hwi.prs?.[0];
        const sound = prs?.sound;

        let audioUrl;
        if (sound?.audio) {
          const subDir = sound.audio.startsWith('bix') ? 'bix' : sound.audio.startsWith('gg') ? 'gg' : sound.audio.charAt(0).match(/[a-zA-Z]/) ? sound.audio.charAt(0) : 'number';
          audioUrl = `https://media.merriam-webster.com/audio/prons/en/us/mp3/${subDir}/${sound.audio}.mp3`;
        }

        return {
          word: meta.id.split(':')[0],
          partOfSpeech: item.fl || 'N/A',
          pronunciation: prs?.mw,
          audioUrl: audioUrl,
          definitions: item.shortdef as string[],
        };
      }).slice(0, 3);

    const resultsWithTranslations = await Promise.all(
        rawResults.map(async (entry: any) => {
            const translationPromises = entry.definitions.map((def: any) => translateToBengali({ text: def }));
            const translatedDefinitions = await Promise.all(translationPromises);
            const bengaliDefinitions = translatedDefinitions.map((res: any) => res.translatedText);
            return {
                ...entry,
                bengaliDefinitions,
            };
        })
    );

    return { results: resultsWithTranslations };

  } catch (error) {
    console.error('Dictionary API Error:', error);
    return { error: 'Failed to fetch dictionary entry.' };
  }
}

export async function getDrugInformation(drugName: string): Promise<{ info?: any; error?: string }> {
  if (!drugName) {
    return { error: 'Drug name is required.' };
  }

  try {
    const result = await getDrugInformationFlow({ drugName });
    return { info: result };
  } catch (error) {
    console.error('Error in getDrugInformation:', error);
    return { error: 'Failed to get drug information from AI.' };
  }
}

const reportAnalyzerSchema = z.object({
    imageAsDataUri: z.string().min(1),
});

export async function analyzeMedicalReport(data: unknown): Promise<{ analysis?: string | null; error?: string }> {
    const validation = reportAnalyzerSchema.safeParse(data);
    if (!validation.success) {
        return { error: 'Invalid input for report analysis.' };
    }

    try {
        const result = await analyzeMedicalReportFlow(validation.data as ReportAnalyzerInput);
        return { analysis: result.analysis };
    } catch (error) {
        console.error('Error in analyzeMedicalReport:', error);
        return { error: 'Failed to analyze medical report.' };
    }
}

const textToSpeechSchema = z.object({
    text: z.string().min(1),
});

export async function textToSpeech(data: unknown): Promise<{ audio?: string | null; error?: string }> {
    const validation = textToSpeechSchema.safeParse(data);
    if (!validation.success) {
        return { error: 'Invalid input for text-to-speech.' };
    }

    try {
        const result = await textToSpeechFlow(validation.data as TextToSpeechInput);
        return { audio: result.audio };
    } catch (error) {
        console.error('Error in textToSpeech:', error);
        return { error: 'Failed to convert text to speech.' };
    }
}

const generalInquirySchema = z.object({
  question: z.string().min(1),
  history: z.array(z.object({
    role: z.enum(['user', 'bot']),
    content: z.string(),
  })).optional(),
});

export async function answerGeneralInquiry(data: unknown) {
  const validation = generalInquirySchema.safeParse(data);
  if (!validation.success) {
    return { error: 'Invalid input for general inquiry.' };
  }

  try {
    const result = await answerGeneralInquiryFlow(validation.data as GeneralInquiryInput);
    return { answer: result.answer };
  } catch (error) {
    console.error('Error in answerGeneralInquiry:', error);
    return { error: 'Failed to get an answer from the AI.' };
  }
}
