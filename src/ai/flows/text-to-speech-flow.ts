
'use client';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const TextToSpeechInputSchema = z.object({
  text: z.string(),
  language: z.enum(['en', 'hi', 'kn']),
});

const TextToSpeechOutputSchema = z.object({
  media: z.string().describe("The status of speech synthesis"),
});

export type TextToSpeechInput = z.infer<typeof TextToSpeechInputSchema>;
export type TextToSpeechOutput = z.infer<typeof TextToSpeechOutputSchema>;

// Function to get the appropriate language code and voice settings
function getVoiceConfig(language: string): { lang: string; voiceNames: string[]; pitch: number; rate: number } {
  switch (language) {
    case 'hi':
      return { 
        lang: 'hi-IN',
        voiceNames: [
          'Google हिन्दी',
          'Microsoft Swara Online (Natural) - Hindi (India)',
          'Microsoft Madhur Online (Natural) - Hindi (India)',
          'Hindi India'
        ],
        pitch: 1,
        rate: 0.95 // Slightly faster for better engagement
      };
    case 'kn':
      return { 
        lang: 'kn-IN',
        voiceNames: [
          'Google ಕನ್ನಡ',
          'Microsoft Srusti Online (Natural) - Kannada (India)',
          'Microsoft Vaani Online (Natural) - Kannada (India)',
          'Kannada India'
        ],
        pitch: 1,
        rate: 0.95
      };
    default:
      return { 
        lang: 'en-US',
        voiceNames: [
          'Microsoft Guy Online (Natural) - English (US)',
          'Google US English',
          'Microsoft David Online (Natural) - English (US)',
          'Microsoft Mark Online (Natural) - English (US)',
          'Microsoft Christopher Online (Natural) - English (US)',
          'Microsoft Eric Online (Natural) - English (US)',
          'Microsoft Jenny Online (Natural) - English (US)',
          'Alex', // High-quality macOS voice
          'Samantha' // High-quality macOS voice
        ],
        pitch: 1,
        rate: 1
      };
  }
}

// Score a voice based on various quality factors
function scoreVoice(voice: SpeechSynthesisVoice, config: ReturnType<typeof getVoiceConfig>): number {
  let score = 0;
  
  // Prefer exact name matches from our preferred list
  const nameMatchIndex = config.voiceNames.indexOf(voice.name);
  if (nameMatchIndex !== -1) {
    score += 100 - nameMatchIndex; // Earlier in list = higher score
  }

  // Prefer exact language matches
  if (voice.lang === config.lang) {
    score += 50;
  } else if (voice.lang.startsWith(config.lang.split('-')[0])) {
    score += 30; // Same primary language
  }

  // Prefer natural/neural voices
  if (voice.name.toLowerCase().includes('natural') || 
      voice.name.toLowerCase().includes('neural') ||
      voice.name.toLowerCase().includes('online')) {
    score += 40;
  }

  // Prefer non-default voices (they're usually better quality)
  if (!voice.default) {
    score += 20;
  }

  return score;
}

// Find the best available voice
function findBestVoice(language: string): SpeechSynthesisVoice | null {
  const voices = speechSynthesis.getVoices();
  const config = getVoiceConfig(language);
  
  // Score and sort all available voices
  const scoredVoices = voices
    .map(voice => ({
      voice,
      score: scoreVoice(voice, config)
    }))
    .sort((a, b) => b.score - a.score);

  // Use the highest scoring voice, or fall back to any matching language
  return (
    scoredVoices[0]?.voice ||
    voices.find(v => v.lang === config.lang) ||
    voices.find(v => v.lang.startsWith(config.lang.split('-')[0])) ||
    voices[0] ||
    null
  );
}

// Ensure proper cleanup of previous speech
function stopPreviousSpeech() {
  return new Promise<void>(resolve => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
      const checkStopped = setInterval(() => {
        if (!speechSynthesis.speaking) {
          clearInterval(checkStopped);
          resolve();
        }
      }, 100);
    } else {
      resolve();
    }
  });
}

// Split text into readable chunks
function splitIntoChunks(text: string): string[] {
  // Remove extra whitespace and normalize punctuation
  const cleanText = text.replace(/\s+/g, ' ').trim();
  
  // Split by sentences while preserving punctuation
  const sentences = cleanText.match(/[^.!?]+[.!?]+/g) || [cleanText];
  
  // Group sentences into chunks of reasonable length
  const chunks: string[] = [];
  let currentChunk = '';
  
  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length < 100) {
      currentChunk += sentence;
    } else {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = sentence;
    }
  }
  if (currentChunk) chunks.push(currentChunk.trim());
  
  return chunks;
}

export const textToSpeech = ai.defineFlow(
  {
    name: 'textToSpeechFlow',
    inputSchema: TextToSpeechInputSchema,
    outputSchema: TextToSpeechOutputSchema,
  },
  async ({ text, language }) => {
    try {
      // Cancel any ongoing speech
      await stopPreviousSpeech();

      // Get voice configuration and best available voice
      const config = getVoiceConfig(language);
      const voice = findBestVoice(language);

      if (!voice) {
        throw new Error(`No suitable voice found for language: ${language}`);
      }

      console.log(`Selected voice: ${voice.name} (${voice.lang})`);

      // Pre-process text for better speech
      const processedText = text
        .replace(/([.!?])\s+/g, '$1\n\n') // Add pauses after sentences
        .replace(/([,;:])\s+/g, '$1 ') // Slight pauses for punctuation
        .replace(/(\d+)/g, (match) => match.split('').join(' ')); // Better number pronunciation

      // Split into manageable chunks
      const chunks = splitIntoChunks(processedText);
      
      // Create and queue utterances with enhanced properties
      let isFirst = true;
      for (const chunk of chunks) {
        const utterance = new SpeechSynthesisUtterance(chunk);
        
        // Set voice and language
        utterance.voice = voice;
        utterance.lang = config.lang;
        
        // Fine-tune speech parameters
        utterance.rate = config.rate;
        utterance.pitch = config.pitch;
        utterance.volume = 1.0; // Full volume for clarity
        
        // Add error handling
        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event);
          speechSynthesis.cancel();
        };

        // Handle the first chunk
        if (isFirst) {
          utterance.onstart = () => {
            console.log('Speech started with voice:', voice.name);
          };
          utterance.onend = () => {
            console.log('First chunk completed');
          };
          isFirst = false;
        }

        // Queue the utterance
        speechSynthesis.speak(utterance);
      }

      return {
        media: 'speech-synthesis-active'
      };
    } catch (error) {
      console.error('Text-to-speech error:', error);
      throw error;
    }
  });
