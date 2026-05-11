'use client';

import { useState, useEffect } from 'react';
import { create } from 'zustand';

type UseSpeechOptions = {
  language?: 'en' | 'hi' | 'kn';
};

type SpeechStore = {
  activeSpeakers: Set<string>;
  addSpeaker: (id: string) => void;
  removeSpeaker: (id: string) => void;
  clearSpeakers: () => void;
};

const useSpeechStore = create<SpeechStore>((set) => ({
  activeSpeakers: new Set(),
  addSpeaker: (id) => set((state) => ({ activeSpeakers: new Set(state.activeSpeakers).add(id) })),
  removeSpeaker: (id) => set((state) => {
    const newSet = new Set(state.activeSpeakers);
    newSet.delete(id);
    return { activeSpeakers: newSet };
  }),
  clearSpeakers: () => set({ activeSpeakers: new Set() }),
}));

// Global function to stop all speech
export function stopAllSpeech() {
  window.speechSynthesis.cancel();
  useSpeechStore.getState().clearSpeakers();
}

export function useSpeech({ language = 'en' }: UseSpeechOptions = {}) {
  const [id] = useState(() => Math.random().toString(36).substr(2, 9));
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { addSpeaker, removeSpeaker } = useSpeechStore();

  // Clean up on unmount
  useEffect(() => {
    return () => {
      removeSpeaker(id);
    };
  }, [id, removeSpeaker]);

  const stop = () => {
    setIsPlaying(false);
    removeSpeaker(id);
    window.speechSynthesis.cancel();
  };

  const speak = async (text: string) => {
    try {
      setIsLoading(true);
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Language code mapping
      const langCode = {
        en: 'en-US',
        hi: 'hi-IN',
        kn: 'kn-IN',
      }[language] || 'en-US';

      utterance.lang = langCode;

      // Get available voices and try to find one matching the language
      const voices = await new Promise<SpeechSynthesisVoice[]>((resolve) => {
        // If voices are already loaded
        const voices = window.speechSynthesis.getVoices();
        if (voices.length) {
          resolve(voices);
          return;
        }

        // If voices need to be loaded
        window.speechSynthesis.onvoiceschanged = () => {
          resolve(window.speechSynthesis.getVoices());
        };
      });

      // Try to find a voice that matches our language code
      const voice = voices.find(
        voice => voice.lang.startsWith(langCode) ||
                // Fallback to any voice that starts with the language code
                voice.lang.startsWith(langCode.split('-')[0])
      );

      if (voice) {
        utterance.voice = voice;
      }

      // Stop any other playing speech
      window.speechSynthesis.cancel();
      useSpeechStore.getState().clearSpeakers();

      // Event handlers
      utterance.onstart = () => {
        setIsPlaying(true);
        setIsLoading(false);
        addSpeaker(id);
      };

      utterance.onend = () => {
        setIsPlaying(false);
        setIsLoading(false);
        removeSpeaker(id);
      };

      utterance.onerror = () => {
        setIsPlaying(false);
        setIsLoading(false);
        removeSpeaker(id);
      };

      // Start speaking
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Speech synthesis error:', error);
      setIsPlaying(false);
      setIsLoading(false);
      removeSpeaker(id);
    }
  };

  return {
    speak,
    stop,
    isPlaying,
    isLoading,
    hasActiveSpeakers: useSpeechStore((state) => state.activeSpeakers.size > 0),
  };
}