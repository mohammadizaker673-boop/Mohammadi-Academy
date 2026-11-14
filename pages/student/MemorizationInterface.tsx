import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, RotateCcw, Mic, Upload, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { addDoc, collection } from 'firebase/firestore';
import { db, storage } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';

// The text shown on this page is Surah Al-Baqarah, Ayahs 1–3
// (Madani mushaf, Juz 1, page 2) — the labels now match the text.
const PAGE = {
  juzNumber: 1,
  pageNumber: 2,
  surahNumber: 2,
  surahName: 'Surah Al-Baqarah',
  ayahRange: '1-3',
  ayahStart: 1,
  ayahEnd: 3,
  arabicText: `الم۔ ذٰلِكَ الْكِتٰبُ لَا رَیْبَ فِیۡہِ ہُدًی لِّلْمُتَّقِیْنَ۔ الَّذِیْنَ یُؤْمِنُوْنَ بِالْغَیْبِ وَیُقِیْمُوْنَ الصَّلٰوۃَ وَمِمَّا رَزَقْنٰہُمْ یُنْفِقُوْنَ۔`,
  transliteration: `Alif Laam Meem. Dhaalika al-kitabu la rayba fee hi hudan lil-muttaqeen.`,
  translation: `This is the Book; in it is guidance sure, without doubt, to those who fear Allah.`,
};

// Recitation audio: verse-by-verse MP3s from everyayah.com.
// Only reciters whose folders were verified to return the files are listed.
const RECITERS: Array<{ name: string; folder: string }> = [
  { name: 'Mishary Rashid Alafasy', folder: 'Alafasy_128kbps' },
  { name: 'Maher Al-Muaiqly', folder: 'Maher_AlMuaiqly_64kbps' },
  { name: 'Mahmoud Khalil Al-Husary', folder: 'Husary_128kbps' },
];

const verseUrl = (folder: string, surah: number, ayah: number) =>
  `https://everyayah.com/data/${folder}/${String(surah).padStart(3, '0')}${String(ayah).padStart(3, '0')}.mp3`;

const MemorizationInterface: React.FC = () => {
  const { user } = useAuth();
  const [recording, setRecording] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [textVisible, setTextVisible] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [volume, setVolume] = useState(70);
  const [reciterIndex, setReciterIndex] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState<'idle' | 'done' | 'error'>('idle');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordedBlobRef = useRef<Blob | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const verseIndexRef = useRef(0);

  const playVerse = (index: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    verseIndexRef.current = index;
    audio.src = verseUrl(RECITERS[reciterIndex].folder, PAGE.surahNumber, PAGE.ayahStart + index);
    audio.playbackRate = playbackSpeed;
    audio.volume = volume / 100;
    audio.play().catch(() => setAudioPlaying(false));
    setAudioPlaying(true);
  };

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audioPlaying) {
      audio.pause();
      setAudioPlaying(false);
    } else {
      if (!audio.src) {
        playVerse(0);
      } else {
        audio.playbackRate = playbackSpeed;
        audio.volume = volume / 100;
        audio.play().catch(() => setAudioPlaying(false));
        setAudioPlaying(true);
      }
    }
  };

  // When the reciter changes, restart the audio from the first verse.
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    }
    setAudioPlaying(false);
    verseIndexRef.current = 0;
  }, [reciterIndex]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onEnded = () => {
      const next = verseIndexRef.current + 1;
      const total = PAGE.ayahEnd - PAGE.ayahStart + 1;
      if (next < total) {
        playVerse(next);
      } else {
        setAudioPlaying(false);
      }
    };
    audio.addEventListener('ended', onEnded);
    return () => audio.removeEventListener('ended', onEnded);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reciterIndex, playbackSpeed, volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.playbackRate = playbackSpeed;
      audio.volume = volume / 100;
    }
  }, [playbackSpeed, volume]);

  // Stop the audio when the page unmounts.
  useEffect(() => () => { audioRef.current?.pause(); }, []);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      recordedChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) recordedChunksRef.current.push(event.data);
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: mediaRecorder.mimeType || 'audio/webm' });
        recordedBlobRef.current = blob;
        setHasRecording(true);
        streamRef.current?.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      };
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setRecording(true);
      setRecordingTime(0);
      setSubmitState('idle');
      timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const handleStopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
  };

  const handleSubmitRecording = async () => {
    const blob = recordedBlobRef.current;
    if (!blob || !user) return;
    setSubmitting(true);
    setSubmitState('idle');
    try {
      // Upload the real recording to Firebase Storage, then save a real
      // review record to Firestore for the teacher.
      const ext = blob.type.includes('mp4') ? 'mp4' : blob.type.includes('ogg') ? 'ogg' : 'webm';
      const path = `memorization-recordings/${user.uid}/${Date.now()}.${ext}`;
      const fileRef = storageRef(storage, path);
      await uploadBytes(fileRef, blob);
      const audioUrl = await getDownloadURL(fileRef);
      await addDoc(collection(db, 'memorization_submissions'), {
        studentId: user.uid,
        studentEmail: user.email || '',
        surahNumber: PAGE.surahNumber,
        surahName: PAGE.surahName,
        ayahStart: PAGE.ayahStart,
        ayahEnd: PAGE.ayahEnd,
        pageNumber: PAGE.pageNumber,
        juzNumber: PAGE.juzNumber,
        audioUrl,
        durationSeconds: recordingTime,
        status: 'pending',
        submittedAt: new Date().toISOString(),
      });
      setSubmitState('done');
      setHasRecording(false);
      recordedBlobRef.current = null;
      setRecordingTime(0);
    } catch (error) {
      console.error('Failed to submit recording:', error);
      setSubmitState('error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f2b] via-[#0e1436] to-[#131b41] text-slate-100 p-6">
      {/* Hidden audio element: plays the recitation verse by verse. */}
      <audio ref={audioRef} preload="none" />
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
              Memorization Session
            </h1>
            <p className="text-slate-400 mt-2">Page {PAGE.pageNumber} • {PAGE.surahName} • Ayah {PAGE.ayahRange}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400">Juz {PAGE.juzNumber}</p>
            <p className="text-xs text-slate-500">Reciter: {RECITERS[reciterIndex].name}</p>
          </div>
        </div>
      </div>

      {/* Main Memorization Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Quranic Text Panel */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-slate-800/30 to-slate-700/10 border border-slate-600/30 rounded-lg p-8">
            {/* Arabic Text */}
            <div className="mb-8 p-6 bg-blue-900/20 border border-blue-400/30 rounded-lg">
              <p className="text-right text-4xl font-arabic leading-relaxed text-blue-100">
                {textVisible ? PAGE.arabicText : '••••••••••••••••••••••••••••'}
              </p>
              <div className="flex justify-between mt-4">
                <button
                  onClick={() => setTextVisible(!textVisible)}
                  className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
                >
                  {textVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                  {textVisible ? 'Hide Text' : 'Show Text'}
                </button>
                <span className="text-xs text-blue-300">Madani Script • 16-Line Format</span>
              </div>
            </div>

            {/* Transliteration */}
            <div className="mb-6 p-4 bg-slate-900/30 rounded">
              <p className="text-sm text-slate-400 mb-2">Transliteration:</p>
              <p className="text-slate-200">{PAGE.transliteration}</p>
            </div>

            {/* Translation */}
            <div className="p-4 bg-slate-900/30 rounded">
              <p className="text-sm text-slate-400 mb-2">Translation (English):</p>
              <p className="text-slate-200">{PAGE.translation}</p>
            </div>
          </div>
        </div>

        {/* Audio & Recording Controls */}
        <div className="space-y-4">
          {/* Audio Player */}
          <div className="bg-gradient-to-br from-emerald-900/30 to-emerald-600/10 border border-emerald-400/30 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">🎵 Audio Reference</h3>

            {/* Reciter Selection */}
            <div className="mb-4">
              <label className="block text-sm text-slate-400 mb-2">Choose Reciter:</label>
              <select
                value={reciterIndex}
                onChange={(e) => setReciterIndex(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-slate-100"
              >
                {RECITERS.map((r, idx) => (
                  <option key={r.folder} value={idx}>{r.name}</option>
                ))}
              </select>
            </div>

            {/* Playback Controls */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <button
                  onClick={handlePlayPause}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2"
                >
                  {audioPlaying ? <Pause size={20} /> : <Play size={20} />}
                  {audioPlaying ? 'Pause' : 'Play'}
                </button>
                <button
                  onClick={() => { const a = audioRef.current; if (a) { a.pause(); a.removeAttribute('src'); a.load(); } setAudioPlaying(false); verseIndexRef.current = 0; }}
                  className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg"
                  aria-label="Restart from the beginning"
                >
                  <RotateCcw size={20} />
                </button>
              </div>

              {/* Playback Speed */}
              <div>
                <label className="block text-xs text-slate-400 mb-2">Speed:</label>
                <div className="flex gap-1">
                  {[0.75, 1, 1.25, 1.5].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => setPlaybackSpeed(speed)}
                      className={`px-2 py-1 text-xs rounded ${
                        playbackSpeed === speed
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Volume */}
              <div>
                <label className="block text-xs text-slate-400 mb-2">Volume:</label>
                <div className="flex items-center gap-2">
                  <Volume2 size={16} className="text-slate-400" />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Recording Interface */}
          <div className="bg-gradient-to-br from-purple-900/30 to-purple-600/10 border border-purple-400/30 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">🎙️ Record Recitation</h3>

            {/* Recording Status */}
            <div
              className={`p-3 rounded-lg mb-4 text-sm ${
                recording ? 'bg-red-500/20 border border-red-400/50' : 'bg-slate-900/30 border border-slate-600/30'
              }`}
            >
              {recording ? (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span>Recording... {recordingTime}s</span>
                </div>
              ) : (
                <span className="text-slate-400">Ready to record</span>
              )}
            </div>

            {/* Recording Controls */}
            <div className="space-y-3">
              <button
                onClick={recording ? handleStopRecording : handleStartRecording}
                className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition ${
                  recording
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-purple-500 hover:bg-purple-600'
                }`}
              >
                <Mic size={20} />
                {recording ? 'Stop Recording' : 'Start Recording'}
              </button>

              {hasRecording && !recording && (
                <button
                  onClick={handleSubmitRecording}
                  disabled={submitting || !user}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <Upload size={20} />
                  {submitting ? 'Uploading…' : 'Submit for Review'}
                </button>
              )}

              {submitState === 'done' && (
                <p className="text-sm text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 size={16} /> Recording submitted — your teacher can review it and give feedback.
                </p>
              )}
              {submitState === 'error' && (
                <p className="text-sm text-red-300 flex items-center gap-2">
                  <AlertCircle size={16} /> Could not submit your recording. Please try again.
                </p>
              )}
              {!user && (
                <p className="text-sm text-slate-400">Sign in to submit your recording for teacher review.</p>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 border border-amber-400/30 rounded-lg p-4">
            <p className="text-sm text-amber-100">
              <strong>💡 Tip:</strong> Listen to the recitation first, then try to memorize and recite from memory. Record your recitation for teacher feedback.
            </p>
          </div>
        </div>
      </div>

      {/* Tajweed Color Reference */}
      <div className="bg-gradient-to-br from-slate-800/30 to-slate-700/10 border border-slate-600/30 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">Tajweed Color Guide</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded" />
            <span className="text-sm text-slate-300">Noon Sakinah</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded" />
            <span className="text-sm text-slate-300">Meem Sakinah</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded" />
            <span className="text-sm text-slate-300">Emphatic Letters</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded" />
            <span className="text-sm text-slate-300">Madd (Elongation)</span>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-cyan-900/30 to-cyan-600/10 border border-cyan-400/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="text-cyan-400 flex-shrink-0 mt-1" size={20} />
            <div>
              <p className="font-semibold mb-1">After Recording:</p>
              <p className="text-sm text-slate-400">Your recording is saved for your teacher, who can review your Tajweed and accuracy and give feedback.</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-900/30 to-purple-600/10 border border-purple-400/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-purple-400 flex-shrink-0 mt-1" size={20} />
            <div>
              <p className="font-semibold mb-1">Practice Tips:</p>
              <p className="text-sm text-slate-400">Memorize a few ayahs at a time. Use the Hide Text mode to practice from memory only.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemorizationInterface;
