import { useState, useCallback, useRef, useEffect } from 'react';

interface UseVoiceTranscriptionOptions {
  lang?: string;
  continuous?: boolean;
  onResult?: (transcript: string) => void;
  onError?: (error: string) => void;
}

interface UseVoiceTranscriptionReturn {
  isListening: boolean;
  transcript: string;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  isSupported: boolean;
}

export function useVoiceTranscription({
  lang = 'en-US',
  continuous = true,
  onResult,
  onError,
}: UseVoiceTranscriptionOptions = {}): UseVoiceTranscriptionReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const SpeechRecognitionAPI =
    typeof window !== 'undefined'
      ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      : null;

  const isSupported = !!SpeechRecognitionAPI;

  const startListening = useCallback(() => {
    if (!SpeechRecognitionAPI) {
      const msg = 'Speech recognition is not supported in this browser.';
      setError(msg);
      onError?.(msg);
      return;
    }

    setError(null);
    const recognition = new SpeechRecognitionAPI();
    recognition.lang = lang;
    recognition.continuous = continuous;
    recognition.interimResults = false;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        }
      }
      if (finalTranscript) {
        setTranscript((prev) => prev + finalTranscript);
        onResult?.(finalTranscript.trim());
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      let msg = 'An error occurred during speech recognition.';
      if (event.error === 'not-allowed') {
        msg = 'Microphone access was blocked. Please allow microphone permissions.';
      } else if (event.error === 'no-speech') {
        msg = 'No speech was detected. Please try again.';
      } else if (event.error === 'network') {
        msg = 'Network error. Please check your connection.';
      }
      setError(msg);
      onError?.(msg);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [SpeechRecognition, lang, continuous, onResult, onError]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    isSupported,
  };
}
