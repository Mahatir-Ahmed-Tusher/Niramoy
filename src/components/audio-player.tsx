
'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { textToSpeech } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Loader2, Volume2, Pause } from 'lucide-react';

interface AudioPlayerProps {
  textToPlay: string | (() => string);
  className?: string;
}

export function AudioPlayer({ textToPlay, className }: AudioPlayerProps) {
  const { toast } = useToast();
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Cleanup audio on component unmount
  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
        setAudio(null);
      }
    };
  }, [audio]);

  const handlePlayAudio = async () => {
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      return;
    }

    const text = typeof textToPlay === 'function' ? textToPlay() : textToPlay;
    if (!text) {
        toast({ variant: 'destructive', title: 'Error', description: 'No text to play.' });
        return;
    }
    
    setIsAudioLoading(true);
    try {
      const result = await textToSpeech({ text });
      if (result.error || !result.audio) {
        toast({ variant: 'destructive', title: 'Error', description: result.error || 'Failed to generate audio.' });
        return;
      }
      const audioInstance = new Audio(result.audio);
      audioInstance.onplay = () => setIsPlaying(true);
      audioInstance.onpause = () => setIsPlaying(false);
      audioInstance.onended = () => {
        setIsPlaying(false);
        setAudio(null); // Allow re-fetching audio
      };
      setAudio(audioInstance);
      audioInstance.play();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'An unexpected error occurred while generating audio.' });
    } finally {
      setIsAudioLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handlePlayAudio}
      className={className}
      aria-label="Play audio"
      disabled={isAudioLoading}
    >
      {isAudioLoading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : isPlaying ? (
        <Pause className="h-5 w-5" />
      ) : (
        <Volume2 className="h-5 w-5" />
      )}
    </Button>
  );
}
