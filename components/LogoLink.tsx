import React from 'react';
import { Link } from 'react-router-dom';
import logoImage from '../Photos/ChatGPT Image May 15, 2026, 02_50_54 PM.png';
import { useLanguage } from '../contexts/LanguageContext';
import { TRANSLATIONS } from '../constants';

interface LogoLinkProps {
  showText?: boolean;
  compact?: boolean;
  className?: string;
}

const LogoLink: React.FC<LogoLinkProps> = ({ showText = true, compact = false, className = '' }) => {
  const { language } = useLanguage();
  const t = TRANSLATIONS[language];
  const sizeClass = compact ? 'h-7' : 'h-9';

  return (
    <Link to="/" className={`flex items-center gap-3 ${className}`} aria-label="Go to home">
      <div className="relative flex items-center justify-center bg-transparent flex-shrink-0 py-1">
        <img
          src={logoImage}
          alt="Mohammadi Academy logo"
          className={`${sizeClass} w-auto object-contain bg-transparent`}
          style={{ filter: 'brightness(1.05) contrast(1.02) drop-shadow(0 8px 16px rgba(15, 23, 42, 0.24))' }}
        />
      </div>
      {showText && (
        <div className="flex flex-col min-w-0">
            <span className="font-black text-sm tracking-tight leading-none uppercase text-primary-50">{t.shortName}</span>
          <span className="text-[10px] text-primary-300 font-bold tracking-widest uppercase mt-1">Online Academy</span>
        </div>
      )}
    </Link>
  );
};

export default LogoLink;

