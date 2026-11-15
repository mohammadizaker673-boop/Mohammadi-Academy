import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, CalendarDays, Wallet, MessageCircle, CheckCircle, ArrowRight, Clock } from 'lucide-react';
import LanguageSelector from '../components/LanguageSelector';
import LogoLink from '../components/LogoLink';
import AdmissionForm from '../components/AdmissionForm';
import { useLanguage } from '../contexts/LanguageContext';
import { TRANSLATIONS, WHATSAPP_NUMBER } from '../constants';
import { courses } from '../data/courses';
import { getCourseDetailPath } from '../utils/courseRouting';

const WHATSAPP_TRIAL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  'Assalamu alaikum, I want to book a free trial Quran class.'
)}`;

// The six courses the admission form offers — kept in the same order.
const CORE_COURSE_IDS = [
  'noorani-qaida',
  'quran-tajweed',
  'hifz-quran',
  'quran-translation',
  'arabic-language',
  'islamic-studies',
];

const PLANS = [
  {
    name: '3 classes a week',
    price: 35,
    detail: '3 live one-to-one sessions every week',
    highlight: false,
  },
  {
    name: '5 classes a week',
    price: 55,
    detail: '5 live one-to-one sessions every week',
    highlight: true,
  },
  {
    name: 'Daily classes',
    price: 75,
    detail: 'A live one-to-one session every day',
    highlight: false,
  },
];

const STEPS = [
  {
    icon: BookOpen,
    title: '1. Choose a course',
    text: 'Pick the course that fits the student — from Noorani Qaida for complete beginners to Tajweed, Hifz, Arabic and Islamic Studies.',
  },
  {
    icon: CalendarDays,
    title: '2. Pick a schedule',
    text: 'Morning or evening, at a time that suits your family. Classes are live and one-to-one with a qualified teacher.',
  },
  {
    icon: Wallet,
    title: '3. See the tuition',
    text: 'Simple monthly plans — $35 for 3 classes a week, $55 for 5, or $75 for daily classes. No hidden fees.',
  },
  {
    icon: MessageCircle,
    title: '4. Book a free trial',
    text: 'Try one lesson free before you pay anything. Book on WhatsApp or send the admission form below and we will contact you.',
  },
];

const AdmissionsPage: React.FC = () => {
  const { language } = useLanguage();
  const t = TRANSLATIONS[language] || TRANSLATIONS['en'];

  useEffect(() => {
    document.documentElement.dir = t?.dir || 'ltr';
    document.documentElement.lang = language;
  }, [language, t]);

  const coreCourses = CORE_COURSE_IDS
    .map((id) => courses.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

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
            <Link
              to="/login"
              className="px-5 py-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-full text-[11px] font-black uppercase tracking-wider shadow-lg hover:from-primary-400 hover:to-accent-400 transition-all"
            >
              Login
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Hero */}
          <div className="text-center max-w-3xl mx-auto mb-20">
            <p className="text-xs font-black text-primary-400 uppercase tracking-[0.3em] mb-4">
              Admissions &amp; Student Support
            </p>
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-6">
              Start learning the Quran with us
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed mb-10">
              Choose a course, pick a time that suits your family, and book a free trial lesson.
              No payment is needed to try — our team will help you at every step.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={WHATSAPP_TRIAL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-green-500 hover:bg-green-400 text-white font-black rounded-2xl transition-all shadow-xl shadow-green-500/20 text-sm uppercase tracking-wider"
              >
                Book a free trial on WhatsApp
              </a>
              <a
                href="#apply"
                className="px-8 py-4 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-black rounded-2xl transition-all text-sm uppercase tracking-wider"
              >
                Apply now
              </a>
            </div>
          </div>

          {/* How admission works */}
          <section className="mb-24">
            <h2 className="text-3xl font-black text-white text-center mb-4 tracking-tight">
              How admission works
            </h2>
            <p className="text-slate-400 text-center mb-12 max-w-2xl mx-auto">
              Four simple steps — most families finish in a few minutes.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {STEPS.map((step) => (
                <div
                  key={step.title}
                  className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-primary-400/40 transition-colors"
                >
                  <div className="w-12 h-12 bg-primary-500/20 text-primary-400 rounded-2xl flex items-center justify-center mb-6">
                    <step.icon size={24} />
                  </div>
                  <h3 className="text-lg font-black text-white mb-3">{step.title}</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">{step.text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Courses */}
          <section className="mb-24">
            <h2 className="text-3xl font-black text-white text-center mb-4 tracking-tight">
              Our courses
            </h2>
            <p className="text-slate-400 text-center mb-12 max-w-2xl mx-auto">
              Live one-to-one classes with qualified teachers — for children, youth and adults.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coreCourses.map((course) => (
                <Link
                  key={course.id}
                  to={getCourseDetailPath(course.id)}
                  className="group bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-primary-400/40 transition-colors"
                >
                  <h3 className="text-lg font-black text-white mb-3 group-hover:text-primary-400 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6 line-clamp-3">
                    {course.description}
                  </p>
                  <div className="flex flex-wrap gap-4 text-xs text-slate-300">
                    {course.ageRange && (
                      <span className="flex items-center gap-1.5">
                        <CheckCircle size={14} className="text-primary-400" />
                        Ages {course.ageRange}
                      </span>
                    )}
                    {course.duration && (
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} className="text-primary-400" />
                        {course.duration}
                      </span>
                    )}
                  </div>
                  <span className="inline-flex items-center gap-2 mt-6 text-primary-400 text-xs font-black uppercase tracking-wider">
                    View course
                    <ArrowRight size={14} />
                  </span>
                </Link>
              ))}
            </div>
            <p className="text-center mt-8">
              <Link to="/courses" className="text-primary-400 hover:text-primary-300 text-sm font-bold">
                See all courses →
              </Link>
            </p>
          </section>

          {/* Tuition */}
          <section className="mb-24">
            <h2 className="text-3xl font-black text-white text-center mb-4 tracking-tight">
              Tuition — simple monthly plans
            </h2>
            <p className="text-slate-400 text-center mb-12 max-w-2xl mx-auto">
              One-to-one live classes. Your first trial lesson is free, and you only pay after
              you decide to continue.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {PLANS.map((plan) => (
                <div
                  key={plan.name}
                  className={`rounded-3xl p-8 text-center ${
                    plan.highlight
                      ? 'bg-primary-500/15 border-2 border-primary-400/60'
                      : 'bg-white/5 border border-white/10'
                  }`}
                >
                  {plan.highlight && (
                    <span className="inline-block px-4 py-1 bg-primary-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full mb-4">
                      Most popular
                    </span>
                  )}
                  <h3 className="text-lg font-black text-white mb-2">{plan.name}</h3>
                  <p className="text-5xl font-black text-white mb-2">
                    ${plan.price}
                    <span className="text-base font-bold text-slate-400"> /month</span>
                  </p>
                  <p className="text-slate-300 text-sm">{plan.detail}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-slate-400 text-sm mt-8">
              Payment is arranged with our team on WhatsApp after your free trial.
            </p>
          </section>

          {/* Admission form */}
          <section id="apply" className="mb-24 scroll-mt-28">
            <h2 className="text-3xl font-black text-white text-center mb-4 tracking-tight">
              Apply for admission
            </h2>
            <p className="text-slate-400 text-center mb-12 max-w-2xl mx-auto">
              Fill in the form and our admissions team will contact you to arrange your free
              trial lesson and class time.
            </p>
            <div className="max-w-3xl mx-auto">
              <AdmissionForm lang={language} />
            </div>
          </section>

          {/* Support */}
          <section className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 sm:p-14 text-center">
            <h2 className="text-2xl font-black text-white mb-4 tracking-tight">
              Need help deciding?
            </h2>
            <p className="text-slate-300 leading-relaxed max-w-2xl mx-auto mb-8">
              Message us on WhatsApp and we will help you choose the right course and time for
              your child — or read the answers to common questions first.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={WHATSAPP_TRIAL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-green-500 hover:bg-green-400 text-white font-black rounded-2xl transition-all shadow-xl shadow-green-500/20 text-sm uppercase tracking-wider"
              >
                Chat on WhatsApp
              </a>
              <Link
                to="/faq"
                className="px-8 py-4 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-black rounded-2xl transition-all text-sm uppercase tracking-wider"
              >
                Read the FAQ
              </Link>
              <Link
                to="/contact"
                className="px-8 py-4 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-black rounded-2xl transition-all text-sm uppercase tracking-wider"
              >
                Contact us
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default AdmissionsPage;
