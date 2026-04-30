import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, MessageCircle } from 'lucide-react';
import LanguageSelector from '../components/LanguageSelector';
import LogoLink from '../components/LogoLink';
import { useLanguage } from '../contexts/LanguageContext';
import { TRANSLATIONS } from '../constants';

const FAQPage: React.FC = () => {
  const { language } = useLanguage();
  const t = TRANSLATIONS[language] || TRANSLATIONS['en'];
  const [expandedItems, setExpandedItems] = useState<number[]>([]);

  useEffect(() => {
    document.documentElement.dir = t?.dir || 'ltr';
    document.documentElement.lang = language;
  }, [language, t]);

  const toggleExpand = (index: number) => {
    setExpandedItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  if (!t || !t.faq) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <p>FAQ translations not available</p>
        </div>
      </div>
    );
  }

  const faqs = t.faq.items || [];

  return (
    <div className="min-h-screen bg-[#050a12]">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#050a12]/80 backdrop-blur-2xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <LogoLink />

          <div className="flex items-center gap-6">
            <LanguageSelector />
            <Link to="/" className="text-slate-300 hover:text-primary-400 text-[11px] font-black uppercase tracking-wider transition-colors">
              Home
            </Link>
            <Link to="/courses" className="text-slate-300 hover:text-primary-400 text-[11px] font-black uppercase tracking-wider transition-colors">
              Courses
            </Link>
            <Link to="/ai-tutor" className="text-slate-300 hover:text-primary-400 text-[11px] font-black uppercase tracking-wider transition-colors">
              AI Teachers
            </Link>
            <Link 
              to="/login"
              className="px-5 py-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-full text-[11px] font-black uppercase tracking-wider shadow-lg hover:from-primary-400 hover:to-accent-400 transition-all"
            >
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400 mb-6">
            {t.faq.title || 'Frequently Asked Questions'}
          </h1>
          <p className="text-xl text-slate-300">
            {t.faq.subtitle || 'Find answers to common questions about our academy'}
          </p>
        </div>
      </div>

      {/* FAQ Items */}
      <div className="max-w-4xl mx-auto px-6 pb-20">
        <div className="space-y-4">
          {faqs.map((faq: any, index: number) => (
            <div
              key={index}
              className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-primary-500/30 transition-all"
            >
              <button
                onClick={() => toggleExpand(index)}
                className="w-full px-6 py-6 flex items-start justify-between gap-4 hover:bg-white/5 transition-colors text-left group"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-white group-hover:text-primary-400 transition-colors">
                    {faq.question}
                  </h3>
                </div>
                <div
                  className={`flex-shrink-0 w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center transition-all transform ${
                    expandedItems.includes(index) ? 'rotate-180' : ''
                  }`}
                >
                  <ChevronDown size={18} className="text-primary-400" />
                </div>
              </button>

              {expandedItems.includes(index) && (
                <div className="px-6 pb-6 border-t border-white/5">
                  <p className="text-slate-300 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-br from-primary-500/20 to-accent-500/20 backdrop-blur-xl border border-primary-400/20 rounded-3xl p-12 text-center">
          <MessageCircle size={48} className="text-primary-400 mx-auto mb-6" />
          <h2 className="text-3xl font-black text-white mb-4">
            {t.faq.ctaTitle || 'Still have questions?'}
          </h2>
          <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
            {t.faq.ctaText || 'Our support team is here to help. Reach out to us anytime!'}
          </p>
          <Link 
            to="/contact"
            className="inline-block px-8 py-4 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-full font-black uppercase tracking-wider shadow-xl hover:from-primary-400 hover:to-accent-400 transition-all"
          >
            {t.faq.ctaButton || 'Contact Us'}
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#050a12] py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-500">
          <p>&copy; 2026 Mohammadi Online Quran Academy. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default FAQPage;

