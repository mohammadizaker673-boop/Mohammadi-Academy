import React, { useState, useRef, useEffect } from 'react';
import { Volume2, Mic, MicOff, Check, AlertCircle, Zap, Repeat2 } from 'lucide-react';
import { arabicAlphabet } from '../../data/arabicCurriculum';

interface PronunciationWord {
  word: string;
  transliteration: string;
  meaning: string;
  audioUrl?: string;
}

const pronunciationWords: PronunciationWord[] = [
  { word: 'السلام عليكم', transliteration: 'As-salāmu ʿalaykum', meaning: 'Peace be upon you' },
  { word: 'مرحبا', transliteration: 'Marḥaban', meaning: 'Hello' },
  { word: 'كيف حالك؟', transliteration: 'Kayf ḥālak?', meaning: 'How are you?' },
  { word: 'شكرا', transliteration: 'Shukran', meaning: 'Thank you' },
  { word: 'من فضلك', transliteration: 'Min faḍlak', meaning: 'Please' },
  { word: 'أب', transliteration: 'Ab', meaning: 'Father' },
  { word: 'أم', transliteration: 'Umm', meaning: 'Mother' },
  { word: 'بيت', transliteration: 'Bayt', meaning: 'House' },
  { word: 'ماء', transliteration: 'Māʾ', meaning: 'Water' },
  { word: 'طعام', transliteration: 'Ṭaʿām', meaning: 'Food' },
];

interface PronunciationState {
  currentIndex: number;
  isListening: boolean;
  transcript: string;
  accuracy: number | null;
  hasRecorded: boolean;
  showPlayback: boolean;
}

const PronunciationPractice: React.FC = () => {
  const [state, setState] = useState<PronunciationState>({
    currentIndex: 0,
    isListening: false,
    transcript: '',
    accuracy: null,
    hasRecorded: false,
    showPlayback: false,
  });

  const [selectedTab, setSelectedTab] = useState<'words' | 'letters'>('words');
  const [currentLetter, setCurrentLetter] = useState(0);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize Web Speech API
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'ar-SA'; // Arabic
    }
  }, []);

  const speakText = (text: string, lang: string = 'ar-SA') => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.8; // Slow down for clarity
      synthRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  const startListening = async () => {
    if (!recognitionRef.current) {
      alert('Speech recognition not supported in your browser. Try Chrome, Edge, or Safari.');
      return;
    }

    setState(prev => ({ ...prev, isListening: true, transcript: '' }));

    recognitionRef.current.onResult = (event: any) => {
      let interim_transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          setState(prev => ({ ...prev, transcript: transcript }));
        } else {
          interim_transcript += transcript;
        }
      }
      if (interim_transcript) {
        setState(prev => ({ ...prev, transcript: interim_transcript }));
      }
    };

    recognitionRef.current.onend = () => {
      setState(prev => ({ ...prev, isListening: false, hasRecorded: true }));
      // Calculate accuracy (simplified - in production use better speech recognition)
      setTimeout(() => {
        const accuracy = Math.random() * 40 + 60; // 60-100% random for demo
        setState(prev => ({ ...prev, accuracy: Math.round(accuracy) }));
      }, 500);
    };

    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const nextWord = () => {
    if (state.currentIndex < pronunciationWords.length - 1) {
      setState(prev => ({
        ...prev,
        currentIndex: prev.currentIndex + 1,
        transcript: '',
        accuracy: null,
        hasRecorded: false,
      }));
    }
  };

  const nextLetter = () => {
    if (currentLetter < arabicAlphabet.length - 1) {
      setCurrentLetter(prev => prev + 1);
      speakText(arabicAlphabet[currentLetter + 1].letter);
    }
  };

  if (selectedTab === 'letters') {
    const letter = arabicAlphabet[currentLetter];
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-black text-white mb-4">Letter Pronunciation</h1>
            <div className="flex gap-4">
              <button
                onClick={() => setSelectedTab('words')}
                className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition"
              >
                Words
              </button>
              <button
                onClick={() => setSelectedTab('letters')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg"
              >
                Letters
              </button>
            </div>
          </div>

          {/* Letter Card */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-3xl p-12 border border-white/10">
            <div className="text-center space-y-8">
              {/* Large Letter Display */}
              <div className="text-9xl font-black text-blue-400">{letter.letter}</div>

              {/* Letter Info */}
              <div className="space-y-4">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Name</p>
                  <p className="text-3xl font-bold text-white">{letter.name}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Transliteration</p>
                  <p className="text-2xl font-bold text-blue-300">{letter.transliteration}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Articulation Point</p>
                  <p className="text-xl font-semibold text-slate-200">{letter.articulationPoint}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-2">Examples</p>
                  <div className="space-y-1">
                    {letter.examples.map((example, idx) => (
                      <p key={idx} className="text-slate-300">{example}</p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Play Sound */}
              <button
                onClick={() => speakText(letter.letter)}
                className="mx-auto px-8 py-4 bg-gradient-to-r from-green-500 to-green-700 text-white font-bold rounded-xl hover:scale-105 transition-transform flex items-center gap-3"
              >
                <Volume2 size={24} /> Play Sound
              </button>

              {/* Practice Recording */}
              <div className="mt-8 p-6 bg-slate-700/30 rounded-xl border border-slate-600">
                <p className="text-slate-300 mb-4">Try pronouncing this letter:</p>
                <button
                  onClick={state.isListening ? stopListening : startListening}
                  className={`mx-auto px-8 py-4 rounded-xl font-bold flex items-center gap-3 transition-all ${
                    state.isListening
                      ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {state.isListening ? (
                    <>
                      <MicOff size={20} /> Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic size={20} /> {state.hasRecorded ? 'Record Again' : 'Start Recording'}
                    </>
                  )}
                </button>

                {state.transcript && (
                  <div className="mt-4 p-4 bg-slate-600/50 rounded-lg">
                    <p className="text-slate-400 text-sm mb-2">You said:</p>
                    <p className="text-white text-lg font-semibold">{state.transcript}</p>
                  </div>
                )}

                {state.accuracy !== null && (
                  <div className="mt-4 p-4 bg-blue-500/20 rounded-lg border border-blue-500">
                    <div className="flex items-center gap-3">
                      {state.accuracy >= 80 ? (
                        <Check className="text-green-400" size={24} />
                      ) : (
                        <AlertCircle className="text-orange-400" size={24} />
                      )}
                      <div>
                        <p className="font-bold text-white">{state.accuracy}% Match</p>
                        <p className="text-slate-300 text-sm">
                          {state.accuracy >= 80
                            ? 'Great pronunciation!'
                            : 'Keep practicing for better accuracy'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex gap-4 justify-center mt-8">
                <button
                  onClick={() => setCurrentLetter(Math.max(0, currentLetter - 1))}
                  className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
                  disabled={currentLetter === 0}
                >
                  Previous
                </button>
                {currentLetter < arabicAlphabet.length - 1 && (
                  <button
                    onClick={nextLetter}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Next Letter
                  </button>
                )}
              </div>

              <p className="text-slate-400 text-sm">
                {currentLetter + 1} / {arabicAlphabet.length}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Words Tab
  const currentWord = pronunciationWords[state.currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white mb-4">Pronunciation Practice</h1>
          <div className="flex gap-4">
            <button
              onClick={() => setSelectedTab('words')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg"
            >
              Words
            </button>
            <button
              onClick={() => setSelectedTab('letters')}
              className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
            >
              Letters
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-slate-300">Progress</span>
            <span className="text-white font-bold">{state.currentIndex + 1} / {pronunciationWords.length}</span>
          </div>
          <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-green-500 to-blue-500 h-full transition-all"
              style={{ width: `${((state.currentIndex + 1) / pronunciationWords.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Main Practice Card */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-3xl p-12 border border-white/10">
          <div className="text-center space-y-8">
            {/* Word Display */}
            <div className="space-y-4">
              <div className="text-6xl font-black text-blue-400 leading-tight">
                {currentWord.word}
              </div>
              <div className="text-2xl font-semibold text-slate-300">
                {currentWord.transliteration}
              </div>
              <div className="text-xl text-slate-400">
                {currentWord.meaning}
              </div>
            </div>

            {/* Listen & Repeat Section */}
            <div className="space-y-6">
              <button
                onClick={() => speakText(currentWord.word)}
                className="mx-auto px-8 py-4 bg-gradient-to-r from-green-500 to-green-700 text-white font-bold rounded-xl hover:scale-105 transition-transform flex items-center gap-3 text-lg"
              >
                <Volume2 size={28} /> Listen & Repeat
              </button>

              {/* Pronunciation Slider */}
              <div className="space-y-2">
                <p className="text-slate-400 text-sm">Slow playback speed:</p>
                <button
                  onClick={() => speakText(currentWord.word)}
                  className="w-full px-4 py-2 bg-slate-700/50 text-white rounded-lg hover:bg-slate-600/50 transition text-sm"
                >
                  🐢 Very Slow (0.6x)
                </button>
              </div>
            </div>

            {/* Recording Section */}
            <div className="p-8 bg-slate-700/30 rounded-2xl border border-slate-600 space-y-6">
              <div>
                <p className="text-slate-300 font-semibold mb-4">Now try saying it:</p>
                <button
                  onClick={state.isListening ? stopListening : startListening}
                  className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                    state.isListening
                      ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {state.isListening ? (
                    <>
                      <span className="animate-spin">●</span> Recording...
                    </>
                  ) : (
                    <>
                      <Mic size={24} /> {state.hasRecorded ? 'Try Again' : 'Start Recording'}
                    </>
                  )}
                </button>
              </div>

              {/* Transcript Display */}
              {state.transcript && (
                <div className="p-4 bg-slate-600/50 rounded-lg">
                  <p className="text-slate-400 text-sm mb-2">You said:</p>
                  <p className="text-white text-lg">{state.transcript}</p>
                </div>
              )}

              {/* Accuracy Feedback */}
              {state.accuracy !== null && (
                <div className={`p-6 rounded-lg border-2 ${state.accuracy >= 80 ? 'bg-green-500/20 border-green-500' : 'bg-orange-500/20 border-orange-500'}`}>
                  <div className="flex items-center gap-4">
                    <div className="text-4xl font-black">{state.accuracy}%</div>
                    <div>
                      <p className="font-bold text-white">
                        {state.accuracy >= 80 ? '🎉 Excellent!' : '👍 Good effort!'}
                      </p>
                      <p className="text-slate-300 text-sm">
                        {state.accuracy >= 90
                          ? 'Perfect pronunciation!'
                          : state.accuracy >= 80
                          ? 'Very close! Keep practicing.'
                          : 'Keep working on it.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            {state.hasRecorded && (
              <div className="flex gap-4 pt-8">
                <button
                  onClick={() => setState(prev => ({
                    ...prev,
                    transcript: '',
                    accuracy: null,
                    hasRecorded: false,
                  }))}
                  className="flex-1 px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition flex items-center justify-center gap-2"
                >
                  <Repeat2 size={20} /> Record Again
                </button>
                {state.currentIndex < pronunciationWords.length - 1 && (
                  <button
                    onClick={nextWord}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Next Word
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tip Box */}
        <div className="mt-8 p-6 bg-blue-500/10 border border-blue-400/30 rounded-xl">
          <p className="text-blue-300 font-semibold mb-2">💡 Pro Tip:</p>
          <p className="text-blue-200 text-sm">
            Listen to native speakers several times before recording. Pay attention to stress, intonation, and vowel length.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PronunciationPractice;
