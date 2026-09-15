import React, { useState, useEffect } from 'react';
import { socket } from '../socket';

interface TranslatedTextProps {
  originalText: string;
  senderLanguage?: string;
  userLanguage: string;
}

export function TranslatedText({ originalText, senderLanguage, userLanguage }: TranslatedTextProps) {
  const [translated, setTranslated] = useState<string>(originalText);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // If the sender's language is the same as the user's language, or it's a system message, don't translate
    if (!senderLanguage || senderLanguage === userLanguage || !originalText) {
      setTranslated(originalText);
      return;
    }

    setLoading(true);
    socket.emit("request_translation", { text: originalText, targetLang: userLanguage }, (res: any) => {
      if (res && res.translatedText) {
        setTranslated(res.translatedText);
      } else {
        setTranslated(originalText);
      }
      setLoading(false);
    });
  }, [originalText, senderLanguage, userLanguage]);

  return (
    <span className={loading ? 'opacity-70 transition-opacity' : 'transition-opacity'}>
      {translated}
    </span>
  );
}
