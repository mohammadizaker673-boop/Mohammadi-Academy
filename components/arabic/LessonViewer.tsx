import React, { useState } from 'react';
import { ArabicLesson, Exercise, LessonResult } from '../../types/arabic-learning.types';
import { CheckCircle, XCircle, Lightbulb, ArrowRight, Volume2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface LessonViewerProps {
  lesson: ArabicLesson;
  onComplete: (result: LessonResult) => void;
  onExit: () => void;
}

const LessonViewer: React.FC<LessonViewerProps> = ({ lesson, onComplete, onExit }) => {
  const { language } = useLanguage();
  const labelsByLang: Record<string, Record<string, string>> = {
    en: {
      vocabulary: 'Vocabulary',
      example: 'Example',
      grammarRules: 'Grammar Rules',
      examples: 'Examples',
      startExercises: 'Start Exercises',
      noExercises: 'No exercises for this lesson yet.',
      backToLessons: 'Back to Lessons',
      question: 'Question',
      of: 'of',
      hint: 'Hint',
      typeAnswer: 'Type your answer...',
      submitAnswer: 'Submit Answer'
    },
    ar: {
      vocabulary: 'المفردات',
      example: 'مثال',
      grammarRules: 'قواعد النحو',
      examples: 'أمثلة',
      startExercises: 'ابدأ التمارين',
      noExercises: 'لا توجد تمارين لهذا الدرس حاليا.',
      backToLessons: 'العودة إلى الدروس',
      question: 'سؤال',
      of: 'من',
      hint: 'تلميح',
      typeAnswer: 'اكتب إجابتك...',
      submitAnswer: 'إرسال الإجابة'
    },
    fa: {
      vocabulary: 'واژگان',
      example: 'مثال',
      grammarRules: 'قواعد دستور',
      examples: 'نمونه ها',
      startExercises: 'شروع تمرین ها',
      noExercises: 'برای این درس هنوز تمرینی وجود ندارد.',
      backToLessons: 'بازگشت به درس ها',
      question: 'سوال',
      of: 'از',
      hint: 'راهنما',
      typeAnswer: 'پاسخ خود را بنویسید...',
      submitAnswer: 'ارسال پاسخ'
    },
    ps: {
      vocabulary: 'لغتونه',
      example: 'بېلګه',
      grammarRules: 'ګرامر قواعد',
      examples: 'بېلګې',
      startExercises: 'تمرينونه پيل کړئ',
      noExercises: 'د دې درس لپاره تمرينونه نشته.',
      backToLessons: 'درسونو ته بېرته',
      question: 'پوښتنه',
      of: 'له',
      hint: 'اشاره',
      typeAnswer: 'خپل ځواب وليکئ...',
      submitAnswer: 'ځواب وسپارئ'
    }
  };
  const ui = labelsByLang[language] || labelsByLang.en;

  const [currentSection, setCurrentSection] = useState<'content' | 'exercises'>('content');
  const [currentExercise, setCurrentExercise] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [startTime] = useState(Date.now());

  const handleAnswer = (exerciseId: string, answer: string) => {
    setUserAnswers(prev => ({ ...prev, [exerciseId]: answer }));
    setShowFeedback(true);
  };

  const nextExercise = () => {
    setShowFeedback(false);
    setShowHint(false);
    if (currentExercise < lesson.exercises.length - 1) {
      setCurrentExercise(prev => prev + 1);
    } else {
      completelesson();
    }
  };

  const completelesson = () => {
    const correctAnswers = lesson.exercises.filter(
      ex => userAnswers[ex.id] === ex.correctAnswer
    ).length;
    const score = (correctAnswers / lesson.exercises.length) * 100;
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    const result: LessonResult = {
      lessonId: lesson.id,
      score,
      totalQuestions: lesson.exercises.length,
      correctAnswers,
      weakTopics: lesson.topics.filter((_, idx) => idx % 2 === 0), // Simplified weak topic detection
      timeSpent,
      date: new Date()
    };

    onComplete(result);
  };

  const renderContentSection = () => (
    <div className="space-y-8">
      {/* Vocabulary Section */}
      {lesson.vocabulary.length > 0 && (
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
          <h3 className="text-2xl font-black text-white mb-4 flex items-center gap-2">
            📚 {ui.vocabulary}
          </h3>
          <div className="space-y-4">
            {lesson.vocabulary.map(word => (
              <div key={word.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="text-3xl font-bold text-white mb-1">{word.arabic}</div>
                    <div className="text-sm text-slate-400 mb-1">{word.transliteration}</div>
                    <div className="text-lg text-primary-300 font-bold">{word.english}</div>
                  </div>
                  <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                    <Volume2 className="text-primary-400" size={20} />
                  </button>
                </div>
                <div className="mt-3 pt-3 border-t border-white/10">
                  <p className="text-sm text-slate-300">
                    <span className="font-bold">{ui.example}:</span> {word.exampleSentence}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grammar Section */}
      {lesson.grammarRules.length > 0 && (
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
          <h3 className="text-2xl font-black text-white mb-4 flex items-center gap-2">
            📖 {ui.grammarRules}
          </h3>
          <div className="space-y-6">
            {lesson.grammarRules.map(rule => (
              <div key={rule.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h4 className="text-xl font-bold text-primary-300 mb-3">{rule.title}</h4>
                <p className="text-slate-300 mb-4">{rule.explanation}</p>
                <div className="space-y-3">
                  <p className="text-sm font-bold text-white">Examples:</p>
                  <p className="text-sm font-bold text-white">{ui.examples}:</p>
                  {rule.examples.map((ex, idx) => (
                    <div key={idx} className="bg-white/5 rounded-lg p-3">
                      <div className="text-xl font-bold text-white mb-1">{ex.arabic}</div>
                      <div className="text-sm text-slate-400 mb-1">{ex.transliteration}</div>
                      <div className="text-sm text-green-400">{ex.english}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => setCurrentSection('exercises')}
        className="w-full py-4 bg-gradient-to-r from-primary-500 to-blue-500 text-white font-black text-lg rounded-xl hover:from-primary-600 hover:to-blue-600 transition-all flex items-center justify-center gap-2"
      >
        {ui.startExercises} <ArrowRight size={20} />
      </button>
    </div>
  );

  const renderExerciseSection = () => {
    if (lesson.exercises.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-slate-300 mb-6">{ui.noExercises}</p>
          <button
            onClick={onExit}
            className="px-6 py-3 bg-primary-500 text-white font-bold rounded-lg"
          >
            {ui.backToLessons}
          </button>
        </div>
      );
    }

    const exercise = lesson.exercises[currentExercise];
    const userAnswer = userAnswers[exercise.id];
    const isCorrect = userAnswer === exercise.correctAnswer;

    return (
      <div className="space-y-6">
        {/* Progress Bar */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-bold text-slate-300">
            {ui.question} {currentExercise + 1} {ui.of} {lesson.exercises.length}
          </span>
          <div className="flex-1 mx-4 h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-blue-500 transition-all"
              style={{ width: `${((currentExercise + 1) / lesson.exercises.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="inline-block px-3 py-1 bg-primary-500/20 text-primary-300 text-xs font-bold rounded-full mb-3">
                {exercise.type.replace('-', ' ').toUpperCase()}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{exercise.question}</h3>
              {exercise.questionArabic && (
                <p className="text-3xl font-bold text-primary-300 mb-4">{exercise.questionArabic}</p>
              )}
            </div>
            {exercise.hint && (
              <button
                onClick={() => setShowHint(!showHint)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Lightbulb className={showHint ? 'text-yellow-400' : 'text-slate-400'} size={24} />
              </button>
            )}
          </div>

          {showHint && exercise.hint && (
            <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-sm text-yellow-300">💡 {ui.hint}: {exercise.hint}</p>
            </div>
          )}

          {/* Answer Options */}
          {exercise.type === 'multiple-choice' && exercise.options && (
            <div className="space-y-3">
              {exercise.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => !showFeedback && handleAnswer(exercise.id, option)}
                  disabled={showFeedback}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    showFeedback
                      ? option === exercise.correctAnswer
                        ? 'border-green-400 bg-green-500/20 text-white'
                        : option === userAnswer
                        ? 'border-red-400 bg-red-500/20 text-white'
                        : 'border-white/10 bg-white/5 text-slate-400'
                      : userAnswer === option
                      ? 'border-primary-400 bg-primary-500/20 text-white'
                      : 'border-white/20 bg-white/5 text-white hover:border-primary-400/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{option}</span>
                    {showFeedback && option === exercise.correctAnswer && (
                      <CheckCircle className="text-green-400" size={20} />
                    )}
                    {showFeedback && option === userAnswer && option !== exercise.correctAnswer && (
                      <XCircle className="text-red-400" size={20} />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {(exercise.type === 'fill-blank' || exercise.type === 'translation' || exercise.type === 'sentence-building') && (
            <div className="space-y-4">
              <input
                type="text"
                value={userAnswer || ''}
                onChange={(e) => setUserAnswers(prev => ({ ...prev, [exercise.id]: e.target.value }))}
                disabled={showFeedback}
                placeholder={ui.typeAnswer}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:border-primary-400 focus:outline-none"
              />
              {!showFeedback && (
                <button
                  onClick={() => handleAnswer(exercise.id, userAnswer || '')}
                  disabled={!userAnswer}
                  className="px-6 py-2 bg-primary-500 text-white font-bold rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {ui.submitAnswer}
                </button>
              )}
            </div>
          )}

          {/* Feedback */}
          {showFeedback && (
            <div className={`mt-6 p-4 rounded-xl border-2 ${
              isCorrect
                ? 'border-green-400 bg-green-500/10'
                : 'border-red-400 bg-red-500/10'
            }`}>
              <div className="flex items-start gap-3 mb-3">
                {isCorrect ? (
                  <CheckCircle className="text-green-400 flex-shrink-0" size={24} />
                ) : (
                  <XCircle className="text-red-400 flex-shrink-0" size={24} />
                )}
                <div className="flex-1">
                  <p className={`font-bold mb-2 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                    {isCorrect ? '✅ Correct!' : '❌ Not quite right'}
                  </p>
                  {!isCorrect && (
                    <p className="text-white mb-2">
                      <span className="font-bold">Correct answer:</span> {exercise.correctAnswer}
                    </p>
                  )}
                  <p className="text-slate-300">{exercise.explanation}</p>
                </div>
              </div>
              <button
                onClick={nextExercise}
                className="w-full py-3 bg-primary-500 text-white font-bold rounded-lg hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
              >
                {currentExercise < lesson.exercises.length - 1 ? 'Next Question' : 'Complete Lesson'}
                <ArrowRight size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-20 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onExit}
            className="text-slate-300 hover:text-white transition-colors mb-4"
          >
            ← Back to Lessons
          </button>
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-primary-500/20 text-primary-300 text-xs font-bold rounded-full">
                {lesson.level} - Lesson {lesson.order}
              </span>
            </div>
            <h1 className="text-3xl font-black text-white mb-2">{lesson.title}</h1>
            <p className="text-slate-300">{lesson.description}</p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
          {currentSection === 'content' ? renderContentSection() : renderExerciseSection()}
        </div>
      </div>
    </div>
  );
};

export default LessonViewer;
