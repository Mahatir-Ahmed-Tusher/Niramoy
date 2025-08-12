
'use client';

import React, { useState, useRef, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useSettings } from '@/hooks/use-settings';
import { useUser } from '@clerk/nextjs';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { PatientDetailsForm } from './patient-details-form';
import { ChatMessage } from './chat-message';
import { ChatInput } from './chat-input';
import { askFollowUpQuestions, getFinalDiagnosis, answerFollowUp } from '@/lib/actions';
import { DiagnosisResult, type Diagnosis } from './diagnosis-result';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '../ui/scroll-area';
import { Download, FileText, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

type PatientDetails = {
  patientName: string;
  patientGender: string;
  patientAge: number;
  symptoms: string;
};

export type Message = {
  id: string;
  role: 'user' | 'bot' | 'system';
  content: React.ReactNode;
  rawContent?: string; // Add raw string content for history
};

type ChatStep = 'details' | 'followup' | 'diagnosis' | 'done' | 'conversation';

export function ChatInterface() {
  const { t } = useSettings();
  const { toast } = useToast();
  const { user, isSignedIn } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<ChatStep>('details');
  const [sessionId, setSessionId] = useState<string>('');
  
  // Convex mutations
  const createChatSession = useMutation(api.chat.createChatSession);
  const addMessage = useMutation(api.chat.addMessage);
  
  const [patientDetails, setPatientDetails] = useState<PatientDetails | null>(null);
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [finalDiagnosis, setFinalDiagnosis] = useState<Diagnosis | null>(null);

  const reportRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Reset state on mount and when starting new chat
  const initializeChat = async () => {
    // Generate a unique session ID
    const newSessionId = crypto.randomUUID();
    setSessionId(newSessionId);
    
    // Create a new chat session in the database
    try {
      await createChatSession({
        sessionId: newSessionId,
        userId: isSignedIn ? user?.id : undefined,
        type: 'symptom-analysis',
      });
    } catch (error) {
      console.error('Failed to create chat session:', error);
    }
    
    setMessages([{ id: 'welcome', role: 'bot', content: t('welcomeMessage'), rawContent: t('welcomeMessage') }]);
    setIsLoading(false);
    setStep('details');
    setPatientDetails(null);
    setQuestions([]);
    setAnswers([]);
    setCurrentQuestionIndex(0);
    setFinalDiagnosis(null);
  };

  // Save message to database
  const saveMessageToDatabase = async (role: 'user' | 'assistant', content: string) => {
    if (!sessionId) return;
    
    try {
      await addMessage({
        sessionId,
        role,
        content,
      });
    } catch (error) {
      console.error('Failed to save message:', error);
    }
  };

  useEffect(() => {
    initializeChat();
  }, [t]); // Add 't' dependency to re-initialize if language changes

  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);

  const handlePatientDetailsSubmit = async (data: PatientDetails) => {
    setPatientDetails(data);
    const userMessageContent = `**${t('patientName')}:** ${data.patientName}\n**${t('patientGender')}:** ${data.patientGender}\n**${t('patientAge')}:** ${data.patientAge}\n**${t('symptoms')}:** ${data.symptoms}`;
    const userMessage = {
        id: crypto.randomUUID(),
        role: 'user' as const,
        content: <ReactMarkdown>{userMessageContent}</ReactMarkdown>,
        rawContent: `Patient: ${data.patientName}, Gender: ${data.patientGender}, Age: ${data.patientAge}, Symptoms: ${data.symptoms}`
    };

    setMessages((prev) => [...prev, userMessage]);
    setStep('followup');
    setIsLoading(true);
    
    const result = await askFollowUpQuestions(data);
    
    if (result.error || !result.questions || !result.initialGreeting) {
      setIsLoading(false);
      toast({ variant: 'destructive', title: 'Error', description: result.error || "Couldn't generate questions." });
      setStep('details'); // Revert to details step on error
      return;
    }

    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: 'bot', content: result.initialGreeting, rawContent: result.initialGreeting },
      { id: crypto.randomUUID(), role: 'bot', content: result.questions[0], rawContent: result.questions[0] }
    ]);

    setQuestions(result.questions);
    setIsLoading(false);
  };

  const handleFollowUpSubmit = async (answer: string) => {
    if (!patientDetails) return;

    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: 'user', content: answer, rawContent: answer },
    ]);

    // Ask next question or get diagnosis
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'bot', content: questions[nextIndex], rawContent: questions[nextIndex] },
      ]);
    } else {
      // All questions answered, get diagnosis
      setIsLoading(true);
      setStep('diagnosis');

      const fullSymptomDetails = questions.map((q, i) => `${q}\n- ${newAnswers[i]}`).join('\n\n');

      const diagnosisInput = {
        patientDetails: `নাম: ${patientDetails.patientName}, লিঙ্গ: ${patientDetails.patientGender}, বয়স: ${patientDetails.patientAge}, লক্ষণ: ${patientDetails.symptoms}`,
        symptomDetails: fullSymptomDetails,
      };
      
      const result = await getFinalDiagnosis(diagnosisInput);
      setIsLoading(false);
      
      if (result.error || !result.diagnosis) {
        toast({ variant: 'destructive', title: 'Error', description: result.error || 'Failed to get diagnosis.' });
        // Allow user to continue conversation even if diagnosis fails
        setStep('conversation');
        return;
      }
      
      setFinalDiagnosis(result.diagnosis as Diagnosis);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'system',
          content: <DiagnosisResult diagnosis={result.diagnosis as Diagnosis} ref={reportRef}/>,
          rawContent: `Diagnosis Report: Probable Diagnosis: ${result.diagnosis.probableDiagnosis}, Recommended Care: ${result.diagnosis.recommendedCareActions}, Suggested Tests: ${result.diagnosis.suggestedDiagnosticTests}`
        },
      ]);
      setStep('conversation'); // Transition to conversation step
    }
  };

  const handleConversationSubmit = async (question: string) => {
    setIsLoading(true);
    setMessages(prev => [
        ...prev,
        {id: crypto.randomUUID(), role: 'user', content: question, rawContent: question}
    ]);

    // Construct conversation history from messages state
    const conversationHistory = messages.map(m => `${m.role}: ${m.rawContent}`).join('\n');

    const result = await answerFollowUp({ conversationHistory, question });
    setIsLoading(false);

    if (result.error || !result.answer) {
        toast({ variant: 'destructive', title: 'Error', description: result.error || 'Failed to get an answer.' });
        return;
    }

    setMessages(prev => [
        ...prev,
        {id: crypto.randomUUID(), role: 'bot', content: result.answer, rawContent: result.answer}
    ]);
  };

  const downloadAs = async (format: 'pdf' | 'txt') => {
    if (!reportRef.current || !finalDiagnosis) return;
  
    if (format === 'pdf') {
      const canvas = await html2canvas(reportRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Niramoy_Report_${patientDetails?.patientName}.pdf`);
    } else {
      const patientInfo = `Patient: ${patientDetails?.patientName}, ${patientDetails?.patientAge}, ${patientDetails?.patientGender}\n`;
      const reportText = `
${t('probableDiagnosis')}:\n${finalDiagnosis.probableDiagnosis}\n\n
${t('recommendedCare')}:\n${finalDiagnosis.recommendedCareActions}\n\n
${t('suggestedTests')}:\n${finalDiagnosis.suggestedDiagnosticTests}\n\n
Powered by Niramoy AI
`;
      const fullText = patientInfo + reportText;
      const blob = new Blob([fullText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Niramoy_Report_${patientDetails?.patientName}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };


  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto p-4">
       <div className="flex justify-end mb-2">
            <Button onClick={initializeChat} variant="outline" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                {t('startNewChat')}
            </Button>
        </div>
      <ScrollArea className="flex-grow mb-4 pr-4 border-t pt-4" ref={scrollAreaRef}>
        <div className="space-y-6">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isLoading && <ChatMessage message={{ id: 'loading', role: 'bot', content: '...', rawContent: '...' }} isLoading={true} />}
        </div>
      </ScrollArea>

      <div className="mt-auto pt-4 space-y-4">
        {step === 'details' && <PatientDetailsForm onSubmit={handlePatientDetailsSubmit} isLoading={isLoading} />}
        
        {(step === 'followup' && !isLoading) && (
            <ChatInput onSubmit={handleFollowUpSubmit} isLoading={isLoading} />
        )}

        {(step === 'conversation') && (
            <>
                {finalDiagnosis && (
                    <div className="flex justify-center gap-4">
                        <Button onClick={() => downloadAs('txt')}><FileText className="mr-2 h-4 w-4" /> Download as Text</Button>
                        <Button onClick={() => downloadAs('pdf')}><Download className="mr-2 h-4 w-4" /> Download as PDF</Button>
                    </div>
                )}
                <ChatInput onSubmit={handleConversationSubmit} isLoading={isLoading} />
            </>
        )}
      </div>
    </div>
  );
}
