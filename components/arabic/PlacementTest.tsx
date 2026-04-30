import React, { useState } from 'react';
import { ArabicLevel, PlacementTestQuestion } from '../../types/arabic-learning.types';
import { CheckCircle, Clock, Target } from 'lucide-react';

const placementTestQuestions: PlacementTestQuestion[] = [
  // A1 Questions
  {
    id: 'pt001',
    question: 'What does "مرحبا" mean?',
    options: ['Goodbye', 'Hello', 'Please', 'Thank you'],
    correctAnswer: 'Hello',
    level: 'A1',
    category: 'vocabulary'
  },
  {
    id: 'pt002',
    question: 'Complete the sentence: أنا _____ (I am a student)',
    options: ['طالب', 'كتاب', 'باب', 'قلم'],
    correctAnswer: 'طالب',
    level: 'A1',
    category: 'grammar'
  },
  {
    id: 'pt003',
    question: 'How do you say "book" in Arabic?',
    options: ['قلم', 'كتاب', 'باب', 'بيت'],
    correctAnswer: 'كتاب',
    level: 'A1',
    category: 'vocabulary'
  },
  // A2 Questions
  {
    id: 'pt004',
    question: 'Identify the correct nominal sentence:',
    options: ['البيت كبير', 'كتب الولد', 'ذهب محمد', 'أكل الطالب'],
    correctAnswer: 'البيت كبير',
    level: 'A2',
    category: 'grammar'
  },
  {
    id: 'pt005',
    question: 'What is the plural of "كتاب" (book)?',
    options: ['كتابين', 'كتب', 'كتابات', 'كتابون'],
    correctAnswer: 'كتب',
    level: 'A2',
    category: 'grammar'
  },
  // B1 Questions
  {
    id: 'pt006',
    question: 'Conjugate the verb "كتب" (to write) in present tense for "I":',
    options: ['كتبت', 'أكتب', 'كتب', 'يكتب'],
    correctAnswer: 'أكتب',
    level: 'B1',
    category: 'grammar'
  },
  {
    id: 'pt007',
    question: 'What is the feminine form of "معلم" (teacher)?',
    options: ['معلمة', 'معلما', 'معلمتان', 'معلمون'],
    correctAnswer: 'معلمة',
    level: 'B1',
    category: 'grammar'
  },
  // B2 Questions
  {
    id: 'pt008',
    question: 'What is Form II of the root "ك-ت-ب"?',
    options: ['كاتب', 'كتّب', 'مكتوب', 'كتاب'],
    correctAnswer: 'كتّب',
    level: 'B2',
    category: 'grammar'
  },
  {
    id: 'pt009',
    question: 'Identify the إضافة (Idafa/possessive construct):',
    options: ['البيت الكبير', 'بيت الرجل', 'بيت كبير', 'في البيت'],
    correctAnswer: 'بيت الرجل',
    level: 'B2',
    category: 'grammar'
  },
  // C1 Questions
  {
    id: 'pt010',
    question: 'What type of plural is "رجال" (men)?',
    options: ['Sound masculine', 'Sound feminine', 'Broken plural', 'Dual'],
    correctAnswer: 'Broken plural',
    level: 'C1',
    category: 'grammar'
  }
];

interface PlacementTestProps {
  onComplete: (level: ArabicLevel) => void;
  onSkip: () => void;
}

const PlacementTest: React.FC<PlacementTestProps> = ({ onComplete, onSkip }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    
    if (currentQuestion < placementTestQuestions.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(prev => prev + 1);
      }, 300);
    } else {
      setTimeout(() => {
        calculateLevel();
      }, 300);
    }
  };

  const calculateLevel = () => {
    // Count correct answers per level
    const levelScores: Record<string, { correct: number; total: number }> = {
      A1: { correct: 0, total: 0 },
      A2: { correct: 0, total: 0 },
      B1: { correct: 0, total: 0 },
      B2: { correct: 0, total: 0 },
      C1: { correct: 0, total: 0 },
      C2: { correct: 0, total: 0 }
    };

    placementTestQuestions.forEach(q => {
      levelScores[q.level].total++;
      if (answers[q.id] === q.correctAnswer) {
        levelScores[q.level].correct++;
      }
    });

    // Determine level based on scores
    let determinedLevel: ArabicLevel = 'A1';
    
    if (levelScores.A1.correct / levelScores.A1.total < 0.7) {
      determinedLevel = 'A1';
    } else if (levelScores.A2.correct / levelScores.A2.total < 0.7) {
      determinedLevel = 'A2';
    } else if (levelScores.B1.correct / levelScores.B1.total < 0.7) {
      determinedLevel = 'B1';
    } else if (levelScores.B2.correct / levelScores.B2.total < 0.7) {
      determinedLevel = 'B2';
    } else {
      determinedLevel = 'C1';
    }

    setShowResult(true);
    setTimeout(() => {
      onComplete(determinedLevel);
    }, 3000);
  };

  if (showResult) {
    const correctCount = placementTestQuestions.filter(
      q => answers[q.id] === q.correctAnswer
    ).length;
    const percentage = (correctCount / placementTestQuestions.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-6">
        <div className="max-w-2xl w-full bg-white/10 backdrop-blur-xl rounded-3xl p-12 border border-white/20 text-center">
          <div className="mb-6">
            <CheckCircle className="mx-auto text-green-400" size={64} />
          </div>
          <h2 className="text-4xl font-black text-white mb-4">Test Complete!</h2>
          <p className="text-xl text-slate-300 mb-6">
            You answered {correctCount} out of {placementTestQuestions.length} questions correctly
          </p>
          <div className="text-6xl font-black text-primary-400 mb-4">{Math.round(percentage)}%</div>
          <p className="text-lg text-slate-300">
            Determining your level and preparing your personalized curriculum...
          </p>
        </div>
      </div>
    );
  }

  const question = placementTestQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / placementTestQuestions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-20 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-white mb-4">Arabic Placement Test</h1>
          <p className="text-xl text-slate-300 mb-4">
            Let's determine your current level
          </p>
          <button
            onClick={onSkip}
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            Skip test and start from beginning →
          </button>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-slate-300">
              Question {currentQuestion + 1} of {placementTestQuestions.length}
            </span>
            <span className="text-sm font-bold text-primary-400">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-blue-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-primary-500/20 rounded-xl">
              <Target className="text-primary-400" size={24} />
            </div>
            <div className="flex-1">
              <div className="inline-block px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-bold rounded-full mb-3">
                {question.level} Level • {question.category}
              </div>
              <h3 className="text-2xl font-bold text-white">{question.question}</h3>
            </div>
          </div>

          <div className="space-y-3">
            {question.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(question.id, option)}
                disabled={!!answers[question.id]}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  answers[question.id] === option
                    ? 'border-primary-400 bg-primary-500/20 text-white'
                    : 'border-white/20 bg-white/5 text-white hover:border-primary-400/50 hover:bg-white/10'
                } disabled:opacity-50`}
              >
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 font-bold text-sm">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="font-bold">{option}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-2 text-sm text-slate-400">
            <Clock size={16} />
            <span>Take your time - there's no time limit</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlacementTest;
