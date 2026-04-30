import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Award, RotateCcw, Volume2 } from 'lucide-react';

interface TajweedAssessmentModuleProps {
  level: 'beginner' | 'intermediate' | 'advanced';
  onAssessmentComplete: (score: number, level: string) => void;
}

const ASSESSMENT_DATA = {
  beginner: {
    title: 'Beginner Level Assessment',
    description: 'Test your understanding of basic Tajweed rules',
    questions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        question: 'What does Tajweed mean?',
        options: [
          { id: 'a', text: 'The art of Quranic recitation', isCorrect: true },
          { id: 'b', text: 'A prayer method', isCorrect: false },
          { id: 'c', text: 'Islamic law', isCorrect: false },
          { id: 'd', text: 'Chapter of Quran', isCorrect: false }
        ],
        points: 5
      },
      {
        id: 'q2',
        type: 'multiple-choice',
        question: 'How many basic Tajweed rules are there?',
        options: [
          { id: 'a', text: '2', isCorrect: false },
          { id: 'b', text: '6', isCorrect: true },
          { id: 'c', text: '10', isCorrect: false },
          { id: 'd', text: '15', isCorrect: false }
        ],
        points: 5
      },
      {
        id: 'q3',
        type: 'text',
        question: 'What is the first rule of Noon Sakinah? (Answer: izhar, idgham, iqlab, or ikhfa)',
        correctAnswers: ['izhar'],
        points: 10
      },
      {
        id: 'q4',
        type: 'multiple-choice',
        question: 'Madd means:',
        options: [
          { id: 'a', text: 'Merging letters', isCorrect: false },
          { id: 'b', text: 'Elongation of vowels', isCorrect: true },
          { id: 'c', text: 'Doubling letters', isCorrect: false },
          { id: 'd', text: 'Stopping at a point', isCorrect: false }
        ],
        points: 5
      },
      {
        id: 'q5',
        type: 'multiple-choice',
        question: 'How many articulation points (Makhraj) exist?',
        options: [
          { id: 'a', text: '4', isCorrect: false },
          { id: 'b', text: '6', isCorrect: true },
          { id: 'c', text: '8', isCorrect: false },
          { id: 'd', text: '10', isCorrect: false }
        ],
        points: 5
      }
    ],
    passingScore: 60,
    timeLimit: 15
  },
  intermediate: {
    title: 'Intermediate Level Assessment',
    description: 'Test your understanding of advanced Tajweed rules',
    questions: [
      {
        id: 'i1',
        type: 'multiple-choice',
        question: 'Alif-Lam rule: Solar letters use...',
        options: [
          { id: 'a', text: 'Ikhfa', isCorrect: false },
          { id: 'b', text: 'Izhar', isCorrect: true },
          { id: 'c', text: 'Idgham', isCorrect: false },
          { id: 'd', text: 'Iqlab', isCorrect: false }
        ],
        points: 10
      },
      {
        id: 'i2',
        type: 'multiple-choice',
        question: 'Necessary Madd duration is:',
        options: [
          { id: 'a', text: '2 counts', isCorrect: false },
          { id: 'b', text: '4-6 counts', isCorrect: true },
          { id: 'c', text: '6-8 counts', isCorrect: false },
          { id: 'd', text: 'Variable', isCorrect: false }
        ],
        points: 10
      },
      {
        id: 'i3',
        type: 'text',
        question: 'Hamza replacement rule is called: (Answer: iqlab)',
        correctAnswers: ['iqlab'],
        points: 15
      },
      {
        id: 'i4',
        type: 'multiple-choice',
        question: 'How many recognized Qirat (readings) exist?',
        options: [
          { id: 'a', text: '5', isCorrect: false },
          { id: 'b', text: '7', isCorrect: false },
          { id: 'c', text: '10', isCorrect: true },
          { id: 'd', text: '14', isCorrect: false }
        ],
        points: 10
      },
      {
        id: 'i5',
        type: 'multiple-choice',
        question: 'Gunnah (nasalization) applies to:',
        options: [
          { id: 'a', text: 'Only Meem', isCorrect: false },
          { id: 'b', text: 'Noon and Meem', isCorrect: true },
          { id: 'c', text: 'All letters', isCorrect: false },
          { id: 'd', text: 'Vowels only', isCorrect: false }
        ],
        points: 10
      }
    ],
    passingScore: 70,
    timeLimit: 25
  },
  advanced: {
    title: 'Advanced Assessment',
    description: 'Comprehensive evaluation of all Tajweed knowledge',
    questions: [
      {
        id: 'a1',
        type: 'multiple-choice',
        question: 'What differentiates master-level recitation?',
        options: [
          { id: 'a', text: 'Speed', isCorrect: false },
          { id: 'b', text: 'Perfect Makhraj and rule application', isCorrect: true },
          { id: 'c', text: 'Emotional expression', isCorrect: false },
          { id: 'd', text: 'Voice volume', isCorrect: false }
        ],
        points: 15
      },
      {
        id: 'a2',
        type: 'multiple-choice',
        question: 'Idgham with Gunnah applies when Noon/Meem precedes:',
        options: [
          { id: 'a', text: 'Any letter', isCorrect: false },
          { id: 'b', text: 'Specific letters: ya, noon, meem, waw', isCorrect: true },
          { id: 'c', text: 'Throat letters only', isCorrect: false },
          { id: 'd', text: 'Vowels', isCorrect: false }
        ],
        points: 15
      },
      {
        id: 'a3',
        type: 'text',
        question: 'The main difference between readings is in: (Answer: application, rules, or makhraj)',
        correctAnswers: ['application', 'makhraj', 'application of makhraj'],
        points: 15
      },
      {
        id: 'a4',
        type: 'multiple-choice',
        question: 'Which principle guides all Tajweed rules?',
        options: [
          { id: 'a', text: 'Speed of recitation', isCorrect: false },
          { id: 'b', text: 'Proper pronunciation from correct Makhraj', isCorrect: true },
          { id: 'c', text: 'Emotional connection', isCorrect: false },
          { id: 'd', text: 'Memory retention', isCorrect: false }
        ],
        points: 15
      },
      {
        id: 'a5',
        type: 'multiple-choice',
        question: 'Advanced students should focus on:',
        options: [
          { id: 'a', text: 'Memorizing rules', isCorrect: false },
          { id: 'b', text: 'Consistent, flawless application across entire Quran', isCorrect: true },
          { id: 'c', text: 'Varying their pronunciation', isCorrect: false },
          { id: 'd', text: 'Teaching others', isCorrect: false }
        ],
        points: 15
      }
    ],
    passingScore: 75,
    timeLimit: 35
  }
};

export const TajweedAssessmentModule: React.FC<TajweedAssessmentModuleProps> = ({
  level,
  onAssessmentComplete
}) => {
  const { isDark } = useTheme();
  const [testStarted, setTestStarted] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  const assessment = ASSESSMENT_DATA[level];
  const currentQuestion = assessment.questions[currentQuestionIdx];

  React.useEffect(() => {
    if (testStarted && timeRemaining === null) {
      setTimeRemaining(assessment.timeLimit * 60);
    }
  }, [testStarted, assessment.timeLimit]);

  React.useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return;
    const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeRemaining]);

  const handleSelectAnswer = (optionId: string) => {
    setAnswers({ ...answers, [currentQuestion.id]: optionId });
  };

  const handleTextAnswer = (text: string) => {
    setAnswers({ ...answers, [currentQuestion.id]: text });
  };

  const handleNext = () => {
    if (!answers[currentQuestion.id]) {
      alert('Please answer the question');
      return;
    }

    if (currentQuestionIdx < assessment.questions.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    } else {
      calculateScore();
    }
  };

  const calculateScore = () => {
    let earned = 0;
    let total = 0;

    assessment.questions.forEach(question => {
      total += question.points;
      const userAnswer = answers[question.id];

      if (question.type === 'multiple-choice') {
        const selected = question.options?.find(o => o.id === userAnswer);
        if (selected?.isCorrect) earned += question.points;
      } else {
        const correctAnswers = (question as any).correctAnswers || [];
        if (correctAnswers.some((ans: string) => userAnswer?.toLowerCase().includes(ans.toLowerCase()))) {
          earned += question.points;
        }
      }
    });

    const percentage = Math.round((earned / total) * 100);
    setFinalScore(percentage);
    setShowResults(true);
    onAssessmentComplete(percentage, level);
  };

  const resetTest = () => {
    setTestStarted(false);
    setCurrentQuestionIdx(0);
    setAnswers({});
    setShowResults(false);
    setFinalScore(null);
    setTimeRemaining(null);
  };

  if (!testStarted) {
    return (
      <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-lg`}>
        <div className={`${isDark ? 'bg-slate-700 border-slate-600' : 'bg-blue-50 border-blue-200'} border-b p-6`}>
          <h2 className={`text-2xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Award className="w-6 h-6 text-blue-500" />
            Assessment - {level.charAt(0).toUpperCase() + level.slice(1)}
          </h2>
        </div>
        <div className="p-8">
          <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {assessment.title}
          </h3>
          <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {assessment.description}
          </p>
          <div className={`p-4 rounded-lg mb-6 ${isDark ? 'bg-slate-700 border-slate-600' : 'bg-gray-50 border-gray-200'} border`}>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-semibold text-blue-500">{assessment.questions.length}</p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Questions</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-500">{assessment.timeLimit} min</p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Duration</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-500">{assessment.passingScore}%</p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Pass Score</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setTestStarted(true)}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:shadow-lg transition-all"
          >
            Start Assessment
          </button>
        </div>
      </div>
    );
  }

  if (showResults && finalScore !== null) {
    const passed = finalScore >= assessment.passingScore;
    return (
      <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-lg p-8 text-center`}>
        <div className="text-6xl mb-6">{passed ? '🏆' : '📚'}</div>
        <h2 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {passed ? 'Assessment Passed!' : 'Assessment Completed'}
        </h2>
        <p className={`text-5xl font-bold mb-6 ${passed ? 'text-green-500' : 'text-yellow-500'}`}>
          {finalScore}%
        </p>
        <p className={`text-lg mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {passed ? 'Excellent! You have mastered this level.' : 'Keep practicing to improve your score.'}
        </p>
        <button
          onClick={resetTest}
          className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:shadow-lg transition-all inline-flex items-center gap-2"
        >
          <RotateCcw className="w-5 h-5" />
          Try Again
        </button>
      </div>
    );
  }

  const progressPercent = ((currentQuestionIdx + 1) / assessment.questions.length) * 100;
  const timeMinutes = timeRemaining ? Math.floor(timeRemaining / 60) : 0;
  const timeSeconds = timeRemaining ? timeRemaining % 60 : 0;

  return (
    <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-lg`}>
      <div className={`${isDark ? 'bg-slate-700 border-slate-600' : 'bg-blue-50 border-blue-200'} border-b p-6`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Question {currentQuestionIdx + 1} of {assessment.questions.length}
          </h3>
          <div className={`px-3 py-1 rounded font-semibold text-sm ${
            timeRemaining && timeRemaining < 300 ? 'text-red-500 bg-red-500/20' : 'text-blue-500'
          }`}>
            {timeMinutes}:{timeSeconds.toString().padStart(2, '0')}
          </div>
        </div>
        <div className={`w-full h-2 rounded-full ${isDark ? 'bg-slate-600' : 'bg-gray-200'}`}>
          <div className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all" style={{ width: `${progressPercent}%` }}></div>
        </div>
      </div>

      <div className="p-8 max-w-2xl mx-auto">
        <h3 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {currentQuestion.question}
        </h3>

        {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
          <div className="space-y-3 mb-6">
            {currentQuestion.options.map(option => (
              <button
                key={option.id}
                onClick={() => handleSelectAnswer(option.id)}
                className={`w-full p-4 rounded-lg text-left border-2 transition-all ${
                  answers[currentQuestion.id] === option.id
                    ? 'border-blue-500 bg-blue-500/10'
                    : isDark ? 'border-slate-600 hover:border-slate-500' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    answers[currentQuestion.id] === option.id ? 'border-blue-500 bg-blue-500' : isDark ? 'border-slate-500' : 'border-gray-300'
                  }`}>
                    {answers[currentQuestion.id] === option.id && <div className="w-2 h-2 bg-white rounded-full"></div>}
                  </div>
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>{option.text}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {currentQuestion.type === 'text' && (
          <div className="mb-6">
            <input
              type="text"
              placeholder="Type your answer..."
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => handleTextAnswer(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border-2 border-blue-500 ${
                isDark ? 'bg-slate-700 text-white' : 'bg-white text-gray-900'
              } focus:outline-none`}
            />
          </div>
        )}

        <button
          onClick={handleNext}
          disabled={!answers[currentQuestion.id]}
          className={`w-full py-3 rounded-lg font-semibold transition-all ${
            answers[currentQuestion.id]
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg'
              : isDark ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-300 text-gray-600 cursor-not-allowed'
          }`}
        >
          {currentQuestionIdx === assessment.questions.length - 1 ? 'Submit Assessment' : 'Next Question'}
        </button>
      </div>
    </div>
  );
};

export default TajweedAssessmentModule;
