import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, Bot, Mic, Brain, FileQuestion, BookOpen, Route, FileText,
  Compass, GraduationCap, Settings, ToggleLeft, ToggleRight, Shield,
  Zap, Eye, EyeOff, Save, AlertTriangle, CheckCircle, ChevronDown,
  ChevronUp, Cpu, Activity
} from 'lucide-react';
import { AI_FEATURE_KEYS, AI_FEATURE_LABELS, AI_FEATURE_DESCRIPTIONS, getSystemPrompts, type AIFeatureKey } from '../../services/aiFeaturesService';
import { hasOpenRouterApiKey } from '../../services/aiService';

type FeatureConfig = {
  enabled: boolean;
  allowedRoles: ('admin' | 'teacher' | 'student')[];
  customPromptOverride?: string;
};

const DEFAULT_CONFIGS: Record<AIFeatureKey, FeatureConfig> = {
  tutor: { enabled: true, allowedRoles: ['admin', 'teacher', 'student'] },
  recitationCoach: { enabled: true, allowedRoles: ['admin', 'teacher', 'student'] },
  hifzTracker: { enabled: true, allowedRoles: ['admin', 'teacher', 'student'] },
  quizGenerator: { enabled: true, allowedRoles: ['admin', 'teacher', 'student'] },
  quranExplainer: { enabled: true, allowedRoles: ['admin', 'teacher', 'student'] },
  learningPath: { enabled: true, allowedRoles: ['admin', 'teacher', 'student'] },
  parentReport: { enabled: true, allowedRoles: ['admin', 'teacher'] },
  recommender: { enabled: true, allowedRoles: ['admin', 'teacher', 'student'] },
  teacherAssistant: { enabled: true, allowedRoles: ['admin', 'teacher'] },
  adminControl: { enabled: true, allowedRoles: ['admin'] },
};

const FEATURE_ICONS: Record<AIFeatureKey, React.ElementType> = {
  tutor: Bot,
  recitationCoach: Mic,
  hifzTracker: Brain,
  quizGenerator: FileQuestion,
  quranExplainer: BookOpen,
  learningPath: Route,
  parentReport: FileText,
  recommender: Compass,
  teacherAssistant: GraduationCap,
  adminControl: Settings,
};

const FEATURE_COLORS: Record<AIFeatureKey, string> = {
  tutor: 'from-primary-400 to-accent-500',
  recitationCoach: 'from-emerald-400 to-teal-600',
  hifzTracker: 'from-violet-400 to-purple-600',
  quizGenerator: 'from-amber-400 to-orange-600',
  quranExplainer: 'from-sky-400 to-blue-600',
  learningPath: 'from-cyan-400 to-teal-600',
  parentReport: 'from-rose-400 to-pink-600',
  recommender: 'from-indigo-400 to-purple-600',
  teacherAssistant: 'from-emerald-400 to-green-600',
  adminControl: 'from-slate-400 to-slate-600',
};

const FEATURE_ROUTES: Record<AIFeatureKey, string> = {
  tutor: '/admin/ai/tutor',
  recitationCoach: '/admin/ai/recitation',
  hifzTracker: '/admin/ai/hifz',
  quizGenerator: '/admin/ai/quiz',
  quranExplainer: '/admin/ai/quran-explainer',
  learningPath: '/admin/ai/learning-path',
  parentReport: '/admin/ai/parent-reports',
  recommender: '/admin/ai/recommendations',
  teacherAssistant: '/admin/ai/teacher-tools',
  adminControl: '/admin/ai',
};

const STORAGE_KEY = 'mohammadi_ai_configs';

const AICenterDashboard: React.FC = () => {
  const [configs, setConfigs] = useState<Record<AIFeatureKey, FeatureConfig>>(DEFAULT_CONFIGS);
  const [expandedFeature, setExpandedFeature] = useState<AIFeatureKey | null>(null);
  const [showPrompt, setShowPrompt] = useState<AIFeatureKey | null>(null);
  const [saved, setSaved] = useState(false);

  const hasApiKey = hasOpenRouterApiKey();
  const systemPrompts = getSystemPrompts();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setConfigs(prev => ({ ...prev, ...parsed }));
      }
    } catch { /* ignore */ }
  }, []);

  const saveConfigs = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleFeature = (key: AIFeatureKey) => {
    setConfigs(prev => ({
      ...prev,
      [key]: { ...prev[key], enabled: !prev[key].enabled },
    }));
  };

  const toggleRole = (key: AIFeatureKey, role: 'admin' | 'teacher' | 'student') => {
    setConfigs(prev => {
      const current = prev[key].allowedRoles;
      const newRoles = current.includes(role)
        ? current.filter(r => r !== role)
        : [...current, role];
      return { ...prev, [key]: { ...prev[key], allowedRoles: newRoles } };
    });
  };

  const enabledCount = AI_FEATURE_KEYS.filter(k => configs[k].enabled).length;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/30">
            <Sparkles className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white">AI Center</h1>
            <p className="text-slate-400">Manage and control all AI features across Mohammadi Academy</p>
          </div>
        </div>
        <button
          onClick={saveConfigs}
          className={`px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center gap-2 transition-all ${
            saved
              ? 'bg-emerald-500 text-white'
              : 'bg-gradient-to-r from-primary-500 to-accent-500 text-white hover:from-primary-400 hover:to-accent-400'
          }`}
        >
          {saved ? <><CheckCircle size={18} /> Saved!</> : <><Save size={18} /> Save Settings</>}
        </button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <Cpu size={20} className="text-primary-400" />
            <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">API Status</span>
          </div>
          <div className={`text-lg font-bold ${hasApiKey ? 'text-emerald-400' : 'text-red-400'}`}>
            {hasApiKey ? 'Connected' : 'Not Configured'}
          </div>
          {!hasApiKey && <p className="text-[10px] text-red-400/70 mt-1">Set VITE_OPENROUTER_API_KEY in .env</p>}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <Activity size={20} className="text-amber-400" />
            <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Active Features</span>
          </div>
          <div className="text-lg font-bold text-white">{enabledCount} / {AI_FEATURE_KEYS.length}</div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <Zap size={20} className="text-emerald-400" />
            <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">AI Model</span>
          </div>
          <div className="text-sm font-bold text-white truncate">{import.meta.env.VITE_OPENROUTER_MODEL || 'gpt-4o-mini'}</div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <Shield size={20} className="text-sky-400" />
            <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Safety</span>
          </div>
          <div className="text-lg font-bold text-emerald-400">Active</div>
          <p className="text-[10px] text-slate-500 mt-1">Islamic content filters enabled</p>
        </div>
      </div>

      {!hasApiKey && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 flex items-start gap-4">
          <AlertTriangle className="text-red-400 flex-shrink-0 mt-0.5" size={24} />
          <div>
            <h3 className="text-white font-bold mb-1">API Key Required</h3>
            <p className="text-sm text-slate-400">
              AI features require an OpenRouter API key. Add <code className="text-red-300 bg-red-500/10 px-1 rounded">VITE_OPENROUTER_API_KEY=your_key</code> to your <code className="text-red-300 bg-red-500/10 px-1 rounded">.env</code> file and restart the dev server.
            </p>
          </div>
        </div>
      )}

      {/* Feature Cards */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Settings size={20} className="text-slate-400" /> AI Features Control
        </h2>

        <div className="grid gap-3">
          {AI_FEATURE_KEYS.filter(k => k !== 'adminControl').map(key => {
            const Icon = FEATURE_ICONS[key];
            const config = configs[key];
            const isExpanded = expandedFeature === key;
            const isShowingPrompt = showPrompt === key;

            return (
              <div key={key} className={`bg-white/5 border rounded-2xl transition-all ${
                config.enabled ? 'border-white/10' : 'border-white/5 opacity-60'
              }`}>
                {/* Main Row */}
                <div className="flex items-center gap-4 p-5">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${FEATURE_COLORS[key]} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="text-white" size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-bold text-sm">{AI_FEATURE_LABELS[key]}</h3>
                      {config.enabled && (
                        <Link to={FEATURE_ROUTES[key]} className="text-[10px] text-primary-400 hover:text-primary-300 font-bold uppercase tracking-wider">
                          Open →
                        </Link>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{AI_FEATURE_DESCRIPTIONS[key]}</p>
                  </div>

                  {/* Role badges */}
                  <div className="flex gap-1 mr-4">
                    {(['admin', 'teacher', 'student'] as const).map(role => (
                      <span key={role} className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        config.allowedRoles.includes(role)
                          ? 'bg-primary-500/20 text-primary-400'
                          : 'bg-white/5 text-slate-600'
                      }`}>
                        {role[0]}
                      </span>
                    ))}
                  </div>

                  {/* Toggle */}
                  <button onClick={() => toggleFeature(key)} className="flex-shrink-0">
                    {config.enabled ? (
                      <ToggleRight size={32} className="text-emerald-400" />
                    ) : (
                      <ToggleLeft size={32} className="text-slate-600" />
                    )}
                  </button>

                  {/* Expand */}
                  <button onClick={() => setExpandedFeature(isExpanded ? null : key)} className="p-1 text-slate-400 hover:text-white transition-colors">
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>

                {/* Expanded Config */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-white/5 space-y-4">
                    <div>
                      <label className="text-xs text-slate-400 font-bold mb-2 block">Allowed Roles</label>
                      <div className="flex gap-3">
                        {(['admin', 'teacher', 'student'] as const).map(role => (
                          <button key={role} onClick={() => toggleRole(key, role)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${
                              config.allowedRoles.includes(role)
                                ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                                : 'bg-white/5 text-slate-500 border border-white/10 hover:bg-white/10'
                            }`}>
                            {role}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <button onClick={() => setShowPrompt(isShowingPrompt ? null : key)}
                        className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-bold transition-colors">
                        {isShowingPrompt ? <EyeOff size={14} /> : <Eye size={14} />}
                        {isShowingPrompt ? 'Hide System Prompt' : 'View System Prompt'}
                      </button>

                      {isShowingPrompt && (
                        <div className="mt-3 bg-black/30 rounded-xl p-4 max-h-64 overflow-y-auto">
                          <pre className="text-xs text-slate-400 whitespace-pre-wrap font-mono leading-relaxed">
                            {systemPrompts[key]}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Access Grid */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Quick Access</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {AI_FEATURE_KEYS.filter(k => k !== 'adminControl' && configs[k].enabled).map(key => {
            const Icon = FEATURE_ICONS[key];
            return (
              <Link key={key} to={FEATURE_ROUTES[key]}
                className={`bg-white/5 border border-white/10 rounded-2xl p-4 text-center hover:bg-white/10 hover:border-primary-400/30 transition-all group`}>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${FEATURE_COLORS[key]} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className="text-white" size={20} />
                </div>
                <p className="text-xs font-bold text-white">{AI_FEATURE_LABELS[key].replace('AI ', '').replace('Smart ', '')}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AICenterDashboard;
