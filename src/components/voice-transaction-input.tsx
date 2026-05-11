'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';


interface VoiceTransactionData {
  description: string;
  amount: number;
  type: 'revenue' | 'expense';
}

interface VoiceTransactionInputProps {
  onTransactionRecognized: (data: VoiceTransactionData) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VoiceTransactionInput({ 
  onTransactionRecognized, 
  isOpen, 
  onOpenChange 
}: VoiceTransactionInputProps) {
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [language, setLanguage] = useState('en-IN');
  const [recognizedData, setRecognizedData] = useState<VoiceTransactionData | null>(null);
  const [listeningStep, setListeningStep] = useState<'description' | 'amount' | 'type' | 'verify'>('description');
  const [tempDescription, setTempDescription] = useState('');
  const [tempAmount, setTempAmount] = useState('');
  const recognitionRef = useRef<any>(null);

  // Initialize Web Speech API
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onstart = () => {
        setTranscript('');
        setIsListening(true);
      };

      recognitionRef.current.onresult = (event: any) => {
        let interim_transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            interim_transcript += transcript + ' ';
          } else {
            interim_transcript += transcript;
          }
        }
        setTranscript(interim_transcript.trim());
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: `Speech recognition error: ${event.error}`,
        });
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [toast]);

  const startListening = (useEnglish = false) => {
    if (!recognitionRef.current) {
      toast({
        variant: 'destructive',
        title: 'Not Supported',
        description: 'Speech recognition is not supported in your browser.',
      });
      return;
    }

    // Use English for language selection, otherwise use selected language
    const listeningLang = useEnglish ? 'en-US' : language;
    recognitionRef.current.lang = listeningLang;
    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const processTranscript = () => {
    if (!transcript.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No speech detected. Please try again.',
      });
      return;
    }

    if (listeningStep === 'description') {
      setTempDescription(transcript);
      setListeningStep('amount');
      setTranscript('');
      toast({
        title: 'Description Recorded',
        description: `Recorded: "${transcript}"`,
      });
    } else if (listeningStep === 'amount') {
      // Extract number from transcript
      const numberMatch = transcript.match(/\d+(?:\.\d+)?/);
      if (numberMatch) {
        setTempAmount(numberMatch[0]);
        setListeningStep('type');
        setTranscript('');
        toast({
          title: 'Amount Recorded',
          description: `Amount: ₹${numberMatch[0]}`,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not detect amount. Please say a number.',
        });
      }
    } else if (listeningStep === 'type') {
      const lowerTranscript = transcript.toLowerCase();
      const type = lowerTranscript.includes('sent') || lowerTranscript.includes('expense') || lowerTranscript.includes('spent')
        ? 'expense'
        : 'revenue';

      const data: VoiceTransactionData = {
        description: tempDescription,
        amount: parseFloat(tempAmount),
        type,
      };
      setRecognizedData(data);
      setListeningStep('verify');
      setTranscript('');
    }
  };

  const handleConfirm = () => {
    if (recognizedData) {
      onTransactionRecognized(recognizedData);
      resetDialog();
      onOpenChange(false);
      toast({
        title: 'Transaction Added',
        description: `${recognizedData.type === 'revenue' ? 'Revenue' : 'Expense'} of ₹${recognizedData.amount} recorded.`,
      });
    }
  };

  const handleCancel = () => {
    resetDialog();
    onOpenChange(false);
  };

  const resetDialog = () => {
    setListeningStep('description');
    setTempDescription('');
    setTempAmount('');
    setTranscript('');
    setRecognizedData(null);
    stopListening();
  };


  const languageLabels: { [key: string]: string } = {
    'en-IN': '🇮🇳 English (India)',
    'hi-IN': '🇮🇳 हिंदी (Hindi)',
    'en-US': '🇺🇸 English (US)',
    'kn-IN': '🇮🇳 ಕನ್ನಡ (Kannada)',
  };

  const languageKeywords: { [key: string]: string[] } = {
    'en-IN': ['english', 'india', 'indian', 'english india'],
    'hi-IN': ['hindi', 'hindi language', 'हिंदी'],
    'en-US': ['english us', 'american', 'usa', 'english american'],
    'kn-IN': ['kannada', 'kannada language', 'ಕನ್ನಡ'],
  };

  const selectLanguageByVoice = () => {
    setTranscript('');
    if (recognitionRef.current) {
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.start();
    }
    toast({
      title: 'Say Language',
      description: 'Say: English, Hindi, Kannada, or American',
    });
  };

  const processLanguageSelection = () => {
    if (!transcript.trim()) return;

    const spokenText = transcript.toLowerCase();
    let selectedLang = language;
    let found = false;

    for (const [langCode, keywords] of Object.entries(languageKeywords)) {
      if (keywords.some(keyword => spokenText.includes(keyword))) {
        selectedLang = langCode;
        found = true;
        break;
      }
    }

    if (found) {
      setLanguage(selectedLang);
      toast({
        title: 'Language Selected',
        description: `${languageLabels[selectedLang]}`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Language Not Recognized',
        description: 'Please say: English, Hindi, Spanish, or French',
      });
    }
    setTranscript('');
    stopListening();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Voice Transaction Entry</DialogTitle>
          <DialogDescription>
            Use your microphone to add transactions by voice
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Language Selection */}
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Language</label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(languageLabels).map(([code, label]) => (
                    <SelectItem key={code} value={code}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={selectLanguageByVoice}
              disabled={isListening}
              size="icon"
              className="bg-purple-600 hover:bg-purple-700"
              title="Say language name"
            >
              <Mic className="h-4 w-4" />
            </Button>
            {isListening && listeningStep === 'description' && transcript && (
              <Button
                onClick={processLanguageSelection}
                disabled={!transcript.trim()}
                size="icon"
                className="bg-green-600 hover:bg-green-700"
                title="Confirm language selection"
              >
                <Check className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Language Selection Feedback */}
          {isListening && listeningStep === 'description' && !recognizedData && (
            <div className="bg-purple-100 border border-purple-300 rounded-lg p-4 space-y-3">
              <div>
                <p className="text-sm font-semibold text-purple-900">
                  <Badge className="bg-purple-600 mb-2 mr-2">
                    <Mic className="h-3 w-3 mr-1" />
                    Listening for language
                  </Badge>
                </p>
                <p className="text-sm text-purple-800">You said: <strong>{transcript || 'listening...'}</strong></p>
              </div>
              <div className="bg-white p-2 rounded text-xs space-y-1">
                <p className="font-semibold text-purple-700">Say one of these:</p>
                <p>🇮🇳 "English" (for English India)</p>
                <p>🇮🇳 "Hindi" (for हिंदी)</p>
                <p>�🇳 "Kannada" (for ಕನ್ನಡ)</p>
                <p>🇺🇸 "American" (for English US)</p>
              </div>
            </div>
          )}

          {/* Instructions */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">What to Say - Examples</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-700 space-y-3">
              {listeningStep === 'description' && (
                <>
                  <p>🎤 <strong>Step 1: Say the Description</strong></p>
                  <p className="ml-6 text-gray-600">What was the transaction about?</p>
                  <div className="ml-6 bg-blue-50 p-2 rounded text-xs space-y-1">
                    <p>✓ "Cash sale"</p>
                    <p>✓ "Office supplies"</p>
                    <p>✓ "Salary payment"</p>
                    <p>✓ "Customer payment"</p>
                    <p>✓ "Rent payment"</p>
                    <p>✓ "Inventory purchase"</p>
                  </div>
                </>
              )}
              {listeningStep === 'amount' && (
                <>
                  <p>💰 <strong>Step 2: Say the Amount</strong></p>
                  <p className="ml-6 text-gray-600">How much money? (Just the number)</p>
                  <div className="ml-6 bg-green-50 p-2 rounded text-xs space-y-1">
                    <p>✓ "Five hundred"</p>
                    <p>✓ "1250"</p>
                    <p>✓ "3000 rupees"</p>
                    <p>✓ "Two fifty"</p>
                    <p>✓ "Fifteen hundred"</p>
                    <p>✓ "5000"</p>
                  </div>
                </>
              )}
              {listeningStep === 'type' && (
                <>
                  <p>📤 <strong>Step 3: Say Received or Sent</strong></p>
                  <p className="ml-6 text-gray-600">Was money coming in or going out?</p>
                  <div className="ml-6 bg-purple-50 p-2 rounded text-xs space-y-1">
                    <p className="text-green-700"><strong>For INCOME (Money received):</strong></p>
                    <p>✓ "Received"</p>
                    <p>✓ "Income"</p>
                    <p>✓ "Got"</p>
                    <p className="text-red-700 mt-2"><strong>For EXPENSE (Money sent):</strong></p>
                    <p>✓ "Sent"</p>
                    <p>✓ "Spent"</p>
                    <p>✓ "Paid"</p>
                    <p>✓ "Expense"</p>
                  </div>
                </>
              )}
              {listeningStep === 'verify' && (
                <>
                  <p>✅ <strong>Review & Confirm</strong></p>
                  <p className="ml-6 text-gray-600">Check details below. If correct, click "Add Transaction"</p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Listening Status */}
          {listeningStep !== 'verify' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium">
                  {listeningStep === 'description' && '📝 Description'}
                  {listeningStep === 'amount' && '💵 Amount'}
                  {listeningStep === 'type' && '🔄 Type (Received/Sent)'}
                </label>
                {isListening && (
                  <Badge className="bg-red-500 animate-pulse">
                    <Mic className="h-3 w-3 mr-1" />
                    Listening...
                  </Badge>
                )}
              </div>

              <div className="bg-gray-100 border-2 border-gray-300 rounded-lg p-4 min-h-[80px] flex flex-col justify-center">
                {transcript ? (
                  <p className="text-lg font-medium text-gray-800">{transcript}</p>
                ) : (
                  <p className="text-gray-400 italic">
                    {isListening ? 'Listening...' : 'Press the microphone button and start speaking...'}
                  </p>
                )}
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  onClick={() => startListening()}
                  disabled={isListening}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Mic className="h-4 w-4 mr-2" />
                  {isListening ? 'Listening...' : 'Start Speaking'}
                </Button>
                <Button
                  onClick={stopListening}
                  disabled={!isListening}
                  variant="outline"
                >
                  <MicOff className="h-4 w-4" />
                </Button>
                <Button
                  onClick={processTranscript}
                  disabled={!transcript.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Confirm & Next
                </Button>
              </div>
            </div>
          )}

          {/* Verification Step */}
          {listeningStep === 'verify' && recognizedData && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-base">Review Your Transaction</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Description</p>
                    <p className="font-semibold text-lg">{recognizedData.description}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Amount</p>
                    <p className="font-semibold text-lg text-green-600">₹{recognizedData.amount.toFixed(2)}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Type</p>
                    <Badge className={recognizedData.type === 'revenue' ? 'bg-green-600' : 'bg-red-600'}>
                      {recognizedData.type === 'revenue' ? '📈 Revenue / Received' : '📉 Expense / Sent'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleCancel}
              variant="outline"
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              {listeningStep === 'verify' ? 'Edit' : 'Cancel'}
            </Button>
            {listeningStep === 'verify' && (
              <Button
                onClick={handleConfirm}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4 mr-2" />
                Add Transaction
              </Button>
            )}
            {listeningStep !== 'verify' && (
              <Button
                onClick={() => {
                  resetDialog();
                  setListeningStep('description');
                }}
                variant="outline"
                className="flex-1"
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
