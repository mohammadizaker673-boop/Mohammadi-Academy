import React, { useEffect, useRef, useState } from 'react';
import { Mic, StopCircle, Play, CheckCircle2, Upload } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { db, storage } from '../../services/firebase';
import { collection, query, where, orderBy, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import hifzDataService from '../../services/hifzDataService';
import type { MemorizationRecord } from '../../types/hifz.types';

// Hifz test: the student recites a page they have actually memorized.
// The prompt is a random page from their real memorization records, the
// recording is uploaded to Firebase Storage and saved as a real
// memorization_submission for the teacher to review. No fake scores —
// a recording is either submitted or it isn't.
const TestInterface: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [memorizations, setMemorizations] = useState<MemorizationRecord[]>([]);
  // `any` because the service maps Supabase rows to surahNumber/timestamp/
  // qualityScore at runtime (see hifzDataService.getStudentMemorizations),
  // which the declared MemorizationRecord type does not list.
  const [prompt, setPrompt] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!user?.uid) return;
    let cancelled = false;
    (async () => {
      try {
        const [memos, subs] = await Promise.all([
          hifzDataService.getStudentMemorizations(user.uid).catch(() => []),
          getDocs(query(
            collection(db, 'memorization_submissions'),
            where('studentId', '==', user.uid),
            orderBy('submittedAt', 'desc'),
          )).catch(() => null),
        ]);
        if (cancelled) return;
        setMemorizations(memos);
        if (subs) {
          setHistory(subs.docs.map((d) => ({ id: d.id, ...d.data() })).filter((s: any) => s.testType === 'hifz-test'));
        }
      } catch (err) {
        console.error('Failed to load test data:', err);
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.uid]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const pickPrompt = () => {
    if (memorizations.length === 0) return;
    const next = memorizations[Math.floor(Math.random() * memorizations.length)];
    setPrompt(next);
    setRecordedBlob(null);
    setSubmitted(false);
    setSubmitError('');
    setRecordingTime(0);
  };

  const startRecording = async () => {
    setSubmitError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        setRecordedBlob(new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' }));
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
    } catch {
      setSubmitError('Could not access the microphone. Please allow microphone access and try again.');
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const submitTest = async () => {
    if (!recordedBlob || !prompt || !user) return;
    setIsUploading(true);
    setSubmitError('');
    try {
      const storageRef = ref(storage, `memorization-recordings/${user.uid}/test-${Date.now()}.webm`);
      await uploadBytes(storageRef, recordedBlob);
      const audioUrl = await getDownloadURL(storageRef);
      await addDoc(collection(db, 'memorization_submissions'), {
        studentId: user.uid,
        studentEmail: user.email,
        surah: prompt.surahNumber,
        ayahStart: prompt.ayahStart,
        ayahEnd: prompt.ayahEnd,
        page: prompt.pageNumber,
        juz: prompt.juzNumber,
        audioUrl,
        durationSeconds: recordingTime,
        testType: 'hifz-test',
        status: 'pending',
        submittedAt: serverTimestamp(),
      });
      setSubmitted(true);
      setHistory((h) => [
        {
          surah: prompt.surahNumber,
          ayahStart: prompt.ayahStart,
          ayahEnd: prompt.ayahEnd,
          page: prompt.pageNumber,
          juz: prompt.juzNumber,
          audioUrl,
          durationSeconds: recordingTime,
          status: 'pending',
          submittedAt: new Date(),
        },
        ...h,
      ]);
    } catch (err) {
      console.error('Failed to submit test recording:', err);
      setSubmitError('Could not submit your recording. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const formatTime = (secs: number) => `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0f2b] via-[#0e1436] to-[#131b41] text-slate-100 p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f2b] via-[#0e1436] to-[#131b41] text-slate-100 p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 mb-2">
          Hifz Test
        </h1>
        <p className="text-slate-400">Recite a page you have memorized and submit it for your teacher to review</p>
      </div>

      {loadError && <p className="text-red-300 mb-8">Could not load your memorization records. Please try again later.</p>}

      {memorizations.length === 0 ? (
        <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border border-blue-400/30 rounded-lg p-8 text-center">
          <p className="text-cyan-300 text-lg font-semibold">Memorize some pages first</p>
          <p className="text-slate-300 mt-2">
            There are no memorized pages on your record yet, so there is nothing to test. Once you start
            memorizing, a test will pick a random page from your record.
          </p>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-slate-800/30 to-slate-700/10 border border-slate-600/30 rounded-lg p-8 mb-8">
          {!prompt ? (
            <div className="text-center">
              <p className="text-slate-300 mb-6">
                You have {memorizations.length} memorized {memorizations.length === 1 ? 'page' : 'pages'} on record.
                Start a test to be given one at random.
              </p>
              <button
                onClick={pickPrompt}
                className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white rounded-xl font-bold hover:from-cyan-400 hover:to-emerald-400 transition-all"
              >
                Start a Test
              </button>
            </div>
          ) : (
            <div>
              <p className="text-slate-400 text-sm mb-1">Recite from memory:</p>
              <p className="text-2xl font-bold text-cyan-300 mb-1">
                Surah {prompt.surahNumber}, Ayahs {prompt.ayahStart}–{prompt.ayahEnd}
              </p>
              <p className="text-slate-400 mb-6">Page {prompt.pageNumber} • Juz {prompt.juzNumber}</p>

              {submitted ? (
                <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-6 text-center">
                  <CheckCircle2 className="text-emerald-400 mx-auto mb-2" size={32} />
                  <p className="text-emerald-300 font-semibold">Test submitted</p>
                  <p className="text-slate-300 text-sm mt-1">Your teacher can review your recitation and give feedback.</p>
                  <button
                    onClick={pickPrompt}
                    className="mt-4 px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold transition-colors"
                  >
                    Test Another Page
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  {!isRecording && !recordedBlob && (
                    <button
                      onClick={startRecording}
                      className="flex items-center gap-2 px-8 py-4 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-300 rounded-xl font-bold transition-colors"
                    >
                      <Mic size={20} /> Start Recording
                    </button>
                  )}
                  {isRecording && (
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex items-center gap-2 text-red-400 font-bold">
                        <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                        Recording… {formatTime(recordingTime)}
                      </div>
                      <button
                        onClick={stopRecording}
                        className="flex items-center gap-2 px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold transition-colors"
                      >
                        <StopCircle size={20} /> Stop Recording
                      </button>
                    </div>
                  )}
                  {recordedBlob && !isRecording && (
                    <div className="flex flex-col items-center gap-3">
                      <p className="text-slate-300 flex items-center gap-2">
                        <Play size={16} /> Recording ready — {formatTime(recordingTime)}
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => { setRecordedBlob(null); setRecordingTime(0); }}
                          className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold transition-colors"
                        >
                          Re-record
                        </button>
                        <button
                          onClick={submitTest}
                          disabled={isUploading}
                          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white rounded-xl font-bold hover:from-cyan-400 hover:to-emerald-400 transition-all disabled:opacity-50"
                        >
                          <Upload size={18} /> {isUploading ? 'Submitting…' : 'Submit Test'}
                        </button>
                      </div>
                    </div>
                  )}
                  {submitError && <p className="text-red-300 text-sm">{submitError}</p>}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Real test history */}
      <div className="bg-gradient-to-br from-slate-800/30 to-slate-700/10 border border-slate-600/30 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Your Past Tests</h2>
        {history.length > 0 ? (
          <div className="space-y-3">
            {history.map((s: any, i: number) => (
              <div key={s.id || i} className="flex items-center justify-between p-3 bg-slate-900/30 rounded-lg">
                <div>
                  <p className="font-semibold text-slate-100">
                    Surah {s.surah}, Ayahs {s.ayahStart}–{s.ayahEnd}
                  </p>
                  <p className="text-sm text-slate-400">
                    Page {s.page} • Juz {s.juz} • {s.durationSeconds ? `${s.durationSeconds}s` : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-300">
                    {s.submittedAt?.toDate ? s.submittedAt.toDate().toLocaleDateString() : s.submittedAt ? new Date(s.submittedAt).toLocaleDateString() : ''}
                  </p>
                  <p className="text-xs text-amber-300 capitalize">{s.status || 'pending'}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400">No tests submitted yet.</p>
        )}
      </div>
    </div>
  );
};

export default TestInterface;
