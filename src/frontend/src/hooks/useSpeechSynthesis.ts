import { useState, useEffect, useCallback, useRef } from 'react';

interface UseSpeechSynthesisOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  onEnd?: () => void;
}

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [rate, setRate] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const onEndCallbackRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    setIsSupported('speechSynthesis' in window);
  }, []);

  const speak = useCallback(
    (text: string, options?: UseSpeechSynthesisOptions) => {
      if (!isSupported || !text) return;

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = options?.lang || 'zh-CN';
      utterance.rate = options?.rate ?? rate;
      utterance.pitch = options?.pitch ?? pitch;

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        if (onEndCallbackRef.current) {
          onEndCallbackRef.current();
        }
        if (options?.onEnd) {
          options.onEnd();
        }
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
      };

      utteranceRef.current = utterance;
      onEndCallbackRef.current = options?.onEnd || null;

      window.speechSynthesis.speak(utterance);
    },
    [isSupported, rate, pitch]
  );

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);

  const setOnEndCallback = useCallback((callback: (() => void) | null) => {
    onEndCallbackRef.current = callback;
  }, []);

  return {
    speak,
    stop,
    isSpeaking,
    isSupported,
    rate,
    setRate,
    pitch,
    setPitch,
    setOnEndCallback,
  };
}
