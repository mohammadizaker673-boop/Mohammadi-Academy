
import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { TRANSLATIONS } from '../constants';
import { Language } from '../types';

interface Props {
  lang: Language;
}

const AdmissionForm: React.FC<Props> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    studentName: '',
    age: '',
    parentName: '',
    phone: '',
    course: '',
    schedule: 'Morning',
    gender: 'Male'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Save to Firestore admissionRequests collection
      await addDoc(collection(db, 'admissionRequests'), {
        studentName: formData.studentName,
        age: parseInt(formData.age),
        parentName: formData.parentName,
        phone: formData.phone,
        course: formData.course,
        schedule: formData.schedule,
        gender: formData.gender,
        status: 'pending',
        submittedAt: new Date().toISOString(),
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting admission:', error);
      alert('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-sky-900/20 border border-primary-400/30 p-12 rounded-[3.5rem] text-center backdrop-blur-3xl animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-primary-500/20 text-primary-400 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-sky-400/20">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
        </div>
        <h3 className="text-3xl font-black text-white mb-4 tracking-tight">{t.form.success}</h3>
        <p className="text-sky-100 mb-10 max-w-sm mx-auto font-medium leading-relaxed">{t.form.successSub}</p>
        <button onClick={() => setSubmitted(false)} className="px-10 py-4 bg-primary-500 hover:bg-primary-400 text-white font-black rounded-2xl transition-all shadow-xl shadow-primary-900/40">
           {lang === 'en' ? 'Register Another Student' : 'تسجيل طالب آخر'}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#1e293b]/60 backdrop-blur-3xl p-10 sm:p-20 rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] border border-white/20 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary-400/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-primary-400/15 transition-all duration-1000"></div>
      
      <div className="text-center mb-16">
        <h2 className="text-4xl font-black text-white mb-4 tracking-tight">{t.form.title}</h2>
        <p className="text-xs font-bold text-primary-300 uppercase tracking-widest">Your Spiritual Education Begins Here</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {[
          { id: 'studentName', label: t.form.studentName, type: 'text' },
          { id: 'age', label: t.form.age, type: 'number' },
          { id: 'parentName', label: t.form.parentName, type: 'text' },
          { id: 'phone', label: t.form.phone, type: 'tel' }
        ].map(field => (
          <div key={field.id} className="relative">
            <label className="block text-[10px] font-black text-primary-400 mb-3 uppercase tracking-[0.2em]">{field.label}</label>
            <input 
              required
              type={field.type} 
              className="w-full px-6 py-5 bg-white/10 border border-white/20 rounded-[1.2rem] focus:ring-2 focus:ring-primary-400/50 focus:border-primary-400 focus:bg-white/15 outline-none transition-all text-white text-sm font-medium placeholder:text-slate-500"
              value={(formData as any)[field.id]}
              onChange={(e) => setFormData({...formData, [field.id]: e.target.value})}
            />
          </div>
        ))}
        
        <div className="relative">
          <label className="block text-[10px] font-black text-primary-400 mb-3 uppercase tracking-[0.2em]">{t.form.selectCourse}</label>
          <div className="relative">
             <select 
               required
               className="w-full px-6 py-5 bg-white/10 border border-white/20 rounded-[1.2rem] focus:ring-2 focus:ring-primary-400/50 focus:border-primary-400 focus:bg-white/15 outline-none transition-all text-white text-sm font-medium appearance-none cursor-pointer"
               value={formData.course}
               onChange={(e) => setFormData({...formData, course: e.target.value})}
             >
               <option value="" className="bg-[#1e293b]">-- Select --</option>
               <option value="Tajweed" className="bg-[#1e293b]">{t.courses.c1}</option>
               <option value="Tafsir" className="bg-[#1e293b]">{t.courses.c2}</option>
               <option value="Noorani" className="bg-[#1e293b]">{t.courses.c3}</option>
               <option value="Hifz" className="bg-[#1e293b]">{t.courses.c4}</option>
               <option value="Arabic" className="bg-[#1e293b]">{t.courses.c5}</option>
               <option value="Islamic" className="bg-[#1e293b]">{t.courses.c6}</option>
             </select>
             <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-primary-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg>
             </div>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-primary-400 mb-3 uppercase tracking-[0.2em]">Gender</label>
          <div className="flex gap-10 mt-5">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="radio" 
                checked={formData.gender === 'Male'}
                onChange={() => setFormData({...formData, gender: 'Male'})}
                className="w-5 h-5 accent-sky-400 bg-white/10 border-white/20"
              />
              <span className="text-sm font-bold text-slate-300 group-hover:text-primary-400 transition-colors">Male</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="radio" 
                checked={formData.gender === 'Female'}
                onChange={() => setFormData({...formData, gender: 'Female'})}
                className="w-5 h-5 accent-sky-400 bg-white/10 border-white/20"
              />
              <span className="text-sm font-bold text-slate-300 group-hover:text-primary-400 transition-colors">Female</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-primary-400 mb-3 uppercase tracking-[0.2em]">{t.form.schedule}</label>
          <div className="flex gap-10 mt-5">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="radio" 
                checked={formData.schedule === 'Morning'}
                onChange={() => setFormData({...formData, schedule: 'Morning'})}
                className="w-5 h-5 accent-sky-400 bg-white/10 border-white/20"
              />
              <span className="text-sm font-bold text-slate-300 group-hover:text-primary-400 transition-colors">{t.form.morning}</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="radio" 
                checked={formData.schedule === 'Evening'}
                onChange={() => setFormData({...formData, schedule: 'Evening'})}
                className="w-5 h-5 accent-sky-400 bg-white/10 border-white/20"
              />
              <span className="text-sm font-bold text-slate-300 group-hover:text-primary-400 transition-colors">{t.form.evening}</span>
            </label>
          </div>
        </div>
      </div>

      <button 
        type="submit"
        className="mt-16 w-full bg-primary-500 hover:bg-primary-400 text-white font-black py-6 rounded-[1.5rem] transition-all shadow-2xl shadow-primary-500/30 active:scale-[0.98] uppercase tracking-[0.3em] text-xs"
      >
        {t.form.submit}
      </button>
    </form>
  );
};

export default AdmissionForm;
