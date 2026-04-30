import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { TRANSLATIONS } from '../constants';
import { Language } from '../types';

interface Props {
  lang: Language;
}

const StudentRegistrationForm: React.FC<Props> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    studentName: '',
    gender: '' as 'male' | 'female' | '',
    studentAge: '' as number | '',
    parentName: '',
    parentEmail: '',
    phone: '',
    country: '',
    timezone: '',
    preferredTeacherGender: '' as 'male' | 'female' | 'no-preference' | '',
    course: '',
    quranLevel: '' as 'beginner' | 'can-read' | 'tajweed' | 'hifz' | '',
    availableDays: [] as string[],
    preferredTime: '',
    consentGenderSeparated: false,
    consentParentObserve: false,
    consentRespectPolicy: false
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.consentGenderSeparated || !formData.consentParentObserve || !formData.consentRespectPolicy) {
      alert('Please agree to all Islamic guidelines');
      return;
    }

    setSubmitting(true);

    try {
      await addDoc(collection(db, 'studentRegistrations'), {
        ...formData,
        status: 'pending',
        submittedAt: new Date().toISOString(),
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting registration:', error);
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
        <h3 className="text-3xl font-black text-white mb-4 tracking-tight">{t.form.success}</h3>
        <p className="text-sky-100 mb-10 max-w-sm mx-auto font-medium leading-relaxed">{t.form.successSub}</p>
        <button 
          onClick={() => setSubmitted(false)} 
          className="px-10 py-4 bg-primary-500 hover:bg-primary-400 text-white font-black rounded-2xl transition-all shadow-xl shadow-primary-900/40"
        >
          {lang === 'en' ? 'Register Another Student' : 'تسجيل طالب آخر'}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#1e293b]/60 backdrop-blur-3xl p-10 sm:p-20 rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] border border-white/20 relative overflow-hidden">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-black text-white mb-4 tracking-tight">{t.form.title}</h2>
        <p className="text-sm text-primary-300 bg-primary-500/10 border border-primary-400/30 rounded-2xl px-6 py-3 inline-block">
          {t.form.notice}
        </p>
      </div>

      <div className="space-y-8">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-black text-primary-400 mb-2 uppercase tracking-wider">{t.form.studentName}</label>
            <input 
              required
              type="text" 
              className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-primary-400/50 focus:border-primary-400 outline-none transition-all text-white"
              value={formData.studentName}
              onChange={(e) => setFormData({...formData, studentName: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-black text-primary-400 mb-2 uppercase tracking-wider">{t.form.gender}</label>
            <select
              required
              className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-primary-400/50 outline-none text-white"
              value={formData.gender}
              onChange={(e) => setFormData({...formData, gender: e.target.value as 'male' | 'female'})}
            >
              <option value="" className="bg-[#1e293b]">-- {t.form.gender} --</option>
              <option value="male" className="bg-[#1e293b]">{t.form.male}</option>
              <option value="female" className="bg-[#1e293b]">{t.form.female}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-black text-primary-400 mb-2 uppercase tracking-wider">{t.form.studentAgeLabel}</label>
            <input 
              required
              type="number" 
              min="3"
              max="100"
              className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-primary-400/50 outline-none text-white"
              value={formData.studentAge}
              onChange={(e) => setFormData({...formData, studentAge: parseInt(e.target.value)})}
            />
          </div>

          <div>
            <label className="block text-xs font-black text-primary-400 mb-2 uppercase tracking-wider">{t.form.preferredTeacher}</label>
            <select
              required
              className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-primary-400/50 outline-none text-white"
              value={formData.preferredTeacherGender}
              onChange={(e) => setFormData({...formData, preferredTeacherGender: e.target.value as any})}
            >
              <option value="" className="bg-[#1e293b]">-- Select --</option>
              <option value="male" className="bg-[#1e293b]">{t.form.maleTeacher}</option>
              <option value="female" className="bg-[#1e293b]">{t.form.femaleTeacher}</option>
              <option value="no-preference" className="bg-[#1e293b]">{t.form.noPreference}</option>
            </select>
          </div>
        </div>

        {/* Parent Info */}
        <div className="border-t border-white/10 pt-8">
          <h3 className="text-xl font-black text-white mb-6">{t.form.parentSection}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-black text-primary-400 mb-2 uppercase tracking-wider">{t.form.parentName}</label>
              <input 
                required
                type="text" 
                className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-primary-400/50 outline-none text-white"
                value={formData.parentName}
                onChange={(e) => setFormData({...formData, parentName: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-black text-primary-400 mb-2 uppercase tracking-wider">{t.form.parentEmail}</label>
              <input 
                required
                type="email" 
                className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-primary-400/50 outline-none text-white"
                value={formData.parentEmail}
                onChange={(e) => setFormData({...formData, parentEmail: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-black text-primary-400 mb-2 uppercase tracking-wider">{t.form.phone}</label>
              <input 
                required
                type="tel" 
                className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-primary-400/50 outline-none text-white"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-black text-primary-400 mb-2 uppercase tracking-wider">{t.form.country}</label>
              <input 
                required
                type="text" 
                className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-primary-400/50 outline-none text-white"
                value={formData.country}
                onChange={(e) => setFormData({...formData, country: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-black text-primary-400 mb-2 uppercase tracking-wider">{t.form.timezone}</label>
              <input 
                required
                type="text" 
                placeholder="e.g., GMT+3, EST"
                className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-primary-400/50 outline-none text-white placeholder:text-slate-500"
                value={formData.timezone}
                onChange={(e) => setFormData({...formData, timezone: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Course & Level */}
        <div className="border-t border-white/10 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-black text-primary-400 mb-2 uppercase tracking-wider">{t.form.selectCourse}</label>
              <select 
                required
                className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-primary-400/50 outline-none text-white"
                value={formData.course}
                onChange={(e) => setFormData({...formData, course: e.target.value})}
              >
                <option value="" className="bg-[#1e293b]">-- Select --</option>
                <option value="Tajweed" className="bg-[#1e293b]">{t.courses.c1}</option>
                <option value="Hifz" className="bg-[#1e293b]">{t.courses.c2}</option>
                <option value="Tafsir" className="bg-[#1e293b]">{t.courses.c3}</option>
                <option value="Noorani" className="bg-[#1e293b]">{t.courses.c4}</option>
                <option value="Arabic" className="bg-[#1e293b]">{t.courses.c5}</option>
                <option value="Islamic" className="bg-[#1e293b]">{t.courses.c6}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-primary-400 mb-2 uppercase tracking-wider">{t.form.quranLevel}</label>
              <select 
                required
                className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-primary-400/50 outline-none text-white"
                value={formData.quranLevel}
                onChange={(e) => setFormData({...formData, quranLevel: e.target.value as any})}
              >
                <option value="" className="bg-[#1e293b]">-- Select --</option>
                <option value="beginner" className="bg-[#1e293b]">{t.form.beginner}</option>
                <option value="can-read" className="bg-[#1e293b]">{t.form.canRead}</option>
                <option value="tajweed" className="bg-[#1e293b]">{t.form.tajweedLevel}</option>
                <option value="hifz" className="bg-[#1e293b]">{t.form.hifzStudent}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Availability */}
        <div className="border-t border-white/10 pt-8">
          <h3 className="text-xl font-black text-white mb-6">{t.form.availability}</h3>
          <div className="mb-6">
            <label className="block text-xs font-black text-primary-400 mb-3 uppercase tracking-wider">{t.form.availableDays}</label>
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

          <div>
            <label className="block text-xs font-black text-primary-400 mb-2 uppercase tracking-wider">{t.form.preferredTime}</label>
            <input 
              required
              type="text" 
              placeholder="e.g., 3:00 PM - 5:00 PM"
              className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-primary-400/50 outline-none text-white placeholder:text-slate-500"
              value={formData.preferredTime}
              onChange={(e) => setFormData({...formData, preferredTime: e.target.value})}
            />
          </div>
        </div>

        {/* Islamic Consent */}
        <div className="border-t border-white/10 pt-8">
          <h3 className="text-xl font-black text-white mb-6">{t.form.islamicConsent}</h3>
          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                required
                type="checkbox"
                checked={formData.consentGenderSeparated}
                onChange={(e) => setFormData({...formData, consentGenderSeparated: e.target.checked})}
                className="w-5 h-5 accent-sky-400 rounded mt-1"
              />
              <span className="text-sm text-slate-300 group-hover:text-primary-400 transition-colors">{t.form.consentGender}</span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                required
                type="checkbox"
                checked={formData.consentParentObserve}
                onChange={(e) => setFormData({...formData, consentParentObserve: e.target.checked})}
                className="w-5 h-5 accent-sky-400 rounded mt-1"
              />
              <span className="text-sm text-slate-300 group-hover:text-primary-400 transition-colors">{t.form.consentObserve}</span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                required
                type="checkbox"
                checked={formData.consentRespectPolicy}
                onChange={(e) => setFormData({...formData, consentRespectPolicy: e.target.checked})}
                className="w-5 h-5 accent-sky-400 rounded mt-1"
              />
              <span className="text-sm text-slate-300 group-hover:text-primary-400 transition-colors">{t.form.consentRespect}</span>
            </label>
          </div>
        </div>

        <button 
          type="submit"
          disabled={submitting}
          className="w-full bg-primary-500 hover:bg-primary-400 disabled:bg-slate-600 text-white font-black py-6 rounded-2xl transition-all shadow-2xl shadow-primary-500/30 uppercase tracking-wider text-sm"
        >
          {submitting ? 'Submitting...' : t.form.submit}
        </button>
      </div>
    </form>
  );
};

export default StudentRegistrationForm;
