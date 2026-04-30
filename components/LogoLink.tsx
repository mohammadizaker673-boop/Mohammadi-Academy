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
    <Link to="/" className={`flex items-center gap-3 ${className}`} aria-label="Go to home">
      <div className="relative flex items-center justify-center">
        <img
          src={logoImage}
          alt="Mohammadi Academy logo"
          className={`${sizeClass} w-auto object-contain drop-shadow-xl`}
          style={{ mixBlendMode: 'screen' }}
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

