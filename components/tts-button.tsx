'use client';

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

const languageMap: Record<string, string> = {
  en: "en-US",
  de: "de-DE",
  es: "es-ES",
  fr: "fr-FR",
  it: "it-IT",
  ru: "ru-RU",
  tr: "tr-TR",
  uk: "uk-UA",
};

type TtsButtonProps = {
  text: string;
  locale: string;
  label: string;
  stopLabel: string;
};

export const TtsButton = ({ text, locale, label, stopLabel }: TtsButtonProps) => {
  const [supported, setSupported] = useState(true);
  const [speaking, setSpeaking] = useState(false);

  const resolvedLang = useMemo(() => languageMap[locale] || locale || "en-US", [locale]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const available = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
    setSupported(available);
    return () => {
      if (available) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (!supported || typeof window === "undefined") return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [supported, text, resolvedLang]);

  const handleClick = () => {
    if (!supported || typeof window === "undefined") return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = resolvedLang;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleClick}
      disabled={!supported || !text}
      aria-pressed={speaking}
    >
      {speaking ? stopLabel : label}
    </Button>
  );
};







