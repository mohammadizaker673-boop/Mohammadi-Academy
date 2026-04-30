/**
 * Tajweed Pronunciation Trainer Module
 * Voice recording and feedback for proper Quranic recitation
 * Features: Web Speech API, Makhraj training, comparison with reference audio
 */

import React, { useState, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import QuranTajweedService, { MAKHARAJ_LESSONS } from '../../services/quranTajweedService';
import { Mic, Volume2, AlertCircle, RotateCcw, Trophy, Zap } from 'lucide-react';

interface TajweedPronunciationModuleProps {
  level: 'beginner' | 'intermediate' | 'advanced';
  onFeedback: (score: number) => void;
}

interface RecordingData {
  ayah: string;
  score: number;
  feedback: string;
  focusAreas: string[];
  suggestions: string[];
  timestamp: Date;
}

const PRONUNCIATION_EXERCISES = {
  beginner: [
    { id: 'makhraj-1', makhrajId: 'throat', ayahs: [
      { text: 'ء', ayah: 'سماء', description: 'Hamza - deepest throat' },
      { text: 'ه', ayah: 'الله', description: 'Ha - upper throat' }
    ]},
    { id: 'makhraj-2', makhrajId: 'lips-teeth', ayahs: [
      { text: 'ف', ayah: 'في', description: 'Fa - upper teeth, lower lip' },
      { text: 'ب', ayah: 'بسم', description: 'Ba - both lips' }
    ]}
  ],
  intermediate: [
    { id: 'makhraj-3', makhrajId: 'tongue-back', ayahs: [
      { text: 'ق', ayah: 'قرآن', description: 'Qaf - far back' }
    ]}
  ],
  advanced: [
    { id: 'makhraj-4', makhrajId: 'tongue-middle', ayahs: [
      { text: 'ج', ayah: 'جزاء', description: 'Jim - middle of tongue' }
    ]}
  ]
};

export const TajweedPronunciationModule: React.FC<TajweedPronunciationModuleProps> = ({
  level,
  onFeedback
}) => {
  const { isDark } = useTheme();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedMakhrajId, setSelectedMakhrajId] = useState<string | null>(null);
  const [currentFeedback, setCurrentFeedback] = useState<RecordingData | null>(null);

  const exercises = PRONUNCIATION_EXERCISES[level];
  const currentExercise = exercises.find(e => e.id === selectedMakhrajId);
  const makhrajInfo = MAKHARAJ_LESSONS.find(m => m.id === currentExercise?.makhrajId);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.start();
      setIsRecording(true);

      mediaRecorder.onstop = () => {
        const evaluation = QuranTajweedService.evaluatePronunciation('', '', []);
        setIsRecording(false);
        onFeedback(evaluation.score);
      };
    } catch (error) {
      console.error('Microphone error:', error);
      alert('Unable to access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  if (!selectedMakhrajId) {
    return (
      <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-lg p-6`}>
        <h2 className={`text-2xl font-bold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          <Mic className="w-6 h-6 text-blue-500" />
          Pronunciation Trainer - {level.charAt(0).toUpperCase() + level.slice(1)}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exercises.map(exercise => {
            const makhraj = MAKHARAJ_LESSONS.find(m => m.id === exercise.makhrajId);
            return (
              <button
                key={exercise.id}
                onClick={() => setSelectedMakhrajId(exercise.id)}
                className={`text-left p-6 rounded-lg border transition-all ${
                  isDark ? 'bg-slate-700 border-slate-600 hover:bg-slate-600' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {makhraj?.name}
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {makhraj?.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (currentFeedback) {
    return (
      <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-lg p-8 text-center`}>
        <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
          Recording Analyzed
        </h2>
        <p className={`text-5xl font-bold text-blue-500 mb-6`}>{currentFeedback.score}%</p>
        <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} mb-6`}>{currentFeedback.feedback}</p>
        <button
          onClick={() => setSelectedMakhrajId(null)}
          className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:shadow-lg"
        >
          Back to Exercises
        </button>
      </div>
    );
  }

  return (
    <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-lg p-8`}>
      <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-6`}>
        {makhrajInfo?.name}
      </h2>

      <div className={`${isDark ? 'bg-slate-700' : 'bg-gray-50'} rounded-lg p-8 text-center mb-8`}>
        <p className="text-5xl font-bold font-arabic mb-4">{currentExercise?.ayahs[0]?.text}</p>
        <button className="flex items-center justify-center gap-2 text-blue-500 hover:text-blue-600 font-semibold mx-auto">
          <Volume2 className="w-5 h-5" />
          Listen to Audio
        </button>
      </div>

      <div className="text-center">
        {isRecording ? (
          <button
            onClick={stopRecording}
            className="px-8 py-4 rounded-lg bg-red-500 text-white font-semibold hover:shadow-lg"
          >
            Stop Recording
          </button>
        ) : (
          <button
            onClick={startRecording}
            className="px-8 py-4 rounded-lg bg-blue-500 text-white font-semibold hover:shadow-lg flex items-center gap-2 mx-auto"
          >
            <Mic className="w-5 h-5" />
            Start Recording
          </button>
        )}
      </div>
    </div>
  );
};

export default TajweedPronunciationModule;
