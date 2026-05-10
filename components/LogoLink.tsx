import React from 'react';
import { Link } from 'react-router-dom';
import logoImage from '../Photos/FullLogo.jpg';
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
  const sizeClass = compact ? 'h-8' : 'h-10';

  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`} aria-label="Go to home">
      <div className="relative flex items-center justify-center bg-transparent rounded-2xl px-1 py-0.5">
        <img
          src={logoImage}
          alt="Mohammadi Academy logo"
          className={`${sizeClass} w-auto object-contain bg-transparent select-none`}
          style={{ mixBlendMode: 'multiply', filter: 'drop-shadow(0 6px 12px rgba(15, 23, 42, 0.18))' }}
        />
      </div>
      {showText && (
        <div className="flex flex-col">
            <span className="font-black text-sm tracking-tight leading-none uppercase text-primary-50">{t.shortName}</span>
          <span className="text-[10px] text-primary-300 font-bold tracking-widest uppercase mt-1">Online Academy</span>
        </div>
      )}
    </Link>
  );
};

export default LogoLink;

