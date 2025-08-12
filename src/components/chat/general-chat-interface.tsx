
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSettings } from '@/hooks/use-settings';
import { ChatMessage } from './chat-message';
import { ChatInput } from './chat-input';
import { answerGeneralInquiry } from '@/lib/actions';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '../ui/scroll-area';
import { RefreshCw } from 'lucide-react';

type Message = {
  id: string;
  role: 'user' | 'bot';
  content: string;
  rawContent?: string;
};

export function GeneralChatInterface() {
  const { t } = useSettings();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const initializeChat = () => {
    setMessages([{ id: 'welcome-general', role: 'bot', content: t('generalInquiryWelcome'), rawContent: t('generalInquiryWelcome') }]);
    setIsLoading(false);
  };

  useEffect(() => {
    initializeChat();
  }, [t]); 

  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);


  const handleSubmit = async (question: string) => {
    setIsLoading(true);
    const userMessage: Message = { id: crypto.randomUUID(), role: 'user', content: question, rawContent: question };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    // Construct history for the AI
    const history = newMessages.slice(0, -1).map(m => ({ role: m.role, content: m.rawContent || m.content }));

    const result = await answerGeneralInquiry({ question, history });
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

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto p-4">
       <div className="flex justify-between items-center mb-2 border-b pb-2">
            <div>
                <h1 className="text-2xl font-headline text-primary">{t('generalInquiryTitle')}</h1>
                <p className="text-muted-foreground">{t('generalInquiryDescription')}</p>
            </div>
            <Button onClick={initializeChat} variant="outline" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                {t('startNewChat')}
            </Button>
        </div>
      <ScrollArea className="flex-grow mb-4 pr-4 pt-4" ref={scrollAreaRef}>
        <div className="space-y-6">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isLoading && <ChatMessage message={{ id: 'loading', role: 'bot', content: '...', rawContent: '...' }} isLoading={true} />}
        </div>
      </ScrollArea>

      <div className="mt-auto pt-4 space-y-4">
        <ChatInput onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
}
