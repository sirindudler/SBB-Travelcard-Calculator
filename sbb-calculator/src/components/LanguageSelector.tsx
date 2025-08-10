import React from 'react';
import { Globe } from 'lucide-react';
import { Language } from '../translations';

interface LanguageSelectorProps {
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
  t: (key: string) => string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage,
  onLanguageChange,
  t
}) => {
  const languages: { code: Language; name: string; flag: string }[] = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' }
  ];

  return (
    <div className="flex items-center gap-2">
      <Globe size={18} className="text-gray-600" />
      <select
        value={currentLanguage}
        onChange={(e) => onLanguageChange(e.target.value as Language)}
        className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none bg-white text-sm"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};