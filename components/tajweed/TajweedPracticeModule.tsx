import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Target, RotateCcw, Volume2, CheckCircle } from 'lucide-react';

interface TajweedPracticeModuleProps {
  level: 'beginner' | 'intermediate' | 'advanced';
  onExerciseComplete: (score: number, passed: boolean) => void;
}

const EXERCISES_BY_LEVEL = {
  beginner: [
    {
      id: 'noon-rules',
      title: 'Noon Sakinah Rules',
      description: 'Identify and practice Noon Sakinah rules',
      questions: [
        {
          id: 'q1',
          question: 'Which Noon rule applies to "من يشاء"?',
          options: [
            { id: 'a', text: 'Izhar', isCorrect: false },
            { id: 'b', text: 'Idgham', isCorrect: false },
            { id: 'c', text: 'Iqlab', isCorrect: true },
            { id: 'd', text: 'Ikhfa', isCorrect: false }
          ]
        },
        {
          id: 'q2',
          question: 'When does Izhar apply in Noon Sakinah?',
          options: [
            { id: 'a', text: 'Before ء, ه, ع, ح, غ, خ', isCorrect: true },
            { id: 'b', text: 'Before any letter', isCorrect: false },
            { id: 'c', text: 'At the end of words', isCorrect: false },
            { id: 'd', text: 'Before vowels', isCorrect: false }
          ]
        }
      ]
    },
    {
      id: 'meem-rules',
      title: 'Meem Sakinah Practice',
      description: 'Practice Meem Sakinah rules',
      questions: [
        {
          id: 'q3',
          question: 'Which rule applies to "أم باع"?',
          options: [
            { id: 'a', text: 'Idgham', isCorrect: true },
            { id: 'b', text: 'Izhar', isCorrect: false },
            { id: 'c', text: 'Ikhfa', isCorrect: false },
            { id: 'd', text: 'Iqlab', isCorrect: false }
          ]
        }
      ]
    }
  ],
  intermediate: [
    {
      id: 'lam-rules',
      title: 'Alif-Lam Rules',
      description: 'Solar and lunar letter distinction',
      questions: [
        {
          id: 'i1',
          question: 'Which is a solar letter?',
          options: [
            { id: 'a', text: 'ل', isCorrect: false },
            { id: 'b', text: 'ت', isCorrect: true },
            { id: 'c', text: 'م', isCorrect: false },
            { id: 'd', text: 'ج', isCorrect: false }
          ]
        }
      ]
    },
    {
      id: 'madd-practice',
      title: 'Madd Types',
      description: 'Different types of Madd',
      questions: [
        {
          id: 'i2',
          question: 'How many counts for Necessary Madd?',
          options: [
            { id: 'a', text: '2 counts', isCorrect: false },
            { id: 'b', text: '4-6 counts', isCorrect: true },
            { id: 'c', text: '8 counts', isCorrect: false },
            { id: 'd', text: 'Variable', isCorrect: false }
          ]
        }
      ]
    }
  ],
  advanced: [
    {
      id: 'complex-rules',
      title: 'Complex Rule Application',
      description: 'Advanced application of multiple rules',
      questions: [
        {
          id: 'a1',
          question: 'In "الحمد لله", identify all Tajweed rules:',
          options: [
            { id: 'a', text: 'Solar Lam + Idgham', isCorrect: true },
            { id: 'b', text: 'Only Solar Lam', isCorrect: false },
            { id: 'c', text: 'Lunar Lam + Ikhfa', isCorrect: false },
            { id: 'd', text: 'Madd only', isCorrect: false }
          ]
        }
      ]
    }
  ]
};

export const TajweedPracticeModule: React.FC<TajweedPracticeModuleProps> = ({
  level,
  onExerciseComplete
}) => {
  const { isDark } = useTheme();
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);

  const exercises = EXERCISES_BY_LEVEL[level];
  const currentExercise = exercises.find(e => e.id === selectedExerciseId);
  const currentQuestion = currentExercise?.questions[questionIdx];

  const handleSelectOption = (questionId: string, optionId: string) => {
    setSelectedAnswers({ ...selectedAnswers, [questionId]: optionId });
  };

  const handleNext = () => {
    if (!currentQuestion || !selectedAnswers[currentQuestion.id]) {
      alert('Please select an answer');
      return;
    }

    if (questionIdx < (currentExercise?.questions.length || 0) - 1) {
      setQuestionIdx(questionIdx + 1);
    } else {
      calculateScore();
    }
  };

  const calculateScore = () => {
    if (!currentExercise) return;

    let correct = 0;
    currentExercise.questions.forEach(q => {
      const selectedId = selectedAnswers[q.id];
      const isCorrect = q.options.some(o => o.id === selectedId && o.isCorrect);
      if (isCorrect) correct++;
    });

    const percentage = Math.round((correct / currentExercise.questions.length) * 100);
    const passed = percentage >= 70;
    setFinalScore(percentage);
    setShowResults(true);
    onExerciseComplete(percentage, passed);
  };

  const resetExercise = () => {
    setSelectedExerciseId(null);
    setQuestionIdx(0);
    setSelectedAnswers({});
    setShowResults(false);
    setFinalScore(null);
  };

  if (!selectedExerciseId) {
    return (
      <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-lg`}>
        <div className={`${isDark ? 'bg-slate-700 border-slate-600' : 'bg-blue-50 border-blue-200'} border-b p-6`}>
          <h2 className={`text-2xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Target className="w-6 h-6 text-blue-500" />
            Practice Exercises - {level.charAt(0).toUpperCase() + level.slice(1)}
          </h2>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exercises.map(ex => (
              <button
                key={ex.id}
                onClick={() => {
                  setSelectedExerciseId(ex.id);
                  setQuestionIdx(0);
                  setSelectedAnswers({});
                }}
                className={`text-left p-6 rounded-lg border transition-all hover:shadow-lg ${
                  isDark ? 'bg-slate-700 border-slate-600 hover:bg-slate-600' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {ex.title}
                </h3>
                <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {ex.description}
                </p>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-500 text-white">
                  {ex.questions.length} Questions
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (showResults && finalScore !== null) {
    const passed = finalScore >= 70;
    return (
      <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-lg p-8 text-center`}>
        <div className="text-6xl mb-6">{passed ? '🎉' : '📚'}</div>
        <h2 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {passed ? 'Excellent!' : 'Keep Practicing!'}
        </h2>
        <p className={`text-5xl font-bold mb-6 ${passed ? 'text-green-500' : 'text-yellow-500'}`}>
          {finalScore}%
        </p>
        <button
          onClick={resetExercise}
          className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:shadow-lg transition-all inline-flex items-center gap-2"
        >
          <RotateCcw className="w-5 h-5" />
          Try Another
        </button>
      </div>
    );
  }

  const progressPercent = ((questionIdx + 1) / (currentExercise?.questions.length || 1)) * 100;

  return (
    <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-lg`}>
      <div className={`${isDark ? 'bg-slate-700 border-slate-600' : 'bg-blue-50 border-blue-200'} border-b p-6`}>
        <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {currentExercise?.title}
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className={`h-2 rounded-full ${isDark ? 'bg-slate-600' : 'bg-gray-200'}`}>
              <div
                className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
          <span className={`text-sm font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {questionIdx + 1}/{currentExercise?.questions.length}
          </span>
        </div>
      </div>

      <div className="p-8 max-w-2xl mx-auto">
        {currentQuestion && (
          <div>
            <h3 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {currentQuestion.question}
            </h3>

            <div className="space-y-3 mb-8">
              {currentQuestion.options.map(option => {
                const isSelected = selectedAnswers[currentQuestion.id] === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleSelectOption(currentQuestion.id, option.id)}
                    className={`w-full p-4 rounded-lg text-left border-2 transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500/10'
                        : isDark ? 'border-slate-600 hover:border-slate-500' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-blue-500 bg-blue-500' : isDark ? 'border-slate-500' : 'border-gray-300'
                      }`}>
                        {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                      <span className={isDark ? 'text-white' : 'text-gray-900'}>{option.text}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleNext}
              disabled={!selectedAnswers[currentQuestion.id]}
              className={`w-full py-3 rounded-lg font-semibold transition-all ${
                selectedAnswers[currentQuestion.id]
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg'
                  : isDark ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-300 text-gray-600 cursor-not-allowed'
              }`}
            >
              {questionIdx === (currentExercise?.questions.length || 0) - 1 ? 'Finish Exercise' : 'Next'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TajweedPracticeModule;
