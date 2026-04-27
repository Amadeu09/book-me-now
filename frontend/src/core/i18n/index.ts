import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ca, { TranslationKeys } from './locales/ca';
import es from './locales/es';

type Lang = 'ca' | 'es';

const LANG_KEY = 'lang';

const TRANSLATIONS: Record<Lang, Record<TranslationKeys, string>> = { ca, es };

interface LanguageContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TranslationKeys) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'ca',
  setLang: () => {},
  t: (key) => ca[key],
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('ca');

  useEffect(() => {
    AsyncStorage.getItem(LANG_KEY).then((stored) => {
      if (stored === 'ca' || stored === 'es') setLangState(stored);
    });
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    AsyncStorage.setItem(LANG_KEY, l);
  }, []);

  const t = useCallback(
    (key: TranslationKeys): string => TRANSLATIONS[lang][key] ?? ca[key],
    [lang],
  );

  return React.createElement(LanguageContext.Provider, { value: { lang, setLang, t } }, children);
}

export function useLanguage() {
  return useContext(LanguageContext);
}
