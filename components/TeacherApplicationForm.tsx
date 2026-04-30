import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { TRANSLATIONS } from '../constants';
import { Language } from '../types';

interface Props {
  lang: Language;
}

const TeacherApplicationForm: React.FC<Props> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    gender: '' as 'male' | 'female' | '',
    email: '',
    phone: '',
    country: '',
    tajweedDetails: '',
    experienceYears: '' as number | '',
    languagesTaught: [] as string[],
    teachingPreference: '' as 'kids' | 'adults' | 'both' | '',
    availableDays: [] as string[],
    availableTimes: '',
    consentQuranicManners: false,
    consentNoPrivateChat: false,
    consentAcademyPolicy: false
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const languages = ['English', 'Arabic', 'Urdu', 'Farsi', 'Pashto', 'Turkish', 'Other'];

  const handleDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day]
    }));
  };

  const handleLanguageToggle = (language: string) => {
    setFormData(prev => ({
      ...prev,
      languagesTaught: prev.languagesTaught.includes(language)
        ? prev.languagesTaught.filter(l => l !== language)
        : [...prev.languagesTaught, language]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.consentQuranicManners || !formData.consentNoPrivateChat || !formData.consentAcademyPolicy) {
      alert('Please agree to all Islamic guidelines');
      return;
    }

    if (formData.languagesTaught.length === 0) {
      alert('Please select at least one language you can teach');
      return;
    }

    setSubmitting(true);

    try {
      await addDoc(collection(db, 'teacherApplications'), {
        ...formData,
        status: 'under-review',
        submittedAt: new Date().toISOString(),
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-sky-900/20 border border-primary-400/30 p-12 rounded-[3.5rem] text-center backdrop-blur-3xl animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-primary-500/20 text-primary-400 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-sky-400/20">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <path d="m9 11 3 3L22 4"/>
          </svg>
        </div>
        <h3 className="text-3xl font-black text-white mb-4 tracking-tight">{t.teacherForm.success}</h3>
        <p className="text-sky-100 mb-10 max-w-sm mx-auto font-medium leading-relaxed">{t.teacherForm.successSub}</p>
        <button 
          onClick={() => setSubmitted(false)} 
          className="px-10 py-4 bg-primary-500 hover:bg-primary-400 text-white font-black rounded-2xl transition-all shadow-xl shadow-primary-900/40"
        >
          {lang === 'en' ? 'Submit Another Application' : 'إرسال طلب آخر'}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#1e293b]/60 backdrop-blur-3xl p-10 sm:p-20 rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] border border-white/20 relative overflow-hidden">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-black text-white mb-4 tracking-tight">{t.teacherForm.title}</h2>
        <p className="text-sm text-primary-300 bg-primary-500/10 border border-primary-400/30 rounded-2xl px-6 py-3 inline-block">
          {t.teacherForm.notice}
        </p>
      </div>

      <div className="space-y-8">
        {/* Personal Information */}
        <div>
          <h3 className="text-xl font-black text-white mb-6">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-black text-primary-400 mb-2 uppercase tracking-wider">{t.teacherForm.fullName}</label>
              <input 
                required
                type="text" 
                className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-primary-400/50 focus:border-primary-400 outline-none transition-all text-white"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-black text-primary-400 mb-2 uppercase tracking-wider">{t.teacherForm.gender}</label>
              <select
                required
                className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-primary-400/50 outline-none text-white"
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value as 'male' | 'female'})}
              >
                <option value="" className="bg-[#1e293b]">-- Select --</option>
                <option value="male" className="bg-[#1e293b]">{t.form.male}</option>
                <option value="female" className="bg-[#1e293b]">{t.form.female}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-primary-400 mb-2 uppercase tracking-wider">{t.teacherForm.email}</label>
              <input 
                required
                type="email" 
                className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-primary-400/50 outline-none text-white"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-black text-primary-400 mb-2 uppercase tracking-wider">{t.teacherForm.phone}</label>
              <input 
                required
                type="tel" 
                className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-primary-400/50 outline-none text-white"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-black text-primary-400 mb-2 uppercase tracking-wider">{t.teacherForm.country}</label>
              <input 
                required
                type="text" 
                className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-primary-400/50 outline-none text-white"
                value={formData.country}
                onChange={(e) => setFormData({...formData, country: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Qualifications */}
        <div className="border-t border-white/10 pt-8">
          <h3 className="text-xl font-black text-white mb-6">{t.teacherForm.qualifications}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-black text-primary-400 mb-2 uppercase tracking-wider">{t.teacherForm.tajweedDetails}</label>
              <textarea 
                required
                rows={3}
                className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-primary-400/50 outline-none text-white"
                value={formData.tajweedDetails}
                onChange={(e) => setFormData({...formData, tajweedDetails: e.target.value})}
                placeholder="Describe your Ijazah, certificates, or Tajweed qualifications..."
              />
            </div>

            <div>
              <label className="block text-xs font-black text-primary-400 mb-2 uppercase tracking-wider">{t.teacherForm.experienceYears}</label>
              <input 
                required
                type="number" 
                min="0"
                max="50"
                className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-primary-400/50 outline-none text-white"
                value={formData.experienceYears}
                onChange={(e) => setFormData({...formData, experienceYears: parseInt(e.target.value)})}
              />
            </div>

            <div>
              <label className="block text-xs font-black text-primary-400 mb-3 uppercase tracking-wider">{t.teacherForm.languagesTaught}</label>
              <div className="grid grid-cols-2 gap-3">
                {languages.map(language => (
                  <label key={language} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.languagesTaught.includes(language)}
                      onChange={() => handleLanguageToggle(language)}
                      className="w-5 h-5 accent-sky-400 rounded"
                    />
                    <span className="text-sm text-slate-300 group-hover:text-primary-400 transition-colors">{language}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Teaching Preferences */}
        <div className="border-t border-white/10 pt-8">
          <h3 className="text-xl font-black text-white mb-6">{t.teacherForm.teachingPreferences}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-black text-primary-400 mb-2 uppercase tracking-wider">Teach</label>
              <select 
                required
                className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-primary-400/50 outline-none text-white"
                value={formData.teachingPreference}
                onChange={(e) => setFormData({...formData, teachingPreference: e.target.value as any})}
              >
                <option value="" className="bg-[#1e293b]">-- Select --</option>
                <option value="kids" className="bg-[#1e293b]">{t.teacherForm.teachKids}</option>
                <option value="adults" className="bg-[#1e293b]">{t.teacherForm.teachAdults}</option>
                <option value="both" className="bg-[#1e293b]">{t.teacherForm.teachBoth}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-primary-400 mb-2 uppercase tracking-wider">{t.teacherForm.availableTimes}</label>
              <input 
                required
                type="text" 
                placeholder="e.g., 8 AM - 12 PM, 6 PM - 9 PM"
                className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-primary-400/50 outline-none text-white placeholder:text-slate-500"
                value={formData.availableTimes}
                onChange={(e) => setFormData({...formData, availableTimes: e.target.value})}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-black text-primary-400 mb-3 uppercase tracking-wider">{t.teacherForm.availableDays}</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {days.map(day => (
                  <label key={day} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.availableDays.includes(day)}
                      onChange={() => handleDayToggle(day)}
                      className="w-5 h-5 accent-sky-400 rounded"
                    />
                    <span className="text-sm text-slate-300 group-hover:text-primary-400 transition-colors">{day}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Islamic Agreement */}
        <div className="border-t border-white/10 pt-8">
          <h3 className="text-xl font-black text-white mb-6">{t.teacherForm.islamicAgreement}</h3>
          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                required
                type="checkbox"
                checked={formData.consentQuranicManners}
                onChange={(e) => setFormData({...formData, consentQuranicManners: e.target.checked})}
                className="w-5 h-5 accent-sky-400 rounded mt-1"
              />
              <span className="text-sm text-slate-300 group-hover:text-primary-400 transition-colors">{t.teacherForm.consentManners}</span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                required
                type="checkbox"
                checked={formData.consentNoPrivateChat}
                onChange={(e) => setFormData({...formData, consentNoPrivateChat: e.target.checked})}
                className="w-5 h-5 accent-sky-400 rounded mt-1"
              />
              <span className="text-sm text-slate-300 group-hover:text-primary-400 transition-colors">{t.teacherForm.consentNoChat}</span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                required
                type="checkbox"
                checked={formData.consentAcademyPolicy}
                onChange={(e) => setFormData({...formData, consentAcademyPolicy: e.target.checked})}
                className="w-5 h-5 accent-sky-400 rounded mt-1"
              />
              <span className="text-sm text-slate-300 group-hover:text-primary-400 transition-colors">{t.teacherForm.consentPolicy}</span>
            </label>
          </div>
        </div>

        <button 
          type="submit"
          disabled={submitting}
          className="w-full bg-primary-500 hover:bg-primary-400 disabled:bg-slate-600 text-white font-black py-6 rounded-2xl transition-all shadow-2xl shadow-primary-500/30 uppercase tracking-wider text-sm"
        >
          {submitting ? 'Submitting...' : t.teacherForm.submit}
        </button>
      </div>
    </form>
  );
};

export default TeacherApplicationForm;
