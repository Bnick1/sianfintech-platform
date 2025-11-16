import React, { createContext, useContext, useState, useEffect } from 'react';
import { languageOptions } from '../utils/languages';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    // Load saved language preference
    const savedLanguage = localStorage.getItem('sian-language');
    if (savedLanguage && languageOptions.some(lang => lang.code === savedLanguage)) {
      setLanguage(savedLanguage);
    }
  }, []);

  const changeLanguage = (langCode) => {
    if (languageOptions.some(lang => lang.code === langCode)) {
      setLanguage(langCode);
      localStorage.setItem('sian-language', langCode);
    }
  };

  const value = {
    language,
    changeLanguage,
    languageOptions
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};