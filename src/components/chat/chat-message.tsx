
'use client';

import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { HeartPulse, User } from 'lucide-react';
import type { Message } from './chat-interface';
import { LoadingDots } from './loading-dots';
import ReactMarkdown from 'react-markdown';
import { AudioPlayer } from '../audio-player';

export function ChatMessage({ message, isLoading = false }: { message: Message; isLoading?: boolean }) {
  const isBot = message.role === 'bot';
  const isSystem = message.role === 'system';

  const renderContent = () => {
    if (isLoading) {
      return <LoadingDots />;
    }
    // Check if content is a string and render with Markdown
    if (typeof message.content === 'string') {
      return (
        <ReactMarkdown
            className="prose prose-sm dark:prose-invert max-w-full prose-p:my-2 last:prose-p:mb-0 first:prose-p:mt-0"
        >
            {message.content}
        </ReactMarkdown>
      );
    }
    // Otherwise, render the React node directly
    return message.content;
  };

  if (isSystem) {
    return <div className="my-4">{renderContent()}</div>;
  }

  return (
    <div
      className={cn('flex items-start gap-4', {
        'justify-end': !isBot,
      })}
    >
      {isBot && (
        <Avatar className="h-9 w-9 border border-primary/20">
          <AvatarFallback className="bg-primary/80 text-primary-foreground">
            <HeartPulse className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          'max-w-[85%] rounded-2xl p-4 shadow-sm relative group',
          isBot
            ? 'rounded-tl-none bg-card'
            : 'rounded-tr-none bg-primary text-primary-foreground'
        )}
      >
        {renderContent()}

         {isBot && !isLoading && typeof message.rawContent === 'string' && (
           <AudioPlayer 
              textToPlay={message.rawContent} 
              className="absolute -bottom-3 -right-3 h-7 w-7 bg-accent text-accent-foreground opacity-0 group-hover:opacity-100 transition-opacity"
            />
        )}
      </div>
      {!isBot && (
        <Avatar className="h-9 w-9 border border-primary/20">
          <AvatarFallback className="bg-secondary text-secondary-foreground">
            <User className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
