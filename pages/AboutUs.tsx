import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, Award, Heart, Globe, Star } from 'lucide-react';
import LanguageSelector from '../components/LanguageSelector';
import LogoLink from '../components/LogoLink';
import BackButton from '../components/BackButton';
import { useLanguage } from '../contexts/LanguageContext';
import { TRANSLATIONS } from '../constants';

const AboutUs: React.FC = () => {
  const { language } = useLanguage();
  const t = TRANSLATIONS[language] || TRANSLATIONS['en'];
  
  useEffect(() => {
    const direction = t?.dir || 'ltr';
    document.documentElement.dir = direction;
    document.documentElement.lang = language;
  }, [language, t]);

  if (!t || !t.aboutUs) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 flex items-center justify-center">
        <div className="bg-red-900/20 border-2 border-red-500 rounded-lg p-8 max-w-md">
          <h2 className="text-white text-2xl font-bold mb-2">Error: Content Not Available</h2>
          <p className="text-slate-300 mb-2">Language: <span className="text-primary-400">{language}</span></p>
          <p className="text-slate-300 mb-2">Has aboutUs: <span className="text-primary-400">{t?.aboutUs ? 'Yes' : 'No'}</span></p>
          <p className="text-slate-400 text-sm mt-4">Check browser console (F12) for debug information</p>
          <p className="text-slate-400 text-xs mt-2" style={{whiteSpace: 'pre-wrap'}}>
            {typeof t !== 'undefined' ? `Keys: ${Object.keys(t).slice(0,8).join(', ')}...` : 'T is undefined'}
          </p>
        </div>
      </div>
    );
  }
  
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
            <Link to="/contact" className="text-slate-300 hover:text-primary-400 text-[11px] font-black uppercase tracking-wider transition-colors">
              {t?.common?.contact || 'Contact'}
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
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <BackButton to="/" label="← Back to Home" variant="light" />
          <div className="text-center mt-6">
            <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400 mb-6">
              {t?.aboutUs?.title || 'About Us'}
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              {t?.aboutUs?.subtitle || 'Loading...'}
            </p>
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-400 rounded-xl flex items-center justify-center mb-6">
              <Star className="text-white" size={32} />
            </div>
            <h2 className="text-3xl font-black text-white mb-4">{t.aboutUs.ourMission}</h2>
            <p className="text-slate-300 leading-relaxed">
              {t.aboutUs.missionText}
            </p>
          </div>

          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center mb-6">
              <Heart className="text-white" size={32} />
            </div>
            <h2 className="text-3xl font-black text-white mb-4">{t.aboutUs.ourVision}</h2>
            <p className="text-slate-300 leading-relaxed">
              {t.aboutUs.visionText}
            </p>
          </div>
        </div>
      </div>

      {/* Core Values */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-4xl font-black text-center text-white mb-12">Our Core Values</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="text-white" size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Excellence</h3>
            <p className="text-slate-300 text-sm">
              Committed to providing the highest quality Quranic education with certified teachers and proven methodologies.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="text-white" size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Community</h3>
            <p className="text-slate-300 text-sm">
              Building a supportive learning community where students and teachers grow together in faith and knowledge.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="text-white" size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Authenticity</h3>
            <p className="text-slate-300 text-sm">
              Teaching according to authentic Islamic sources with proper Tajweed rules and scholarly guidance.
            </p>
          </div>
        </div>
      </div>

      {/* What Makes Us Different */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-4xl font-black text-center text-white mb-12">{t.aboutUs.whyChooseUs}</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
              <Award className="text-primary-400" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-2">{t.aboutUs.qualifiedTeachers}</h3>
              <p className="text-slate-300 text-sm">
                {t.aboutUs.qualifiedTeachersDesc}
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 bg-accent-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
              <Globe className="text-accent-400" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-2">{t.aboutUs.flexibleSchedule}</h3>
              <p className="text-slate-300 text-sm">
                {t.aboutUs.flexibleScheduleDesc}
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
              <Users className="text-green-400" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-2">{t.aboutUs.oneOnOne}</h3>
              <p className="text-slate-300 text-sm">
                {t.aboutUs.oneOnOneDesc}
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 bg-accent-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
              <Heart className="text-accent-400" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-2">{t.aboutUs.islamicEnvironment}</h3>
              <p className="text-slate-300 text-sm">
                {t.aboutUs.islamicEnvironmentDesc}
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
              <BookOpen className="text-blue-400" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-2">{t.aboutUs.affordableFees}</h3>
              <p className="text-slate-300 text-sm">
                {t.aboutUs.affordableFeesDesc}
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
              <Star className="text-primary-400" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-2">{t.aboutUs.provenResults}</h3>
              <p className="text-slate-300 text-sm">
                {t.aboutUs.provenResultsDesc}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-br from-primary-500/20 to-accent-500/20 backdrop-blur-xl border border-primary-400/20 rounded-3xl p-12 text-center">
          <h2 className="text-3xl font-black text-white mb-4">
            Ready to Start Your Quran Learning Journey?
          </h2>
          <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
            Join thousands of students worldwide who are learning Quran with us. 
            Start with a free trial class today!
          </p>
          <Link 
            to="/register"
            className="inline-block px-8 py-4 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-full font-black uppercase tracking-wider shadow-xl hover:from-primary-400 hover:to-accent-400 transition-all"
          >
            Register
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#050a12] py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-slate-500 text-sm">
            &copy; 2026 Mohammadi Online Quran Academy. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AboutUs;

