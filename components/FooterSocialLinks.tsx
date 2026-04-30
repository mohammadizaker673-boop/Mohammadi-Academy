import React from 'react';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Youtube, 
  MessageCircle, 
  Send, 
  Music,
  Phone
} from 'lucide-react';
import { TRANSLATIONS, PHONE_NUMBER } from '../constants';
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

  const socialLinks: SocialLink[] = [
    {
      id: 'facebook',
      name: t.socialMedia.facebook,
      icon: <Facebook className="w-4 h-4" />,
      url: 'https://facebook.com/mohammadiacademy',
      color: 'hover:text-blue-400',
      bgColor: 'hover:bg-blue-400/20'
    },
    {
      id: 'twitter',
      name: t.socialMedia.twitter,
      icon: <Twitter className="w-4 h-4" />,
      url: 'https://twitter.com/mohammadiacademy',
      color: 'hover:text-sky-400',
      bgColor: 'hover:bg-sky-400/20'
    },
    {
      id: 'instagram',
      name: t.socialMedia.instagram,
      icon: <Instagram className="w-4 h-4" />,
      url: 'https://instagram.com/mohammadiacademy',
      color: 'hover:text-pink-400',
      bgColor: 'hover:bg-pink-400/20'
    },
    {
      id: 'linkedin',
      name: t.socialMedia.linkedin,
      icon: <Linkedin className="w-4 h-4" />,
      url: 'https://linkedin.com/company/mohammadi-academy',
      color: 'hover:text-blue-500',
      bgColor: 'hover:bg-blue-500/20'
    },
    {
      id: 'youtube',
      name: t.socialMedia.youtube,
      icon: <Youtube className="w-4 h-4" />,
      url: 'https://youtube.com/@mohammadiacademy',
      color: 'hover:text-red-400',
      bgColor: 'hover:bg-red-400/20'
    },
    {
      id: 'whatsapp',
      name: t.socialMedia.whatsapp,
      icon: <MessageCircle className="w-4 h-4" />,
      url: `https://wa.me/${PHONE_NUMBER}`,
      color: 'hover:text-green-400',
      bgColor: 'hover:bg-green-400/20'
    },
    {
      id: 'telegram',
      name: t.socialMedia.telegram,
      icon: <Send className="w-4 h-4" />,
      url: 'https://telegram.me/mohammadiacademy',
      color: 'hover:text-sky-300',
      bgColor: 'hover:bg-sky-300/20'
    },
    {
      id: 'tiktok',
      name: t.socialMedia.tiktok,
      icon: <Music className="w-4 h-4" />,
      url: 'https://tiktok.com/@mohammadiacademy',
      color: 'hover:text-black dark:hover:text-white',
      bgColor: 'hover:bg-black/20 dark:hover:bg-white/20'
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
        href={`https://wa.me/${PHONE_NUMBER}`}
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
