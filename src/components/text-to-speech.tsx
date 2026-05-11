'use client';

import { Button } from './ui/button';
import { Loader2, Square, Volume2 } from 'lucide-react';
import { useSpeech } from '@/hooks/use-speech';

interface TextToSpeechProps {
  text: string;
  language?: 'en' | 'hi' | 'kn';
}

export function TextToSpeech({ text, language = 'en' }: TextToSpeechProps) {
  const { speak, stop, isPlaying, isLoading } = useSpeech({ language });

  const handleAudio = () => {
    if (isPlaying) {
      stop();
    } else {
      speak(text);
    }
  };

  return (
    <Button onClick={handleAudio} variant="ghost" size="icon" disabled={isLoading}>
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isPlaying ? (
        <Square className="h-4 w-4" />
      ) : (
        <Volume2 className="h-4 w-4" />
      )}
      <span className="sr-only">{isPlaying ? 'Stop' : 'Read aloud'}</span>
    </Button>
  );
}