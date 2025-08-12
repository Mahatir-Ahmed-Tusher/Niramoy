
import { config } from 'dotenv';
config();

import '@/ai/flows/symptom-analysis.ts';
import '@/ai/flows/diagnosis-recommendations.ts';
import '@/ai/flows/follow-up.ts';
import '@/ai/flows/find-specialist.ts';
import '@/ai/flows/translate-text.ts';
import '@/ai/flows/drug-information.ts';
import '@/ai/flows/report-analyzer.ts';
import '@/ai/flows/text-to-speech.ts';
import '@/ai/flows/general-inquiry.ts';
