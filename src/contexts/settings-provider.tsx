'use client';

import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useTheme } from 'next-themes';
import en from '@/lib/locales/en.json';
import bn from '@/lib/locales/bn.json';

type Language = 'en' | 'bn';
type ColorTheme = 'theme-green' | 'theme-brown' | 'theme-blue' | 'theme-lavender';
type BengaliFont = 'font-hind-siliguri' | 'font-solaimanlipi';

interface SettingsContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;
  bengaliFont: BengaliFont;
  setBengaliFont: (font: BengaliFont) => void;
  t: (key: keyof typeof en) => string;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const translations = { en, bn };
const fontClassMap = {
  'font-hind-siliguri': { bengali: 'Hind Siliguri', english: 'PT Sans' },
  'font-solaimanlipi': { bengali: 'SolaimanLipi', english: 'PT Sans' },
};

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('bn');
  const [colorTheme, setColorThemeState] = useState<ColorTheme>('theme-green');
  const [bengaliFont, setBengaliFontState] = useState<BengaliFont>('font-hind-siliguri');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Safe localStorage access
    try {
      const storedLang = localStorage.getItem('language') as Language;
      if (storedLang && (storedLang === 'en' || storedLang === 'bn')) {
        setLanguageState(storedLang);
      }

      const storedTheme = localStorage.getItem('colorTheme') as ColorTheme;
      if (storedTheme && ['theme-green', 'theme-brown', 'theme-blue', 'theme-lavender'].includes(storedTheme)) {
        setColorThemeState(storedTheme);
      }

      const storedFont = localStorage.getItem('bengaliFont') as BengaliFont;
      if (storedFont && ['font-hind-siliguri', 'font-solaimanlipi'].includes(storedFont)) {
        setBengaliFontState(storedFont);
      }
    } catch (error) {
      console.warn('Failed to access localStorage:', error);
    }

    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && typeof document !== 'undefined') {
      try {
        document.body.classList.remove('theme-green', 'theme-brown', 'theme-blue', 'theme-lavender');
        document.body.classList.add(colorTheme);
        localStorage.setItem('colorTheme', colorTheme);
      } catch (error) {
        console.warn('Failed to update theme classes:', error);
      }
    }
  }, [colorTheme, mounted]);
  
  useEffect(() => {
    if (mounted && typeof document !== 'undefined') {
      try {
        const { bengali, english } = fontClassMap[bengaliFont];
        document.documentElement.style.setProperty('--font-bengali', bengali);
        document.documentElement.style.setProperty('--font-english', english);
        localStorage.setItem('bengaliFont', bengaliFont);
      } catch (error) {
        console.warn('Failed to update font properties:', error);
      }
    }
  }, [bengaliFont, mounted]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (mounted && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('language', lang);
      } catch (error) {
        console.warn('Failed to save language to localStorage:', error);
      }
    }
  };

  const setColorTheme = (theme: ColorTheme) => {
    setColorThemeState(theme);
  };
  
  const setBengaliFont = (font: BengaliFont) => {
    setBengaliFontState(font);
  };

  const t = useCallback((key: keyof typeof en): string => {
    return translations[language][key] || translations['en'][key] || key;
  }, [language]);

  const value = {
    language, 
    setLanguage,
    colorTheme, 
    setColorTheme,
    bengaliFont, 
    setBengaliFont,
    t
  };

  // Always render the context provider, even during SSR
  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}
