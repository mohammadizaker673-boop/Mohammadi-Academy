import React, { useState, useMemo } from 'react';
import { BarChart3, TrendingUp, Award, Target, Calendar, Clock } from 'lucide-react';
import { ArabicLevel } from '../../types/arabic-learning.types';

interface AssessmentQuestion {
  id: string;
  level: ArabicLevel;
  category: 'grammar' | 'vocabulary' | 'reading' | 'listening' | 'writing';
  question: string;
  questionArabic?: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface AssessmentResult {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  category: string;
  date: Date;
  timeSpent: number;
}

const assessmentQuestions: AssessmentQuestion[] = [
  {
    id: 'q1',
    level: 'A1',
    category: 'vocabulary',
    question: 'What is the Arabic word for "water"?',
    questionArabic: 'ما كلمة "water" بالعربية؟',
    options: ['طعام', 'ماء', 'كتاب', 'باب'],
    correctAnswer: 'ماء',
    explanation: 'ماء (māʾ) means "water". طعام means "food", كتاب means "book", باب means "door".',
  },
  {
    id: 'q2',
    level: 'A1',
    category: 'vocabulary',
    question: 'How do you say "hello" in Arabic?',
    options: ['شكرا', 'مرحبا', 'وداعا', 'معك'],
    correctAnswer: 'مرحبا',
    explanation: 'مرحبا (Marḥaban) means "hello". It is one of the most common greetings.',
  },
  {
    id: 'q3',
    level: 'A1',
    category: 'grammar',
    question: 'What is the feminine form of the Arabic word "teacher"?',
    questionArabic: 'ما صيغة المؤنث من كلمة "معلم" (muʿallim)?',
    options: ['معلم', 'معلمة', 'معلمي', 'معلمهم'],
    correctAnswer: 'معلمة',
    explanation: 'معلمة (muʿallima) is the feminine form. In Arabic, we usually add ة (taa marbuta) to make masculine words feminine.',
  },
  {
    id: 'q4',
    level: 'A1',
    category: 'reading',
    question: 'Read the sentence: "البيت كبير" - What does this mean?',
    options: ['The house is small', 'The house is big', 'The house is white', 'The house is old'],
    correctAnswer: 'The house is big',
    explanation: 'البيت (al-bayt) = the house, كبير (kabīr) = big. So "البيت كبير" means "The house is big".',
  },
  {
    id: 'q5',
    level: 'A1',
    category: 'vocabulary',
    question: 'What do we call the members of a family?',
    options: ['الحيوانات', 'الأشجار', 'العائلة', 'المدرسة'],
    correctAnswer: 'العائلة',
    explanation: 'العائلة (al-ʿāʾila) means "family". الحيوانات = animals, الأشجار = trees, المدرسة = school.',
  },
  {
    id: 'q6',
    level: 'A2',
    category: 'grammar',
    question: 'Complete the sentence: أنا _____ معلم',
    options: ['سأكون', 'يكون', 'هو', 'نحن'],
    correctAnswer: 'سأكون',
    explanation: 'سأكون (sawf akūn) = I will be. This is the future tense. "أنا سأكون معلم" = I will be a teacher.',
  },
  {
    id: 'q7',
    level: 'A2',
    category: 'reading',
    question: 'Translate: "كتب الرجل جملة طويلة"',
    options: ['The man wrote a long sentence', 'The man reads a long book', 'The woman writes letters', 'The boy wrote sentences'],
    correctAnswer: 'The man wrote a long sentence',
    explanation: 'كتب = write (past), الرجل = the man, جملة = sentence, طويلة = long.',
  },
];

const AssessmentCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'placement' | 'practice' | 'results'>('placement');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [assessmentInProgress, setAssessmentInProgress] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<AssessmentResult | null>(null);
  const [startTime] = useState<Date>(new Date());
  const [pastResults, setPastResults] = useState<AssessmentResult[]>([]);

  const currentQuestions = useMemo(() => {
    if (activeTab === 'placement') {
      return assessmentQuestions.filter((q, idx) => idx < 10); // First 10 for placement
    }
    return assessmentQuestions;
  }, [activeTab]);

  const handleAnswerSelect = (answer: string) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answer;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < currentQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const submitAssessment = () => {
    const correctCount = currentQuestions.filter(
      (q, idx) => selectedAnswers[idx] === q.correctAnswer
    ).length;

    const endTime = new Date();
    const timeSpent = Math.round((endTime.getTime() - startTime.getTime()) / 1000 / 60); // minutes

    const result: AssessmentResult = {
      score: (correctCount / currentQuestions.length) * 100,
      totalQuestions: currentQuestions.length,
      correctAnswers: correctCount,
      category: activeTab === 'placement' ? 'Placement Test' : 'Practice Assessment',
      date: new Date(),
      timeSpent,
    };

    setResults(result);
    setPastResults([...pastResults, result]);
    setShowResults(true);
  };

  const startAssessment = () => {
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    setAssessmentInProgress(true);
    setShowResults(false);
  };

  const resetAssessment = () => {
    setAssessmentInProgress(false);
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    setShowResults(false);
    setResults(null);
  };

  if (showResults && results) {
    const isPassed = results.score >= 70;
    const questionsBreakdown = currentQuestions.map((q, idx) => ({
      ...q,
      selectedAnswer: selectedAnswers[idx],
      isCorrect: selectedAnswers[idx] === q.correctAnswer,
    }));

    const incorrectQuestions = questionsBreakdown.filter(q => !q.isCorrect);

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Results Header */}
          <div className="text-center mb-12">
            <div className={`text-7xl font-black mb-4 ${isPassed ? 'text-green-400' : 'text-orange-400'}`}>
              {Math.round(results.score)}%
            </div>
            <h1 className="text-4xl font-black text-white mb-2">
              {isPassed ? '🎉 Assessment Passed!' : '📚 Keep Learning!'}
            </h1>
            <p className="text-xl text-slate-300">
              You got <span className="font-bold text-white">{results.correctAnswers}</span> out of{' '}
              <span className="font-bold text-white">{results.totalQuestions}</span> correct
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <Target className="text-blue-400" size={24} />
                <span className="text-slate-400">Accuracy</span>
              </div>
              <div className="text-3xl font-black text-white">{Math.round(results.score)}%</div>
            </div>

            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="text-green-400" size={24} />
                <span className="text-slate-400">Time Spent</span>
              </div>
              <div className="text-3xl font-black text-white">{results.timeSpent}m</div>
            </div>
          </div>

          {/* Incorrect Questions */}
          {incorrectQuestions.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 mb-8">
              <h3 className="font-black text-white mb-4 flex items-center gap-2">
                <span className="text-red-400">⚠️</span> Areas for Improvement
              </h3>
              <div className="space-y-4">
                {incorrectQuestions.map((q) => (
                  <div key={q.id} className="bg-slate-800/50 rounded-lg p-4 border border-red-500/20">
                    <p className="text-white font-semibold mb-2">{q.question}</p>
                    <p className="text-red-300 text-sm mb-2">
                      Your answer: <span className="font-mono">{q.selectedAnswer}</span>
                    </p>
                    <p className="text-green-300 text-sm mb-2">
                      Correct answer: <span className="font-mono font-bold">{q.correctAnswer}</span>
                    </p>
                    <p className="text-slate-300 text-sm">{q.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={resetAssessment}
              className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (assessmentInProgress) {
    const question = currentQuestions[currentQuestion];
    const progress = Math.round(((currentQuestion + 1) / currentQuestions.length) * 100);
    const isAnswered = selectedAnswers[currentQuestion] !== undefined;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-black text-white">Assessment</h1>
              <span className="text-lg font-bold text-slate-300">
                {currentQuestion + 1} / {currentQuestions.length}
              </span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-3xl p-8 border border-white/10 mb-8">
            {/* Question */}
            <div className="mb-8">
              {question.questionArabic && (
                <div className="text-3xl font-black text-blue-300 mb-4">{question.questionArabic}</div>
              )}
              <h2 className="text-2xl font-bold text-white">{question.question}</h2>
              <p className="text-sm text-slate-400 mt-2">Category: {question.category}</p>
            </div>

            {/* Options */}
            <div className="space-y-3 mb-8">
              {question.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswerSelect(option)}
                  className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                    selectedAnswers[currentQuestion] === option
                      ? 'bg-blue-500/20 border-blue-500'
                      : 'bg-slate-700/50 border-slate-600 hover:border-blue-500'
                  }`}
                >
                  <div className="font-semibold text-white">{option}</div>
                </button>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex gap-4">
              <button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 disabled:opacity-50 transition"
              >
                Previous
              </button>

              {currentQuestion < currentQuestions.length - 1 ? (
                <button
                  onClick={handleNext}
                  disabled={!isAnswered}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  Next Question
                </button>
              ) : (
                <button
                  onClick={submitAssessment}
                  disabled={!isAnswered}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition font-bold"
                >
                  Submit Assessment
                </button>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-white/10">
            <div className="flex gap-4">
              <div>
                <p className="text-slate-400 text-sm">Answered</p>
                <p className="text-white font-bold">{selectedAnswers.length} / {currentQuestions.length}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Progress</p>
                <p className="text-white font-bold">{progress}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Home Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-black text-white mb-8">Assessment Center</h1>

        {/* Past Results */}
        {pastResults.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-black text-white mb-4">Your Results</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {pastResults.map((result, idx) => (
                <div
                  key={idx}
                  className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-6 border border-white/10"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-slate-400 text-sm">{result.category}</p>
                      <div className="text-3xl font-black text-white mt-2">
                        {Math.round(result.score)}%
                      </div>
                    </div>
                    {result.score >= 70 ? (
                      <Award className="text-green-400" size={32} />
                    ) : (
                      <TrendingUp className="text-orange-400" size={32} />
                    )}
                  </div>
                  <div className="space-y-1 text-sm text-slate-400">
                    <p>{result.correctAnswers}/{result.totalQuestions} Correct</p>
                    <p>{result.timeSpent} minutes</p>
                    <p>{result.date.toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Assessment Options */}
        <div className="grid md:grid-cols-2 gap-6">
          <button
            onClick={() => {
              setActiveTab('placement');
              startAssessment();
            }}
            className="group bg-gradient-to-br from-blue-500/20 to-blue-700/20 rounded-2xl p-8 border border-blue-400/30 hover:border-blue-400 transition text-left"
          >
            <div className="flex items-start gap-4">
              <Target className="text-blue-400 flex-shrink-0 group-hover:scale-110 transition" size={40} />
              <div>
                <h3 className="text-xl font-black text-white mb-2">Placement Test</h3>
                <p className="text-slate-300 text-sm mb-4">Determine your Arabic proficiency level</p>
                <ul className="space-y-1 text-xs text-slate-400">
                  <li>✓ 10 questions</li>
                  <li>✓ A1-C1 levels</li>
                  <li>✓ All categories</li>
                </ul>
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              setActiveTab('practice');
              startAssessment();
            }}
            className="group bg-gradient-to-br from-purple-500/20 to-purple-700/20 rounded-2xl p-8 border border-purple-400/30 hover:border-purple-400 transition text-left"
          >
            <div className="flex items-start gap-4">
              <BarChart3 className="text-purple-400 flex-shrink-0 group-hover:scale-110 transition" size={40} />
              <div>
                <h3 className="text-xl font-black text-white mb-2">Practice Assessment</h3>
                <p className="text-slate-300 text-sm mb-4">Test your knowledge and track progress</p>
                <ul className="space-y-1 text-xs text-slate-400">
                  <li>✓ {assessmentQuestions.length} questions</li>
                  <li>✓ Multiple levels</li>
                  <li>✓ Get feedback</li>
                </ul>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssessmentCenter;
