import React, { useState, useRef, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { Language } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

type LanguageSelectorSize = 'compact' | 'default';

interface LanguageSelectorProps {
  size?: LanguageSelectorSize;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ size = 'compact' }) => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isCompact = size === 'compact';

  const languages: { code: Language; label: string; nativeLabel: string }[] = [
    { code: 'en', label: 'English', nativeLabel: 'English' },
    { code: 'ar', label: 'Arabic', nativeLabel: 'العربية' },
    { code: 'fa', label: 'Farsi', nativeLabel: 'فارسی' },
    { code: 'ps', label: 'Pashto', nativeLabel: 'پښتو' },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center rounded-full bg-primary-500 text-white font-black uppercase tracking-wider shadow-lg shadow-primary-400/40 hover:bg-primary-400 transition-all ${
          isCompact ? 'gap-1.5 px-2.5 py-1.5 text-[10px]' : 'gap-2 px-4 py-2 text-[11px]'
        }`}
      >
        <Globe size={isCompact ? 14 : 16} />
        <span>{currentLanguage.code.toUpperCase()}</span>
        <svg 
          width={isCompact ? 10 : 12}
          height={isCompact ? 10 : 12}
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="3"
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        >
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      {isOpen && (
        <div
          className={`absolute right-0 mt-2 bg-[#131b41] border border-white/20 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl z-50 ${
            isCompact ? 'min-w-[120px]' : 'min-w-[160px]'
          }`}
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code);
                setIsOpen(false);
              }}
              className={`w-full text-left transition-all flex items-center justify-between ${
                language === lang.code
                  ? 'bg-primary-500 text-white'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              } ${isCompact ? 'px-4 py-2' : 'px-6 py-3'}`}
            >
              <span className={`${isCompact ? 'text-[10px]' : 'text-[11px]'} font-black uppercase tracking-wider`}>
                {lang.label}
              </span>
              <span
                className={`${isCompact ? 'text-[11px]' : 'text-sm'} ${
                  language === lang.code ? 'font-bold' : ''
                }`}
              >
                {lang.nativeLabel}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
