import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Check, AlertCircle } from 'lucide-react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { arabicSimilarity } from '../../utils/arabicSimilarity';

const LETTERS = ['ا', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي'];

interface LivePronunciationPracticeProps {
  studentId: string;
  lessonId: string;
}

/**
 * Real pronunciation practice using the browser's own speech recognition
 * (Web Speech API, Arabic). The score is a direct comparison of what was
 * recognised against the letter — never a random number. Each attempt is
 * saved to Firestore so the teacher can see it.
 */
const LivePronunciationPractice: React.FC<LivePronunciationPracticeProps> = ({ studentId, lessonId }) => {
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [heardNothing, setHeardNothing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef('');
  const letterRef = useRef<string | null>(null);

  useEffect(() => {
    letterRef.current = selectedLetter;
  }, [selectedLetter]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'ar-SA';
    }
    return () => {
      try { recognitionRef.current?.abort(); } catch { /* already stopped */ }
    };
  }, []);

  const startListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Try Chrome, Edge, or Safari.');
      return;
    }
    transcriptRef.current = '';
    setTranscript('');
    setAccuracy(null);
    setHeardNothing(false);
    setSaveError(false);
    setIsListening(true);

    recognitionRef.current.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript as string;
        if (event.results[i].isFinal) {
          transcriptRef.current = text;
          setTranscript(text);
        } else {
          interim += text;
        }
      }
      if (interim) {
        transcriptRef.current = interim;
        setTranscript(interim);
      }
    };

    recognitionRef.current.onend = async () => {
      setIsListening(false);
      const letter = letterRef.current;
      if (!letter) return;
      const heard = transcriptRef.current.trim();
      const score = arabicSimilarity(heard, letter);
      if (score === null) {
        setHeardNothing(true);
        return;
      }
      setAccuracy(score);
      // Save the real attempt for the teacher.
      setSaving(true);
      try {
        await addDoc(collection(db, 'pronunciation_attempts'), {
          studentId,
          lessonId,
          letter,
          transcript: heard,
          accuracy: score,
          createdAt: new Date().toISOString(),
        });
      } catch (err) {
        console.error('Could not save pronunciation attempt:', err);
        setSaveError(true);
      } finally {
        setSaving(false);
      }
    };

    recognitionRef.current.onerror = () => {
      setIsListening(false);
      setHeardNothing(true);
    };

    recognitionRef.current.start();
  };

  const stopListening = () => {
    try { recognitionRef.current?.stop(); } catch { /* already stopped */ }
  };

  return (
    <div>
      {!selectedLetter && (
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-bold mb-3">Select a letter to practice</p>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
            {LETTERS.map(letter => (
              <button
                key={letter}
                type="button"
                onClick={() => setSelectedLetter(letter)}
                className="px-3 py-2 rounded-lg bg-white/10 text-white text-lg font-arabic font-bold hover:bg-primary-500/30 transition border border-white/10 hover:border-primary-500/40"
              >
                {letter}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedLetter && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-white font-black text-2xl font-arabic">{selectedLetter}</p>
            <button
              type="button"
              onClick={() => {
                setSelectedLetter(null);
                setTranscript('');
                setAccuracy(null);
                setHeardNothing(false);
              }}
              className="text-xs text-slate-400 hover:text-slate-300 transition"
            >
              ← Choose another letter
            </button>
          </div>

          <button
            type="button"
            onClick={isListening ? stopListening : startListening}
            className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition ${
              isListening
                ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isListening ? <><MicOff size={20} /> Stop Recording</> : <><Mic size={20} /> Start Recording</>}
          </button>

          {transcript && (
            <div className="p-4 bg-slate-900/70 rounded-lg">
              <p className="text-slate-400 text-sm mb-1">You said:</p>
              <p className="text-white text-lg font-arabic">{transcript}</p>
            </div>
          )}

          {heardNothing && (
            <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-orange-400 shrink-0 mt-0.5" size={20} />
              <p className="text-orange-200 text-sm">
                We could not hear you clearly. Check your microphone and try again — no score is shown when nothing was recognised.
              </p>
            </div>
          )}

          {accuracy !== null && (
            <div className={`p-4 rounded-lg border ${accuracy >= 80 ? 'bg-green-500/10 border-green-500/40' : 'bg-orange-500/10 border-orange-500/40'}`}>
              <div className="flex items-center gap-3">
                {accuracy >= 80 ? <Check className="text-green-400" size={24} /> : <AlertCircle className="text-orange-400" size={24} />}
                <div>
                  <p className="font-bold text-white text-lg">{accuracy}% Match</p>
                  <p className="text-slate-300 text-sm">
                    {accuracy >= 80 ? 'Great pronunciation!' : 'Keep practicing — listen to the letter and try again.'}
                  </p>
                  {saving && <p className="text-slate-400 text-xs mt-1">Saving your attempt…</p>}
                  {saveError && <p className="text-orange-300 text-xs mt-1">Your score is shown above, but the attempt could not be saved for your teacher.</p>}
                  {!saving && !saveError && <p className="text-slate-400 text-xs mt-1">Attempt saved for your teacher.</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LivePronunciationPractice;
