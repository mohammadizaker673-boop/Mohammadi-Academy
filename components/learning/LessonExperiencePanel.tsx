import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BookMarked, Brain, MessageSquare, NotebookPen, Send, ShieldCheck, Target } from 'lucide-react';
import LearningPathPanel from './LearningPathPanel';
import LessonAITutor from './LessonAITutor';
import LessonRecitationCoach from './LessonRecitationCoach';
import {
  buildLessonInsight,
  buildLessonSpiritualGuidance,
  buildWeakLessonBreakdown,
  createEmptyLessonStudyRecord,
  finalizeLessonSession,
  LessonDiscussionPost,
  LessonRecitationEvaluation,
  LessonRecitationTarget,
  LessonReference,
  LessonStudyStore,
  WeakLessonInsight,
  loadLessonStudyStore,
  markLessonViewed,
  markSpiritualReminderSeen,
  saveLessonStudyStore,
  syncLessonAchievementMetrics,
  syncPracticeChecklistItem,
  syncRecitationMetrics,
  updateLessonRecord,
} from '../../utils/lessonExperience';

interface LessonExperiencePanelProps {
  courseId: string;
  lessonId: string;
  lessonTitle: string;
  lessonContext: string;
  estimatedMinutes: number;
  keyTakeaways: string[];
  reflectionQuestions: string[];
  references: LessonReference[];
  userId?: string | null;
  userName?: string | null;
  userRole?: 'student' | 'teacher' | 'admin';
  completed: boolean;
  quizAttempts: number;
  bestQuizScore: number;
  extensionAvailable?: boolean;
  courseLessons: Array<{ id: string; title: string }>;
  overallProgress: number;
  currentLessonIndex: number;
  totalLessons: number;
  recitationTarget?: LessonRecitationTarget | null;
}

const statusClasses: Record<'on-track' | 'needs-support' | 'high-risk', string> = {
  'on-track': 'bg-green-500/15 text-green-200 border-green-500/30',
  'needs-support': 'bg-amber-500/15 text-amber-200 border-amber-500/30',
  'high-risk': 'bg-rose-500/15 text-rose-200 border-rose-500/30'
};

const LessonExperiencePanel: React.FC<LessonExperiencePanelProps> = ({
  courseId,
  lessonId,
  lessonTitle,
  lessonContext,
  estimatedMinutes,
  keyTakeaways,
  reflectionQuestions,
  references,
  userId,
  userName,
  userRole = 'student',
  completed,
  quizAttempts,
  bestQuizScore,
  extensionAvailable,
  courseLessons,
  overallProgress,
  currentLessonIndex,
  totalLessons,
  recitationTarget,
}) => {
  const [studyStore, setStudyStore] = useState<LessonStudyStore>({ lessons: {} });
  const [loaded, setLoaded] = useState(false);
  const [postDraft, setPostDraft] = useState('');
  const sessionStartedAtRef = useRef(Date.now());

  const persistUpdate = (updater: (current: LessonStudyStore) => LessonStudyStore) => {
    setStudyStore((current) => {
      const next = updater(current);
      if (next !== current && userId) {
        saveLessonStudyStore(courseId, userId, next);
      }
      return next;
    });
  };

  useEffect(() => {
    if (!userId) {
      setStudyStore({ lessons: {} });
      setLoaded(true);
      return;
    }

    setStudyStore(loadLessonStudyStore(courseId, userId));
    setLoaded(true);
  }, [courseId, userId]);

  useEffect(() => {
    if (!loaded || !userId) {
      return;
    }

    persistUpdate((current) => updateLessonRecord(current, lessonId, markLessonViewed));
    sessionStartedAtRef.current = Date.now();

    return () => {
      persistUpdate((current) => updateLessonRecord(current, lessonId, (record) => finalizeLessonSession(record, sessionStartedAtRef.current, estimatedMinutes)));
    };
  }, [courseId, estimatedMinutes, lessonId, loaded, userId]);

  useEffect(() => {
    if (!loaded || !userId) {
      return;
    }

    persistUpdate((current) =>
      updateLessonRecord(current, lessonId, (record) => syncLessonAchievementMetrics(record, completed, quizAttempts, bestQuizScore))
    );
  }, [bestQuizScore, completed, lessonId, loaded, quizAttempts, userId]);

  const currentRecord = studyStore.lessons[lessonId] || createEmptyLessonStudyRecord();
  const insight = useMemo(
    () => buildLessonInsight(currentRecord, { completed, reflectionQuestionCount: reflectionQuestions.length, extensionAvailable }),
    [completed, currentRecord, extensionAvailable, reflectionQuestions.length]
  );

  const weakLessons = useMemo(
    () => buildWeakLessonBreakdown(courseLessons, studyStore).filter((lesson) => lesson.lessonId !== lessonId).slice(0, 3),
    [courseLessons, lessonId, studyStore]
  );

  const spiritualGuidance = useMemo(
    () => buildLessonSpiritualGuidance(lessonTitle, keyTakeaways),
    [keyTakeaways, lessonTitle]
  );

  const activeRecitationTarget = useMemo(
    () => (recitationTarget && (recitationTarget.arabicText || recitationTarget.transliteration) ? recitationTarget : null),
    [recitationTarget]
  );

  const completedPracticeCount = useMemo(
    () => spiritualGuidance.checklist.filter((item) => currentRecord.spiritualState.completedPracticeIds.includes(item.id)).length,
    [currentRecord.spiritualState.completedPracticeIds, spiritualGuidance.checklist]
  );

  const toggleHighlight = (takeaway: string) => {
    persistUpdate((current) =>
      updateLessonRecord(current, lessonId, (record) => {
        const exists = record.highlights.includes(takeaway);
        return {
          ...record,
          highlights: exists
            ? record.highlights.filter((item) => item !== takeaway)
            : [...record.highlights, takeaway]
        };
      })
    );
  };

  const updateReflectionResponse = (index: number, value: string) => {
    persistUpdate((current) =>
      updateLessonRecord(current, lessonId, (record) => ({
        ...record,
        reflectionResponses: {
          ...record.reflectionResponses,
          [`question-${index}`]: value
        }
      }))
    );
  };

  const updateNotes = (value: string) => {
    persistUpdate((current) =>
      updateLessonRecord(current, lessonId, (record) => ({
        ...record,
        notes: value
      }))
    );
  };

  const addDiscussionPost = (kind: LessonDiscussionPost['kind']) => {
    if (!postDraft.trim()) {
      return;
    }

    persistUpdate((current) =>
      updateLessonRecord(current, lessonId, (record) => ({
        ...record,
        discussion: [
          {
            id: `${lessonId}-${Date.now()}`,
            authorName: userName?.trim() || (userRole === 'teacher' ? 'Teacher' : userRole === 'admin' ? 'Admin' : 'Student'),
            authorRole: userRole,
            message: postDraft.trim(),
            kind,
            createdAt: new Date().toISOString()
          },
          ...record.discussion
        ]
      }))
    );

    setPostDraft('');
  };

  const handleRecitationResult = (evaluation: LessonRecitationEvaluation) => {
    persistUpdate((current) =>
      updateLessonRecord(current, lessonId, (record) => syncRecitationMetrics(record, evaluation))
    );
  };

  const handleManualPracticeComplete = () => {
    const fallbackPracticeItem = spiritualGuidance.checklist[spiritualGuidance.checklist.length - 1];
    if (!fallbackPracticeItem) {
      return;
    }

    persistUpdate((current) =>
      updateLessonRecord(current, lessonId, (record) => syncPracticeChecklistItem(record, fallbackPracticeItem.id, true))
    );
  };

  const togglePracticeChecklistItem = (practiceId: string, completed: boolean) => {
    persistUpdate((current) =>
      updateLessonRecord(current, lessonId, (record) => syncPracticeChecklistItem(record, practiceId, completed))
    );
  };

  const markReminderSeen = () => {
    persistUpdate((current) =>
      updateLessonRecord(current, lessonId, markSpiritualReminderSeen)
    );
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-slate-950/30 border border-white/5 p-5 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-violet-300 mb-2 flex items-center gap-2">
              <Brain size={16} /> Learning Intelligence
            </h3>
            <p className="text-sm text-slate-300">This lesson now tracks more than completion, so students can see where understanding is strong and where revision is still needed.</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black text-white">{insight.understandingScore}%</p>
            <div className={`inline-flex mt-2 rounded-full border px-3 py-1 text-xs uppercase tracking-[0.2em] ${statusClasses[insight.status]}`}>
              {insight.status === 'on-track' ? 'On Track' : insight.status === 'needs-support' ? 'Needs Support' : 'High Risk'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-xl bg-white/5 border border-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-black">Lesson Visits</p>
            <p className="text-white text-xl font-bold mt-2">{currentRecord.analytics.viewCount}</p>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-black">Quiz Best Score</p>
            <p className="text-white text-xl font-bold mt-2">{currentRecord.analytics.bestQuizScore || 0}%</p>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-black">{activeRecitationTarget ? 'Recitation Best' : 'Practice Actions'}</p>
            <p className="text-white text-xl font-bold mt-2">{activeRecitationTarget ? `${currentRecord.analytics.recitation.bestScore || 0}%` : `${completedPracticeCount}/${spiritualGuidance.checklist.length}`}</p>
            <p className="text-xs text-slate-400 mt-2">{activeRecitationTarget ? `${currentRecord.analytics.recitation.attempts} attempts` : 'completed today'}</p>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-black">Study Time</p>
            <p className="text-white text-xl font-bold mt-2">{currentRecord.analytics.totalMinutesSpent} min</p>
          </div>
        </div>

        <div className="rounded-xl bg-white/5 border border-white/5 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <p className="text-sm font-semibold text-white">Personalized next step</p>
            <span className="px-3 py-1 rounded-full bg-white/10 text-xs uppercase tracking-[0.2em] text-slate-200">
              {Math.max(1, currentLessonIndex + 1)} of {Math.max(totalLessons, 1)} lessons
            </span>
          </div>
          <p className="text-sm text-slate-200">{insight.nextStep}</p>
          <div className="flex items-start gap-2 mt-4 text-sm text-slate-300">
            <Target size={14} className="text-primary-300 mt-0.5" />
            <span>{overallProgress}% overall course progress.</span>
          </div>
          {insight.reasons.length > 0 && (
            <ul className="space-y-2 mt-4">
              {insight.reasons.map((reason) => (
                <li key={reason} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-amber-300 mt-1.5" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {weakLessons.length > 0 && (
          <div className="rounded-xl bg-white/5 border border-white/5 p-4">
            <p className="text-sm font-semibold text-white mb-3">Weak topic breakdown</p>
            <div className="space-y-2">
              {weakLessons.map((lesson: WeakLessonInsight) => (
                <div key={lesson.lessonId} className="flex items-center justify-between gap-3 rounded-xl bg-slate-900/60 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{lesson.title}</p>
                    <p className="text-xs text-slate-400 uppercase tracking-[0.2em] mt-1">{lesson.status.replace('-', ' ')}</p>
                  </div>
                  <span className="text-sm font-black text-amber-300">{lesson.understandingScore}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <LearningPathPanel
        lessonTitle={lessonTitle}
        lessonContext={lessonContext}
        insight={insight}
        weakLessons={weakLessons}
        references={references}
        overallProgress={overallProgress}
        currentLessonIndex={currentLessonIndex}
        totalLessons={totalLessons}
        extensionAvailable={extensionAvailable}
      />

      {activeRecitationTarget ? (
        <LessonRecitationCoach
          lessonTitle={lessonTitle}
          target={activeRecitationTarget}
          references={references}
          metrics={currentRecord.analytics.recitation}
          onResult={handleRecitationResult}
          onManualPracticeComplete={handleManualPracticeComplete}
        />
      ) : null}

      <LessonAITutor
        lessonTitle={lessonTitle}
        lessonContext={lessonContext}
        reflectionQuestions={reflectionQuestions}
        references={references}
      />

      <div className="rounded-2xl bg-slate-950/30 border border-white/5 p-5 space-y-5">
        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-emerald-300 mb-2 flex items-center gap-2">
            <BookMarked size={16} /> Spiritual Engagement
          </h3>
          <p className="text-sm text-slate-300">This section keeps the lesson tied to worship and lived practice, not just information retention.</p>
        </div>

        <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-black mb-2">Daily Reminder</p>
              <p className="text-sm text-white leading-6">{spiritualGuidance.reminder}</p>
              <p className="text-xs text-slate-400 mt-3">Source anchor: {spiritualGuidance.reminderSource}</p>
            </div>
            <button
              type="button"
              onClick={markReminderSeen}
              className={`px-4 py-2 rounded-xl transition ${currentRecord.spiritualState.reminderSeenAt ? 'bg-emerald-500/15 text-emerald-100' : 'bg-white/10 text-white hover:bg-white/15'}`}
            >
              {currentRecord.spiritualState.reminderSeenAt ? 'Reminder Marked' : 'Mark Reminder Seen'}
            </button>
          </div>
        </div>

        <div className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-black">Contextual Dua</p>
          <p className="text-right text-white text-2xl font-arabic">{spiritualGuidance.duaArabic}</p>
          <p className="text-sm italic text-slate-300">{spiritualGuidance.duaTransliteration}</p>
          <p className="text-sm text-slate-200">{spiritualGuidance.duaTranslation}</p>
        </div>

        <div className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-black">Practice Checklist</p>
            <span className="text-xs uppercase tracking-[0.2em] text-emerald-200">{completedPracticeCount}/{spiritualGuidance.checklist.length} complete</span>
          </div>
          <div className="space-y-3">
            {spiritualGuidance.checklist.map((item) => {
              const completedItem = currentRecord.spiritualState.completedPracticeIds.includes(item.id);
              return (
                <label key={item.id} className={`flex items-start gap-3 rounded-xl border px-4 py-3 transition ${completedItem ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-white/10 bg-slate-900/60'}`}>
                  <input
                    type="checkbox"
                    checked={completedItem}
                    onChange={(event) => togglePracticeChecklistItem(item.id, event.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-white/20 bg-slate-900 text-emerald-400 focus:ring-emerald-400"
                  />
                  <span className={`text-sm ${completedItem ? 'text-emerald-50' : 'text-slate-200'}`}>{item.label}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-slate-950/30 border border-white/5 p-5 space-y-5">
        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary-300 mb-2 flex items-center gap-2">
            <NotebookPen size={16} /> Reflection, Notes, and Highlights
          </h3>
          <p className="text-sm text-slate-300">Turn the lesson from passive watching into active learning by saving notes, responding to prompts, and highlighting the parts you want to revisit.</p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-black mb-3">Tap a takeaway to save it as a personal highlight</p>
          <div className="flex flex-wrap gap-2">
            {keyTakeaways.map((takeaway) => {
              const selected = currentRecord.highlights.includes(takeaway);
              return (
                <button
                  key={takeaway}
                  type="button"
                  onClick={() => toggleHighlight(takeaway)}
                  className={`rounded-full border px-4 py-2 text-sm transition ${selected ? 'border-primary-400 bg-primary-500/15 text-white' : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'}`}
                >
                  {takeaway}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-black mb-3">Personal Notes</p>
          <textarea
            value={currentRecord.notes}
            onChange={(event) => updateNotes(event.target.value)}
            rows={5}
            placeholder="Write your lesson summary, practical action points, or questions to revisit later..."
            className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-primary-500/60"
          />
        </div>

        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-black">Reflection Questions</p>
          {reflectionQuestions.map((question, index) => (
            <div key={`${lessonId}-reflection-${index}`} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-semibold text-white">{question}</p>
              <textarea
                value={currentRecord.reflectionResponses[`question-${index}`] || ''}
                onChange={(event) => updateReflectionResponse(index, event.target.value)}
                rows={3}
                placeholder="Write a thoughtful response in your own words..."
                className="mt-3 w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-primary-500/60"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-slate-950/30 border border-white/5 p-5 space-y-4">
        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-emerald-300 mb-2 flex items-center gap-2">
            <ShieldCheck size={16} /> Verified References
          </h3>
          <p className="text-sm text-slate-300">Each lesson now carries source anchors so students can connect the topic back to Quran and Hadith instead of treating it like generic content.</p>
        </div>

        <div className="space-y-3">
          {references.map((reference) => (
            <div key={reference.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-white font-bold">{reference.citation}</p>
                <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-200 text-[10px] uppercase tracking-[0.2em]">{reference.sourceType}</span>
              </div>
              <p className="text-sm text-slate-200 mt-3">{reference.excerpt}</p>
              <p className="text-xs text-slate-400 mt-3">{reference.connection}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-slate-950/30 border border-white/5 p-5 space-y-4">
        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-amber-300 mb-2 flex items-center gap-2">
            <MessageSquare size={16} /> Lesson Discussion and Teacher Q&A
          </h3>
          <p className="text-sm text-slate-300">Use this thread to ask a teacher, share your action step, or capture a lesson reflection for this topic.</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
          <textarea
            value={postDraft}
            onChange={(event) => setPostDraft(event.target.value)}
            rows={3}
            placeholder="Write a discussion post, ask a teacher for clarification, or share one lesson reflection..."
            className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-primary-500/60"
          />
          <div className="flex flex-wrap justify-between gap-3 items-center">
            <p className="text-xs text-slate-400">Posts are stored for this logged-in user on this device, so teachers or admins can reply when using the same browser profile.</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => addDiscussionPost('discussion')}
                className="px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/15 transition"
              >
                Post Discussion
              </button>
              <button
                type="button"
                onClick={() => addDiscussionPost('reflection')}
                className="px-4 py-2 rounded-xl bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/20 transition"
              >
                Share Reflection
              </button>
              <button
                type="button"
                onClick={() => addDiscussionPost('question')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-bold hover:from-primary-400 hover:to-accent-400 transition"
              >
                <Send size={14} className="inline mr-2" /> Ask Teacher
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {currentRecord.discussion.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm text-slate-400">
              No discussion posts yet for this lesson. Start with a question, an action step, or one point you want to remember.
            </div>
          ) : (
            currentRecord.discussion.map((post) => (
              <div key={post.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-white">{post.authorName}</span>
                  <span className="px-2 py-1 rounded-full bg-white/10 text-[10px] uppercase tracking-[0.2em] text-slate-300">{post.authorRole}</span>
                  <span className="px-2 py-1 rounded-full bg-primary-500/15 text-[10px] uppercase tracking-[0.2em] text-primary-200">{post.kind}</span>
                  <span className="ml-auto text-xs text-slate-400">{new Date(post.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-sm text-slate-200 mt-3 leading-6">{post.message}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonExperiencePanel;