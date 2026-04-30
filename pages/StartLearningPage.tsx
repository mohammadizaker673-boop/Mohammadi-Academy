import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, GraduationCap, Users, User } from 'lucide-react';
import LogoLink from '../components/LogoLink';
import LanguageSelector from '../components/LanguageSelector';
import ThemeToggle from '../components/ThemeToggle';

type AudienceType = 'learner' | 'teacher' | 'parent';

type BillingCycle = 'monthly' | 'yearly';

interface PackagePlan {
  id: string;
  title: string;
  monthly: number;
  yearly: number;
  description: string;
  features: string[];
  highlight?: boolean;
}

const audienceOptions = [
  {
    id: 'learner' as const,
    title: 'I am a learner',
    description: 'Start your Quran and Islamic studies journey today.',
    icon: User
  },
  {
    id: 'teacher' as const,
    title: 'I am a teacher',
    description: 'Teach with verified students and flexible scheduling.',
    icon: GraduationCap
  },
  {
    id: 'parent' as const,
    title: 'I am a parent',
    description: 'Enroll your child with safe and guided learning.',
    icon: Users
  }
];

const StartLearningPage: React.FC = () => {
  const [selectedAudience, setSelectedAudience] = useState<AudienceType>('learner');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');

  const packages = useMemo<Record<AudienceType, PackagePlan[]>>(() => ({
    learner: [
      {
        id: 'learner-starter',
        title: 'Starter Plan',
        monthly: 15,
        yearly: 150,
        description: 'Perfect for beginners and busy schedules.',
        features: ['2 live sessions per week', 'Personal teacher', 'Weekly progress check']
      },
      {
        id: 'learner-growth',
        title: 'Growth Plan',
        monthly: 25,
        yearly: 250,
        description: 'Balanced pace for steady improvement.',
        features: ['3 live sessions per week', 'Tajweed focus', 'Monthly assessment'],
        highlight: true
      },
      {
        id: 'learner-advanced',
        title: 'Advanced Plan',
        monthly: 40,
        yearly: 400,
        description: 'For committed learners and Hifz students.',
        features: ['5 live sessions per week', 'Dedicated mentor', 'Priority support']
      }
    ],
    teacher: [
      {
        id: 'teacher-onboard',
        title: 'Teacher Onboarding',
        monthly: 0,
        yearly: 0,
        description: 'Apply and get verified with our academy.',
        features: ['Verification & screening', 'Profile setup', 'Support from admin']
      },
      {
        id: 'teacher-pro',
        title: 'Teacher Pro',
        monthly: 20,
        yearly: 180,
        description: 'Get access to more students and resources.',
        features: ['Priority student matching', 'Teaching resources', 'Monthly workshops'],
        highlight: true
      }
    ],
    parent: [
      {
        id: 'parent-basic',
        title: 'Family Basic',
        monthly: 20,
        yearly: 200,
        description: 'Safe learning path for kids and teens.',
        features: ['2 sessions per week', 'Progress dashboard', 'Parent updates']
      },
      {
        id: 'parent-plus',
        title: 'Family Plus',
        monthly: 35,
        yearly: 350,
        description: 'Best for multi-child learning.',
        features: ['4 sessions per week', 'Multiple student seats', 'Dedicated support'],
        highlight: true
      }
    ]
  }), []);

  const activePackages = packages[selectedAudience];

  return (
    <div className="min-h-screen bg-[#050a12]">
      <nav className="fixed top-0 w-full z-50 bg-[#050a12]/80 backdrop-blur-2xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 grid grid-cols-1 lg:grid-cols-[auto,1fr,auto] items-center gap-4">
          <div className="flex items-center gap-4 justify-center lg:justify-start">
            <LogoLink />
            <Link to="/courses" className="text-slate-300 hover:text-primary-400 transition-colors text-[11px] font-black uppercase tracking-[0.2em]">
              Explore
            </Link>
            <Link to="/ai-tutor" className="text-slate-300 hover:text-primary-400 transition-colors text-[11px] font-black uppercase tracking-[0.2em]">
              AI Teachers
            </Link>
            <Link to="/store" className="text-slate-300 hover:text-primary-400 transition-colors text-[11px] font-black uppercase tracking-[0.2em]">
              Knowledge Store
            </Link>
          </div>
          <div className="hidden lg:flex justify-center">
            <span className="text-slate-400 text-xs uppercase tracking-[0.3em]">Start learning today</span>
          </div>
          <div className="flex items-center gap-3 justify-center lg:justify-end">
            <ThemeToggle />
            <LanguageSelector />
            <Link
              to="/register"
              className="px-4 py-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-full text-[11px] font-black uppercase tracking-wider shadow-lg hover:from-primary-400 hover:to-accent-400 transition-all"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-[1.1fr,0.9fr] gap-10 items-start">
          <section className="space-y-8">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-primary-400/10 border border-primary-400/20 rounded-full">
              <span className="w-2.5 h-2.5 bg-primary-400 rounded-full animate-pulse shadow-glow"></span>
              <span className="text-primary-300 text-[10px] font-black tracking-[0.3em] uppercase">Mohammadi Academy</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-black leading-tight text-white">
              Khan-style guidance to boost your learning journey
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed">
              Discover Quran, Islamic studies, and modern skills with structured pathways. Choose your role and see a plan designed for your goals.
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              {audienceOptions.map(option => {
                const Icon = option.icon;
                const isActive = selectedAudience === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setSelectedAudience(option.id)}
                    className={`text-left rounded-2xl border px-4 py-4 transition-all ${
                      isActive
                        ? 'border-primary-400 bg-primary-500/10 shadow-lg shadow-primary-500/20'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                        isActive ? 'bg-primary-500 text-white' : 'bg-white/10 text-slate-300'
                      }`}>
                        <Icon size={18} />
                      </div>
                      <span className="text-sm font-black text-white uppercase tracking-wider">
                        {option.title}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">{option.description}</p>
                  </button>
                );
              })}
            </div>
          </section>

          <aside className="relative bg-gradient-to-br from-white/10 to-white/5 border border-white/15 rounded-[2rem] p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black text-white">Start learning today</h2>
                <p className="text-sm text-slate-300">Choose monthly or yearly plans.</p>
              </div>
              <div className="inline-flex rounded-full border border-white/15 bg-white/10 p-1">
                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-3 py-1.5 text-[10px] font-black uppercase rounded-full transition-all ${
                    billingCycle === 'monthly'
                      ? 'bg-white/20 text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle('yearly')}
                  className={`px-3 py-1.5 text-[10px] font-black uppercase rounded-full transition-all ${
                    billingCycle === 'yearly'
                      ? 'bg-white/20 text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Yearly
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {activePackages.map(plan => (
                <div
                  key={plan.id}
                  className={`rounded-2xl border px-5 py-5 transition-all ${
                    plan.highlight
                      ? 'border-primary-400 bg-primary-500/10 shadow-lg shadow-primary-500/20'
                      : 'border-white/10 bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-black text-white">{plan.title}</h3>
                    <span className="text-xl font-black text-white">
                      ${billingCycle === 'monthly' ? plan.monthly : plan.yearly}
                      <span className="text-xs text-slate-300 ml-1">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 mb-4">{plan.description}</p>
                  <ul className="space-y-2">
                    {plan.features.map(feature => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-slate-200">
                        <CheckCircle2 size={16} className="text-primary-400" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link
                to="/register"
                className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl text-xs font-black uppercase tracking-wider text-center hover:from-primary-400 hover:to-accent-400 transition-all"
              >
                Create account
              </Link>
              <Link
                to="/login"
                className="flex-1 px-4 py-3 bg-white/10 text-white rounded-xl text-xs font-black uppercase tracking-wider text-center hover:bg-white/20 transition-all"
              >
                I already have an account
              </Link>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default StartLearningPage;
