import React, { useState } from 'react';
import { FileText, Loader2, Download, RefreshCw, Users } from 'lucide-react';
import { generateParentReport } from '../../services/aiFeaturesService';
import { hasOpenRouterApiKey } from '../../services/aiService';

const AIParentReport: React.FC = () => {
  const [studentName, setStudentName] = useState('');
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const [attendance, setAttendance] = useState({ present: 4, absent: 1, late: 0, total: 5 });
  const [academics, setAcademics] = useState([
    { subject: 'Quran Recitation', score: 85, notes: 'Good tajweed progress' },
    { subject: 'Islamic Studies', score: 78, notes: 'Active participation' },
    { subject: 'Arabic', score: 70, notes: 'Needs more writing practice' },
  ]);
  const [teacherNotes, setTeacherNotes] = useState('');
  const [report, setReport] = useState('');
  const [loading, setLoading] = useState(false);

  const hasApiKey = hasOpenRouterApiKey();

  const addSubject = () => setAcademics(prev => [...prev, { subject: '', score: 75, notes: '' }]);
  const updateSubject = (i: number, field: string, val: string | number) =>
    setAcademics(prev => prev.map((a, idx) => idx === i ? { ...a, [field]: val } : a));
  const removeSubject = (i: number) => {
    if (academics.length > 1) setAcademics(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleGenerate = async () => {
    if (!studentName.trim()) return;
    setLoading(true);
    setReport('');
    try {
      const result = await generateParentReport(studentName, period, attendance, academics.filter(a => a.subject.trim()), teacherNotes || undefined);
      setReport(result);
    } catch {
      setReport('Error generating report. Please check your API configuration.');
    } finally {
      setLoading(false);
    }
  };

  const copyReport = () => {
    navigator.clipboard.writeText(report);
  };

  if (!hasApiKey) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <FileText className="mx-auto mb-4 text-primary-400" size={48} />
          <h2 className="text-xl font-bold text-white mb-2">Parent Reports Not Configured</h2>
          <p className="text-slate-400">Please configure the OpenRouter API key.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-600 flex items-center justify-center">
          <Users className="text-white" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Parent Progress Reports</h1>
          <p className="text-slate-400">AI-generated warm, detailed reports for parents</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 font-bold block mb-1">Student Name</label>
                <input value={studentName} onChange={e => setStudentName(e.target.value)} placeholder="Student name"
                  className="w-full px-3 py-2.5 bg-white/10 border border-white/15 rounded-lg text-white text-sm placeholder:text-slate-500 focus:border-primary-400 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-bold block mb-1">Period</label>
                <select value={period} onChange={e => setPeriod(e.target.value as 'weekly' | 'monthly')}
                  className="w-full px-3 py-2.5 bg-white/10 border border-white/15 rounded-lg text-white text-sm focus:border-primary-400 focus:outline-none">
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-bold block mb-2">Attendance</label>
              <div className="grid grid-cols-4 gap-2">
                {(['present', 'absent', 'late', 'total'] as const).map(key => (
                  <div key={key}>
                    <label className="text-[10px] text-slate-500 capitalize block mb-1">{key}</label>
                    <input type="number" value={attendance[key]} onChange={e => setAttendance(prev => ({ ...prev, [key]: parseInt(e.target.value) || 0 }))}
                      min={0} className="w-full px-2 py-2 bg-white/10 border border-white/15 rounded-lg text-white text-xs focus:border-primary-400 focus:outline-none" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Academic Performance</h3>
              <button onClick={addSubject} className="text-xs bg-white/5 hover:bg-white/10 text-primary-400 px-3 py-1 rounded-lg font-bold transition-all">+ Add</button>
            </div>
            {academics.map((a, i) => (
              <div key={i} className="grid grid-cols-[1fr,60px,1fr,28px] gap-2 items-end">
                <input value={a.subject} onChange={e => updateSubject(i, 'subject', e.target.value)} placeholder="Subject"
                  className="px-3 py-2 bg-white/10 border border-white/15 rounded-lg text-white text-xs placeholder:text-slate-500 focus:border-primary-400 focus:outline-none" />
                <input type="number" value={a.score} onChange={e => updateSubject(i, 'score', parseInt(e.target.value) || 0)} min={0} max={100}
                  className="px-2 py-2 bg-white/10 border border-white/15 rounded-lg text-white text-xs focus:border-primary-400 focus:outline-none" />
                <input value={a.notes} onChange={e => updateSubject(i, 'notes', e.target.value)} placeholder="Notes"
                  className="px-3 py-2 bg-white/10 border border-white/15 rounded-lg text-white text-xs placeholder:text-slate-500 focus:border-primary-400 focus:outline-none" />
                <button onClick={() => removeSubject(i)} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg text-sm">×</button>
              </div>
            ))}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <label className="text-xs text-slate-400 font-bold block mb-1">Teacher Notes (optional)</label>
            <textarea value={teacherNotes} onChange={e => setTeacherNotes(e.target.value)} rows={3} placeholder="Add any specific observations..."
              className="w-full px-3 py-2.5 bg-white/10 border border-white/15 rounded-lg text-white text-sm placeholder:text-slate-500 focus:border-primary-400 focus:outline-none" />
          </div>

          <button onClick={handleGenerate} disabled={loading || !studentName.trim()}
            className="w-full py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl font-bold text-sm uppercase tracking-wider disabled:opacity-50 hover:from-rose-400 hover:to-pink-500 transition-all flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="animate-spin" size={18} /> Generating Report...</> : <><FileText size={18} /> Generate Parent Report</>}
          </button>
        </div>

        {/* Report Output */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText size={20} className="text-rose-400" /> Generated Report
            </h3>
            {report && (
              <div className="flex gap-2">
                <button onClick={copyReport} className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                  <Download size={14} /> Copy
                </button>
                <button onClick={() => setReport('')} className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                  <RefreshCw size={14} /> Clear
                </button>
              </div>
            )}
          </div>
          {report ? (
            <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap text-slate-300 leading-relaxed max-h-[70vh] overflow-y-auto">
              {report}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <Users size={40} className="mb-4 opacity-30" />
              <p className="text-sm text-center">Enter student data to generate a warm parent progress report.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIParentReport;
