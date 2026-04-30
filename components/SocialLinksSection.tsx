import React from 'react';
import { TRANSLATIONS } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import { Facebook, Twitter, Instagram, Linkedin, Youtube, MessageCircle, Send, Music } from 'lucide-react';

interface SocialLink {
  id: string;
  name: string;
  icon: React.ReactNode;
  url: string;
  color: string;
}

export const SocialLinksSection: React.FC = () => {
  const { language } = useLanguage();
  const t = TRANSLATIONS[language];
  const isRTL = language === 'ar' || language === 'fa' || language === 'ps';

  const socialLinks: SocialLink[] = [
    {
      id: 'facebook',
      name: t.socialMedia.facebook,
      icon: <Facebook className="w-6 h-6" />,
      url: 'https://facebook.com/mohammadiacademy',
      color: 'hover:bg-blue-600'
    },
    {
      id: 'twitter',
      name: t.socialMedia.twitter,
      icon: <Twitter className="w-6 h-6" />,
      url: 'https://twitter.com/mohammadiacademy',
      color: 'hover:bg-sky-500'
    },
    {
      id: 'instagram',
      name: t.socialMedia.instagram,
      icon: <Instagram className="w-6 h-6" />,
      url: 'https://instagram.com/mohammadiacademy',
      color: 'hover:bg-pink-600'
    },
    {
      id: 'linkedin',
      name: t.socialMedia.linkedin,
      icon: <Linkedin className="w-6 h-6" />,
      url: 'https://linkedin.com/company/mohammadi-academy',
      color: 'hover:bg-blue-700'
    },
    {
      id: 'youtube',
      name: t.socialMedia.youtube,
      icon: <Youtube className="w-6 h-6" />,
      url: 'https://youtube.com/@mohammadiacademy',
      color: 'hover:bg-red-600'
    },
    {
      id: 'whatsapp',
      name: t.socialMedia.whatsapp,
      icon: <MessageCircle className="w-6 h-6" />,
      url: 'https://wa.me/+93796464640',
      color: 'hover:bg-green-600'
    },
    {
      id: 'telegram',
      name: t.socialMedia.telegram,
      icon: <Send className="w-6 h-6" />,
      url: 'https://t.me/mohammadiacademy',
      color: 'hover:bg-cyan-500'
    },
    {
      id: 'tiktok',
      name: t.socialMedia.tiktok,
      icon: <Music className="w-6 h-6" />,
      url: 'https://tiktok.com/@mohammadiacademy',
      color: 'hover:bg-gray-900'
    },
  ];

  return (
    <section className={`py-16 bg-slate-800 border-y border-slate-700 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{t.socialMedia.title}</h2>
          <p className="text-lg text-slate-300">{t.socialMedia.subtitle}</p>
        </div>

        {/* Social Links Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {socialLinks.map((social) => (
            <a
              key={social.id}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`
                group relative flex flex-col items-center justify-center p-4 rounded-lg
                bg-slate-700 border border-slate-600
                transition duration-300 hover:border-primary-500
                ${social.color}
              `}
              title={social.name}
            >
              <div className="text-white mb-2">{social.icon}</div>
              <span className="text-xs sm:text-sm text-slate-300 text-center group-hover:text-white transition">
                {social.name}
              </span>
              
              {/* Tooltip on hover */}
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition pointer-events-none">
                <div className="bg-slate-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  {t.socialMedia.visitPage}
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <p className="text-slate-400 mb-6">Join our growing community of Quran learners worldwide</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://facebook.com/mohammadiacademy"
              className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition"
            >
              {t.socialMedia.visitPage}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
