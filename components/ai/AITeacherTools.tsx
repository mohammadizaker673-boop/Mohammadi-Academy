import React, { useState } from 'react';
import { GraduationCap, Loader2, FileText, Users, BarChart, PenTool, RefreshCw } from 'lucide-react';
import { generateLessonPlan, analyzeClassPerformance, draftParentMessage } from '../../services/aiFeaturesService';
import { hasOpenRouterApiKey } from '../../services/aiService';

type ToolTab = 'lesson-plan' | 'class-analysis' | 'parent-message';

const AITeacherTools: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ToolTab>('lesson-plan');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  // Lesson Plan state
  const [lpSubject, setLpSubject] = useState('');
  const [lpTopic, setLpTopic] = useState('');
  const [lpLevel, setLpLevel] = useState('Beginner');
  const [lpDuration, setLpDuration] = useState('45 minutes');

  // Class Analysis state
  const [caClassName, setCaClassName] = useState('');
  const [caStudents, setCaStudents] = useState([
    { name: '', scores: [{ subject: '', score: 75 }] },
  ]);

  // Parent Message state
  const [pmStudentName, setPmStudentName] = useState('');
  const [pmContext, setPmContext] = useState('');
  const [pmTone, setPmTone] = useState<'positive' | 'concern' | 'neutral'>('positive');

  const hasApiKey = hasOpenRouterApiKey();

  const handleLessonPlan = async () => {
    if (!lpSubject.trim() || !lpTopic.trim()) return;
    setLoading(true);
    setOutput('');
    try {
      const result = await generateLessonPlan(lpSubject, lpTopic, lpLevel, lpDuration);
      setOutput(result);
    } catch { setOutput('Error generating lesson plan.'); }
    finally { setLoading(false); }
  };

  const handleClassAnalysis = async () => {
    if (!caClassName.trim()) return;
    setLoading(true);
    setOutput('');
    try {
      const students = caStudents.filter(s => s.name.trim()).map(s => ({
        name: s.name,
        scores: s.scores.filter(sc => sc.subject.trim()),
      }));
      const result = await analyzeClassPerformance(caClassName, students);
      setOutput(result);
    } catch { setOutput('Error analyzing class performance.'); }
    finally { setLoading(false); }
  };

  const handleParentMessage = async () => {
    if (!pmStudentName.trim() || !pmContext.trim()) return;
    setLoading(true);
    setOutput('');
    try {
      const result = await draftParentMessage(pmStudentName, pmContext, pmTone);
      setOutput(result);
    } catch { setOutput('Error drafting message.'); }
    finally { setLoading(false); }
  };

  const addStudent = () => setCaStudents(prev => [...prev, { name: '', scores: [{ subject: '', score: 75 }] }]);

  const copyOutput = () => navigator.clipboard.writeText(output);

  const tabs = [
    { id: 'lesson-plan' as ToolTab, label: 'Lesson Plan', icon: FileText },
    { id: 'class-analysis' as ToolTab, label: 'Class Analysis', icon: BarChart },
    { id: 'parent-message' as ToolTab, label: 'Parent Message', icon: Users },
  ];

  if (!hasApiKey) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <GraduationCap className="mx-auto mb-4 text-primary-400" size={48} />
          <h2 className="text-xl font-bold text-white mb-2">Teacher Tools Not Configured</h2>
          <p className="text-slate-400">Please configure the OpenRouter API key.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center">
          <GraduationCap className="text-white" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">AI Teacher Tools</h1>
          <p className="text-slate-400">Lesson plans, class analytics, and parent communication</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-2">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setOutput(''); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-sm font-bold transition-all ${
                activeTab === tab.id ? 'bg-white/10 text-white border-b-2 border-primary-400' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}>
              <Icon size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          {activeTab === 'lesson-plan' && (
            <>
              <h3 className="font-bold text-white flex items-center gap-2"><PenTool size={18} className="text-emerald-400" /> Create Lesson Plan</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-bold block mb-1">Subject</label>
                  <input value={lpSubject} onChange={e => setLpSubject(e.target.value)} placeholder="e.g., Quran"
                    className="w-full px-3 py-2.5 bg-white/10 border border-white/15 rounded-lg text-white text-sm placeholder:text-slate-500 focus:border-primary-400 focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-bold block mb-1">Topic</label>
                  <input value={lpTopic} onChange={e => setLpTopic(e.target.value)} placeholder="e.g., Surah Al-Mulk"
                    className="w-full px-3 py-2.5 bg-white/10 border border-white/15 rounded-lg text-white text-sm placeholder:text-slate-500 focus:border-primary-400 focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-bold block mb-1">Student Level</label>
                  <select value={lpLevel} onChange={e => setLpLevel(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white/10 border border-white/15 rounded-lg text-white text-sm focus:border-primary-400 focus:outline-none">
                    {['Beginner', 'Elementary', 'Intermediate', 'Advanced'].map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-bold block mb-1">Duration</label>
                  <select value={lpDuration} onChange={e => setLpDuration(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white/10 border border-white/15 rounded-lg text-white text-sm focus:border-primary-400 focus:outline-none">
                    {['30 minutes', '45 minutes', '60 minutes', '90 minutes'].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <button onClick={handleLessonPlan} disabled={loading || !lpSubject.trim() || !lpTopic.trim()}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-bold text-sm uppercase tracking-wider disabled:opacity-50 hover:from-emerald-400 hover:to-green-500 transition-all flex items-center justify-center gap-2">
                {loading ? <><Loader2 className="animate-spin" size={18} /> Generating...</> : <><FileText size={18} /> Generate Lesson Plan</>}
              </button>
            </>
          )}

          {activeTab === 'class-analysis' && (
            <>
              <h3 className="font-bold text-white flex items-center gap-2"><BarChart size={18} className="text-emerald-400" /> Analyze Class Performance</h3>
              <div>
                <label className="text-xs text-slate-400 font-bold block mb-1">Class Name</label>
                <input value={caClassName} onChange={e => setCaClassName(e.target.value)} placeholder="e.g., Grade 5 - Quran"
                  className="w-full px-3 py-2.5 bg-white/10 border border-white/15 rounded-lg text-white text-sm placeholder:text-slate-500 focus:border-primary-400 focus:outline-none" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-slate-400 font-bold">Students & Scores</label>
                  <button onClick={addStudent} className="text-xs bg-white/5 hover:bg-white/10 text-primary-400 px-3 py-1 rounded-lg font-bold transition-all">+ Add Student</button>
                </div>
                {caStudents.map((student, si) => (
                  <div key={si} className="bg-white/5 rounded-lg p-3 space-y-2">
                    <input value={student.name} onChange={e => {
                      setCaStudents(prev => prev.map((s, i) => i === si ? { ...s, name: e.target.value } : s));
                    }} placeholder="Student name"
                      className="w-full px-3 py-2 bg-white/10 border border-white/15 rounded-lg text-white text-xs placeholder:text-slate-500 focus:border-primary-400 focus:outline-none" />
                    <div className="flex flex-wrap gap-2">
                      {student.scores.map((score, sci) => (
                        <div key={sci} className="flex gap-1">
                          <input value={score.subject} onChange={e => {
                            setCaStudents(prev => prev.map((s, i) => i === si ? { ...s, scores: s.scores.map((sc, j) => j === sci ? { ...sc, subject: e.target.value } : sc) } : s));
                          }} placeholder="Subject" className="w-24 px-2 py-1 bg-white/10 border border-white/15 rounded text-white text-[10px] placeholder:text-slate-500 focus:border-primary-400 focus:outline-none" />
                          <input type="number" value={score.score} onChange={e => {
                            setCaStudents(prev => prev.map((s, i) => i === si ? { ...s, scores: s.scores.map((sc, j) => j === sci ? { ...sc, score: parseInt(e.target.value) || 0 } : sc) } : s));
                          }} min={0} max={100} className="w-14 px-2 py-1 bg-white/10 border border-white/15 rounded text-white text-[10px] focus:border-primary-400 focus:outline-none" />
                        </div>
                      ))}
                      <button onClick={() => {
                        setCaStudents(prev => prev.map((s, i) => i === si ? { ...s, scores: [...s.scores, { subject: '', score: 75 }] } : s));
                      }} className="text-[10px] text-primary-400 px-2 py-1 hover:bg-white/5 rounded">+subject</button>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={handleClassAnalysis} disabled={loading || !caClassName.trim()}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-bold text-sm uppercase tracking-wider disabled:opacity-50 hover:from-emerald-400 hover:to-green-500 transition-all flex items-center justify-center gap-2">
                {loading ? <><Loader2 className="animate-spin" size={18} /> Analyzing...</> : <><BarChart size={18} /> Analyze Class</>}
              </button>
            </>
          )}

          {activeTab === 'parent-message' && (
            <>
              <h3 className="font-bold text-white flex items-center gap-2"><Users size={18} className="text-emerald-400" /> Draft Parent Message</h3>
              <div>
                <label className="text-xs text-slate-400 font-bold block mb-1">Student Name</label>
                <input value={pmStudentName} onChange={e => setPmStudentName(e.target.value)} placeholder="Student name"
                  className="w-full px-3 py-2.5 bg-white/10 border border-white/15 rounded-lg text-white text-sm placeholder:text-slate-500 focus:border-primary-400 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-bold block mb-1">Context / Reason</label>
                <textarea value={pmContext} onChange={e => setPmContext(e.target.value)} rows={4}
                  placeholder="e.g., Student has been missing homework for 2 weeks and test scores have dropped..."
                  className="w-full px-3 py-2.5 bg-white/10 border border-white/15 rounded-lg text-white text-sm placeholder:text-slate-500 focus:border-primary-400 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-bold block mb-1">Tone</label>
                <div className="flex gap-2">
                  {(['positive', 'neutral', 'concern'] as const).map(t => (
                    <button key={t} onClick={() => setPmTone(t)}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold capitalize transition-all ${
                        pmTone === t ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-white/5 text-slate-400 hover:bg-white/10'
                      }`}>{t}</button>
                  ))}
                </div>
              </div>
              <button onClick={handleParentMessage} disabled={loading || !pmStudentName.trim() || !pmContext.trim()}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-bold text-sm uppercase tracking-wider disabled:opacity-50 hover:from-emerald-400 hover:to-green-500 transition-all flex items-center justify-center gap-2">
                {loading ? <><Loader2 className="animate-spin" size={18} /> Drafting...</> : <><Users size={18} /> Draft Message</>}
              </button>
            </>
          )}
        </div>

        {/* Output Panel */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">AI Output</h3>
            {output && (
              <div className="flex gap-2">
                <button onClick={copyOutput} className="text-xs text-slate-400 hover:text-white">Copy</button>
                <button onClick={() => setOutput('')} className="text-xs text-slate-400 hover:text-white flex items-center gap-1"><RefreshCw size={14} /> Clear</button>
              </div>
            )}
          </div>
          {output ? (
            <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap text-slate-300 leading-relaxed max-h-[70vh] overflow-y-auto">{output}</div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <GraduationCap size={40} className="mb-4 opacity-30" />
              <p className="text-sm text-center">Select a tool, fill in the details, and generate AI-powered teaching content.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AITeacherTools;
