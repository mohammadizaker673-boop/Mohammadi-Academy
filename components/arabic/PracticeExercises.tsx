import React, { useState, useEffect } from 'react';
import { Exercise, ExerciseType } from '../../types/arabic-learning.types';
import { CheckCircle, XCircle, ChevronRight, RotateCcw } from 'lucide-react';

interface PracticeExercisesProps {
  exercises: Exercise[];
  onComplete: (score: number, totalQuestions: number) => void;
}

interface ExerciseState {
  currentIndex: number;
  answers: string[];
  showFeedback: boolean;
  isCorrect: boolean;
  completed: boolean;
  score: number;
  totalAnswered: number;
}

const PracticeExercises: React.FC<PracticeExercisesProps> = ({ exercises, onComplete }) => {
  const [state, setState] = useState<ExerciseState>({
    currentIndex: 0,
    answers: [],
    showFeedback: false,
    isCorrect: false,
    completed: false,
    score: 0,
    totalAnswered: 0,
  });

  const currentExercise = exercises[state.currentIndex];
  const progress = Math.round(((state.currentIndex + 1) / exercises.length) * 100);

  const handleAnswer = (answer: string) => {
    if (state.showFeedback) return; // Prevent changing answer

    const isCorrect = answer === currentExercise.correctAnswer;
    
    setState(prev => ({
      ...prev,
      showFeedback: true,
      isCorrect,
      answers: [...prev.answers, answer],
      score: prev.score + (isCorrect ? 1 : 0),
      totalAnswered: prev.totalAnswered + 1,
    }));
  };

  const handleNext = () => {
    if (state.currentIndex < exercises.length - 1) {
      setState(prev => ({
        ...prev,
        currentIndex: prev.currentIndex + 1,
        showFeedback: false,
        isCorrect: false,
      }));
    } else {
      const finalScore = (state.score / exercises.length) * 100;
      setState(prev => ({ ...prev, completed: true }));
      onComplete(finalScore, exercises.length);
    }
  };

  const handleRetry = () => {
    setState({
      currentIndex: 0,
      answers: [],
      showFeedback: false,
      isCorrect: false,
      completed: false,
      score: 0,
      totalAnswered: 0,
    });
  };

  if (state.completed) {
    const percentage = Math.round((state.score / exercises.length) * 100);
    const passed = percentage >= 70;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-3xl p-8 border border-white/10 text-center">
            <div className={`text-6xl font-black mb-6 ${passed ? 'text-green-400' : 'text-orange-400'}`}>
              {percentage}%
            </div>
            <h2 className="text-3xl font-black text-white mb-2">
              {passed ? '🎉 Great Job!' : '📚 Keep Practicing!'}
            </h2>
            <p className="text-slate-300 mb-2">
              You got <span className="text-white font-bold">{state.score}</span> out of{' '}
              <span className="text-white font-bold">{exercises.length}</span> correct
            </p>
            <p className="text-slate-400 mb-8">
              {passed ? 'You passed the exercise set!' : 'Try again to improve your score.'}
            </p>

            <div className="flex gap-4 justify-center">
              <button
                onClick={handleRetry}
                className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <RotateCcw size={20} /> Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-black text-white">Practice Exercises</h1>
            <span className="text-lg font-bold text-slate-300">
              {state.currentIndex + 1} / {exercises.length}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Exercise Card */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-3xl p-8 border border-white/10 mb-8">
          {/* Question */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              {currentExercise.questionArabic && (
                <div className="text-3xl text-blue-300 font-black mb-4">{currentExercise.questionArabic}</div>
              )}
              {currentExercise.question}
            </h2>
            {currentExercise.hint && !state.showFeedback && (
              <p className="text-sm text-yellow-300 mt-4">💡 Hint: {currentExercise.hint}</p>
            )}
          </div>

          {/* Render based on exercise type */}
          {renderExerciseContent(currentExercise, handleAnswer, state.showFeedback, state.answers[state.currentIndex])}

          {/* Feedback */}
          {state.showFeedback && (
            <div className={`mt-8 p-6 rounded-xl border-2 ${state.isCorrect ? 'bg-green-500/10 border-green-500' : 'bg-red-500/10 border-red-500'}`}>
              <div className="flex gap-3 items-start">
                {state.isCorrect ? (
                  <CheckCircle className="text-green-400 flex-shrink-0" size={24} />
                ) : (
                  <XCircle className="text-red-400 flex-shrink-0" size={24} />
                )}
                <div>
                  <p className={`font-bold mb-2 ${state.isCorrect ? 'text-green-300' : 'text-red-300'}`}>
                    {state.isCorrect ? 'Correct!' : 'Incorrect'}
                  </p>
                  <p className="text-slate-300 text-sm">{currentExercise.explanation}</p>
                  {!state.isCorrect && (
                    <p className="text-slate-400 text-sm mt-2">
                      Correct answer: <span className="font-bold text-white">{currentExercise.correctAnswer}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Next Button */}
              <button
                onClick={handleNext}
                className="mt-6 w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                {state.currentIndex < exercises.length - 1 ? (
                  <>
                    Next Question <ChevronRight size={20} />
                  </>
                ) : (
                  <>
                    See Results <ChevronRight size={20} />
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Score Summary */}
        <div className="bg-slate-800/50 rounded-xl p-4 border border-white/10">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Score: <span className="text-white font-bold">{state.score}/{state.totalAnswered}</span></span>
            <span className="text-slate-400">Accuracy: <span className="text-white font-bold">{state.totalAnswered > 0 ? Math.round((state.score / state.totalAnswered) * 100) : 0}%</span></span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Render different exercise types
function renderExerciseContent(
  exercise: Exercise,
  onAnswer: (answer: string) => void,
  showFeedback: boolean,
  selectedAnswer?: string
) {
  if (exercise.type === 'multiple-choice') {
    return (
      <div className="space-y-3">
        {exercise.options?.map((option, idx) => (
          <button
            key={idx}
            onClick={() => onAnswer(option)}
            disabled={showFeedback}
            className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
              selectedAnswer === option
                ? exercise.correctAnswer === option
                  ? 'bg-green-500/20 border-green-500'
                  : 'bg-red-500/20 border-red-500'
                : showFeedback && exercise.correctAnswer === option
                ? 'bg-green-500/20 border-green-500'
                : 'bg-slate-700/50 border-slate-600 hover:border-blue-500'
            } ${showFeedback ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="font-semibold text-white">{option}</div>
          </button>
        ))}
      </div>
    );
  }

  if (exercise.type === 'fill-blank') {
    return (
      <div className="space-y-4">
        <div className="bg-slate-700/30 p-4 rounded-xl border border-slate-600">
          <p className="text-white text-lg">{exercise.question}</p>
        </div>
        <input
          type="text"
          disabled={showFeedback}
          defaultValue={selectedAnswer || ''}
          onChange={(e) => !showFeedback && onAnswer(e.target.value)}
          placeholder="Type your answer..."
          className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
        />
      </div>
    );
  }

  if (exercise.type === 'translation') {
    return (
      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-slate-700/30 p-4 rounded-xl border border-slate-600">
            <p className="text-slate-400 text-sm mb-2">Translate to Arabic:</p>
            <p className="text-white text-lg font-semibold">{exercise.question}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm mb-2">Your translation:</p>
            <input
              type="text"
              disabled={showFeedback}
              defaultValue={selectedAnswer || ''}
              onChange={(e) => !showFeedback && onAnswer(e.target.value)}
              placeholder="Type your translation..."
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default PracticeExercises;
