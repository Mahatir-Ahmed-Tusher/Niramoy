'use client';

import React, { useEffect } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Send, Mic, Loader2, Square } from 'lucide-react';
import { useSettings } from '@/hooks/use-settings';
import { useSpeechToText } from '@/hooks/use-speech-to-text';

interface ChatInputProps {
  onSubmit: (message: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSubmit, isLoading }: ChatInputProps) {
  const [message, setMessage] = React.useState('');
  const { t } = useSettings();
  const { transcript, isListening, startListening, stopListening } = useSpeechToText();

  useEffect(() => {
    if (isListening) {
      setMessage(transcript);
    }
  }, [transcript, isListening]);
  
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    if(isListening) {
        stopListening();
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSubmit(message);
      setMessage('');
      if(isListening) {
          stopListening();
      }
    }
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      setMessage('');
      startListening();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <Textarea
        value={message}
        onChange={handleMessageChange}
        placeholder={isListening ? t('listening') : t('typeYourAnswer')}
        className="w-full pr-24 py-3"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
        rows={2}
        disabled={isLoading}
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={handleMicClick}
          className={isListening ? 'text-destructive' : 'text-muted-foreground'}
          disabled={isLoading}
        >
          {isListening ? <Square className="h-5 w-5 animate-pulse" /> : <Mic className="h-5 w-5" />}
        </Button>
        <Button type="submit" size="icon" disabled={isLoading || !message.trim()}>
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        </Button>
      </div>
    </form>
  );
}
