import React, { useEffect, useMemo, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { Bot, Sparkles, AlertTriangle, Send, RefreshCw, ClipboardCheck, Users, GraduationCap, BookOpen, DollarSign } from 'lucide-react';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { generateAIText, hasOpenRouterApiKey } from '../../services/aiService';

type CopilotMode = 'admin' | 'teacher' | 'student';

type CopilotMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  createdAt: Date;
};

type AcademySnapshot = {
  studentsTotal: number;
  studentsActive: number;
  studentsOnline: number;
  teachersTotal: number;
  teachersActive: number;
  attendanceSessions: number;
  attendanceMarked: number;
  attendanceAbsent: number;
  attendanceLate: number;
  attendanceAbsenceRate: number;
  atRiskStudents: number;
  feesTotalAmount: number;
  feesCollectedAmount: number;
  feesPendingAmount: number;
  overdueFeesCount: number;
  pendingFeesCount: number;
  homeworkCount: number;
  examsCount: number;
  announcementsLast30Days: number;
  messagesLast30Days: number;
};

const MODE_LABELS: Record<CopilotMode, string> = {
  admin: 'Admin Copilot',
  teacher: 'Teacher Copilot',
  student: 'Student Copilot',
};

const QUICK_ACTIONS: Record<CopilotMode, string[]> = {
  admin: [
    'Generate today\'s management priorities based on attendance, fee, and communication data.',
    'Create a weekly executive summary for academy leadership.',
    'Draft an announcement for parents about attendance improvement.'
  ],
  teacher: [
    'Identify students who need extra help this week and suggest intervention steps.',
    'Create a 5-day lesson strategy for mixed-level students.',
    'Draft a respectful parent update message for low-performing students.'
  ],
  student: [
    'Create a 7-day personalized study plan focused on weak areas.',
    'Recommend a daily revision routine for consistency and motivation.',
    'Generate short encouragement and goal-tracking reminders for students.'
  ]
};

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const toDate = (value: any): Date | null => {
  if (!value) return null;
  if (value?.toDate && typeof value.toDate === 'function') {
    return value.toDate();
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const isWithinLastDays = (value: any, days: number): boolean => {
  const date = toDate(value);
  if (!date) return false;
  const threshold = Date.now() - days * 24 * 60 * 60 * 1000;
  return date.getTime() >= threshold;
};

const buildFallbackResponse = (mode: CopilotMode, snapshot: AcademySnapshot): string => {
  const lines = [
    `Mode: ${MODE_LABELS[mode]}`,
    '',
    '1) Priority Risks',
    snapshot.attendanceAbsenceRate >= 25
      ? `- Attendance risk is high at ${snapshot.attendanceAbsenceRate.toFixed(1)}% absence.`
      : '- Attendance risk is currently moderate.',
    snapshot.feesPendingAmount > 0
      ? `- Outstanding fee balance is ${currency.format(snapshot.feesPendingAmount)}.`
      : '- No pending fee balance detected.',
    snapshot.atRiskStudents > 0
      ? `- ${snapshot.atRiskStudents} students are flagged as at-risk by attendance trend.`
      : '- No high-risk students detected from attendance trend.',
    '',
    '2) Recommended Actions',
    '- Contact at-risk students/parents with a structured 7-day follow-up plan.',
    '- Prioritize overdue fee reminders before the next billing cycle.',
    '- Assign teachers to monitor students with repeated absences.',
    '',
    '3) Draft Messages',
    '- Attendance Reminder: Dear families, please ensure students attend regularly this week to keep learning progress on track.',
    '- Fee Reminder: Dear parent/guardian, kindly clear pending dues to avoid interruption in student services.',
    '',
    '4) Weekly Plan',
    '- Monday: Review attendance outliers',
    '- Tuesday: Send targeted parent follow-ups',
    '- Wednesday: Teacher intervention check-ins',
    '- Thursday: Fee collection status review',
    '- Friday: Leadership summary and action closeout'
  ];

  return lines.join('\n');
};

const AICopilot: React.FC = () => {
  const { user } = useAuth();
  const aiConfigured = hasOpenRouterApiKey();
  const [mode, setMode] = useState<CopilotMode>('admin');
  const [snapshot, setSnapshot] = useState<AcademySnapshot | null>(null);
  const [loadingSnapshot, setLoadingSnapshot] = useState(true);
  const [input, setInput] = useState('');
  const [generating, setGenerating] = useState(false);
  const [messages, setMessages] = useState<CopilotMessage[]>([]);

  const canAccessMode = (target: CopilotMode): boolean => {
    const role = user?.role;
    if (role === 'admin') return true;
    if (role === 'teacher') return target !== 'admin';
    return target === 'student';
  };

  useEffect(() => {
    if (!canAccessMode(mode)) {
      setMode(user?.role === 'teacher' ? 'teacher' : 'student');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  const loadSnapshot = async () => {
    setLoadingSnapshot(true);

    const safeGet = async (name: string) => {
      try {
        const snap = await getDocs(collection(db, name));
        return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      } catch {
        return [];
      }
    };

    const [students, teachers, attendance, fees, homework, exams, announcements, messagesData] = await Promise.all([
      safeGet('students'),
      safeGet('teachers'),
      safeGet('attendance'),
      safeGet('fees'),
      safeGet('homework'),
      safeGet('exams'),
      safeGet('announcements'),
      safeGet('messages'),
    ]);

    const studentsTotal = students.length;
    const studentsActive = students.filter((s: any) => String(s.status || '').toLowerCase() === 'active').length;
    const studentsOnline = students.filter((s: any) => String(s.studentType || '').toLowerCase() === 'online').length;
    const teachersTotal = teachers.length;
    const teachersActive = teachers.filter((t: any) => String(t.status || '').toLowerCase() === 'active').length;

    let attendanceMarked = 0;
    let attendanceAbsent = 0;
    let attendanceLate = 0;
    const studentTrend = new Map<string, { total: number; absent: number }>();

    attendance.forEach((record: any) => {
      const studentsList = Array.isArray(record.students) ? record.students : [];
      studentsList.forEach((item: any) => {
        const status = String(item?.status || '').toLowerCase();
        const studentId = String(item?.studentId || item?.studentName || 'unknown');
        attendanceMarked += 1;
        if (status === 'absent') attendanceAbsent += 1;
        if (status === 'late') attendanceLate += 1;

        const current = studentTrend.get(studentId) || { total: 0, absent: 0 };
        current.total += 1;
        if (status === 'absent') current.absent += 1;
        studentTrend.set(studentId, current);
      });
    });

    const atRiskStudents = Array.from(studentTrend.values()).filter((entry) => entry.total >= 3 && entry.absent / entry.total >= 0.3).length;

    let feesTotalAmount = 0;
    let feesCollectedAmount = 0;
    let overdueFeesCount = 0;
    let pendingFeesCount = 0;

    fees.forEach((fee: any) => {
      const amount = Number(fee.amount || 0);
      const amountPaid = Number(fee.amountPaid || 0);
      const status = String(fee.status || '').toLowerCase();
      feesTotalAmount += amount;
      feesCollectedAmount += amountPaid;
      if (status === 'overdue') overdueFeesCount += 1;
      if (status === 'pending' || status === 'partial') pendingFeesCount += 1;
    });

    const feesPendingAmount = Math.max(feesTotalAmount - feesCollectedAmount, 0);

    const nextSnapshot: AcademySnapshot = {
      studentsTotal,
      studentsActive,
      studentsOnline,
      teachersTotal,
      teachersActive,
      attendanceSessions: attendance.length,
      attendanceMarked,
      attendanceAbsent,
      attendanceLate,
      attendanceAbsenceRate: attendanceMarked > 0 ? (attendanceAbsent / attendanceMarked) * 100 : 0,
      atRiskStudents,
      feesTotalAmount,
      feesCollectedAmount,
      feesPendingAmount,
      overdueFeesCount,
      pendingFeesCount,
      homeworkCount: homework.length,
      examsCount: exams.length,
      announcementsLast30Days: announcements.filter((a: any) => isWithinLastDays(a.publishedAt || a.createdAt, 30)).length,
      messagesLast30Days: messagesData.filter((m: any) => isWithinLastDays(m.createdAt || m.sentAt, 30)).length,
    };

    setSnapshot(nextSnapshot);
    setLoadingSnapshot(false);
  };

  useEffect(() => {
    loadSnapshot().catch((error) => {
      console.error('Failed to load copilot snapshot:', error);
      setLoadingSnapshot(false);
    });
  }, []);

  const submitPrompt = async (userPrompt: string) => {
    if (!snapshot || !userPrompt.trim()) return;

    const userMsg: CopilotMessage = {
      id: `${Date.now()}-u`,
      role: 'user',
      text: userPrompt.trim(),
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setGenerating(true);

    const prompt = [
      'Use only facts from the provided JSON snapshot. If data is missing, explicitly say "data not available".',
      'Return short, practical output in this exact structure:',
      '1) Priority Risks (max 5 bullets)',
      '2) Recommended Actions (max 5 bullets, each starts with [High], [Medium], or [Low])',
      '3) Draft Messages (max 2 drafts, concise and respectful)',
      '4) Weekly Plan (Monday-Friday checklist)',
      '',
      `Current mode: ${mode}`,
      `User request: ${userPrompt}`,
      `Academy snapshot JSON: ${JSON.stringify(snapshot)}`,
    ].join('\n');

    try {
      let assistantText = '';

      if (!aiConfigured) {
        assistantText = buildFallbackResponse(mode, snapshot);
      } else {
        assistantText = await generateAIText({
          temperature: 0.2,
          maxTokens: 900,
          messages: [
            {
              role: 'system',
              content: 'You are an academy operations copilot for an Islamic educational institution.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
        });
      }

      const assistantMsg: CopilotMessage = {
        id: `${Date.now()}-a`,
        role: 'assistant',
        text: assistantText,
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      console.error('Copilot generation failed:', error);
      const fallbackMsg: CopilotMessage = {
        id: `${Date.now()}-a-fallback`,
        role: 'assistant',
        text: buildFallbackResponse(mode, snapshot),
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setGenerating(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userPrompt = input;
    setInput('');
    await submitPrompt(userPrompt);
  };

  const kpis = useMemo(() => {
    if (!snapshot) return [];
    return [
      {
        label: 'Students',
        value: `${snapshot.studentsActive}/${snapshot.studentsTotal}`,
        sub: 'active/total',
        icon: Users,
      },
      {
        label: 'Teachers',
        value: `${snapshot.teachersActive}/${snapshot.teachersTotal}`,
        sub: 'active/total',
        icon: GraduationCap,
      },
      {
        label: 'Attendance',
        value: `${snapshot.attendanceAbsenceRate.toFixed(1)}%`,
        sub: 'absence rate',
        icon: BookOpen,
      },
      {
        label: 'Pending Fees',
        value: currency.format(snapshot.feesPendingAmount),
        sub: `${snapshot.pendingFeesCount} records`,
        icon: DollarSign,
      },
    ];
  }, [snapshot]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-black text-white flex items-center gap-3">
            <Bot className="text-primary-400" size={36} />
            Academy Operations Copilot
          </h1>
          <p className="text-white mt-2">Role-based AI assistant for admin operations, teachers, and students.</p>
        </div>
        <button
          onClick={() => loadSnapshot()}
          disabled={loadingSnapshot}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 disabled:opacity-60"
        >
          <RefreshCw size={18} className={loadingSnapshot ? 'animate-spin' : ''} />
          Refresh Data Snapshot
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-white/10 rounded-2xl p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-300">{kpi.label}</p>
                  <p className="text-2xl font-black text-white">{kpi.value}</p>
                  <p className="text-xs text-slate-400">{kpi.sub}</p>
                </div>
                <Icon className="text-primary-400" size={24} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-white/10 rounded-2xl p-4">
        <p className="text-white font-bold mb-3">Copilot Mode</p>
        <div className="flex flex-wrap gap-2">
          {(['admin', 'teacher', 'student'] as CopilotMode[]).map((item) => {
            const disabled = !canAccessMode(item);
            return (
              <button
                key={item}
                onClick={() => setMode(item)}
                disabled={disabled}
                className={`px-4 py-2 rounded-lg font-bold transition ${
                  mode === item
                    ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white'
                    : 'bg-white/10 text-slate-300 hover:bg-white/20'
                } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                {MODE_LABELS[item]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-white/10 rounded-2xl p-4">
        <p className="text-white font-bold mb-3">Quick Actions</p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {QUICK_ACTIONS[mode].map((action) => (
            <button
              key={action}
              onClick={() => submitPrompt(action)}
              disabled={generating || loadingSnapshot || !snapshot}
              className="text-left p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 disabled:opacity-50"
            >
              <div className="flex items-start gap-3">
                <Sparkles className="text-accent-400 mt-0.5" size={18} />
                <span className="text-sm">{action}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {!aiConfigured && (
        <div className="bg-slate-800/70 border border-white/10 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="text-primary-300 mt-0.5" size={18} />
          <p className="text-sm text-slate-200">
            OpenRouter is not configured yet, so Copilot is currently using local fallback guidance instead of live AI responses.
          </p>
        </div>
      )}

      {snapshot && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="text-yellow-400 mt-0.5" size={18} />
          <p className="text-sm text-yellow-100">
            AI output is advisory. Review and approve before sending messages or making policy decisions.
          </p>
        </div>
      )}

      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-white/10 rounded-2xl p-4 space-y-4">
        <p className="text-white font-bold">Copilot Conversation</p>

        <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
          {messages.length === 0 ? (
            <div className="text-slate-400 text-sm bg-white/5 rounded-xl p-4">
              Start with a quick action or ask your own question. Copilot will use your current academy snapshot.
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`rounded-xl p-4 border ${
                  message.role === 'assistant'
                    ? 'bg-primary-500/10 border-primary-500/20 text-slate-100'
                    : 'bg-white/5 border-white/10 text-white'
                }`}
              >
                <div className="flex items-center gap-2 mb-2 text-xs uppercase tracking-wide opacity-80">
                  {message.role === 'assistant' ? <ClipboardCheck size={14} /> : <Send size={14} />}
                  {message.role}
                  <span className="ml-auto normal-case">{message.createdAt.toLocaleTimeString()}</span>
                </div>
                <pre className="whitespace-pre-wrap text-sm leading-6 font-sans">{message.text}</pre>
              </div>
            ))
          )}

          {generating && (
            <div className="rounded-xl p-4 border bg-primary-500/10 border-primary-500/20 text-slate-100">
              <div className="flex items-center gap-2 text-sm">
                <RefreshCw className="animate-spin" size={16} />
                Generating recommendations...
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask for reports, risk analysis, draft messages, or weekly plans..."
            rows={3}
            className="flex-1 px-4 py-3 bg-slate-900/70 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-primary-500/60"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || generating || loadingSnapshot || !snapshot}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-bold hover:from-primary-400 hover:to-accent-400 disabled:opacity-50"
          >
            <Send size={18} />
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default AICopilot;
