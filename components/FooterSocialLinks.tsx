import React from 'react';
import {
  Facebook,
  MessageCircle,
} from 'lucide-react';
import { TRANSLATIONS, WHATSAPP_NUMBER } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';

interface SocialLink {
  id: string;
  name: string;
  icon: React.ReactNode;
  url: string;
  color: string;
  bgColor: string;
}

export const FooterSocialLinks: React.FC = () => {
  const { language } = useLanguage();
  const t = TRANSLATIONS[language];

  // Only links verified to be real: Facebook (Quranultimatetruth) and
  // WhatsApp (+923195807382). The other handles were guesses and are
  // removed rather than shown as if they were the academy's accounts.
  const socialLinks: SocialLink[] = [
    {
      id: 'facebook',
      name: t.socialMedia.facebook,
      icon: <Facebook className="w-4 h-4" />,
      url: 'https://facebook.com/Quranultimatetruth',
      color: 'hover:text-blue-400',
      bgColor: 'hover:bg-blue-400/20'
    },
    {
      id: 'whatsapp',
      name: t.socialMedia.whatsapp,
      icon: <MessageCircle className="w-4 h-4" />,
      url: `https://wa.me/${WHATSAPP_NUMBER}`,
      color: 'hover:text-green-400',
      bgColor: 'hover:bg-green-400/20'
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-xl font-black text-white">{t.socialMedia.title}</h3>
      <div className="flex flex-wrap gap-2">
        {socialLinks.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            title={link.name}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 text-slate-300 ${link.color} ${link.bgColor} border border-slate-600 hover:border-slate-400`}
          >
            {link.icon}
          </a>
        ))}
      </div>
      
      {/* WhatsApp Direct Contact Button */}
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white rounded-lg font-semibold text-sm transition-all duration-300 w-fit"
      >
        <MessageCircle className="w-5 h-5" />
        <span>WhatsApp</span>
      </a>
    </div>
  );
};
