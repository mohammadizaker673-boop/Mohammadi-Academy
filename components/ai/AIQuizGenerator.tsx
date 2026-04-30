import React, { useState } from 'react';
import { FileQuestion, Loader2, CheckCircle, XCircle, RotateCcw, Sparkles } from 'lucide-react';
import { generateQuiz, type QuizQuestion } from '../../services/aiFeaturesService';
import { hasOpenRouterApiKey } from '../../services/aiService';

const TOPIC_PRESETS = [
  'Pillars of Islam', 'Pillars of Iman', 'Surah Al-Fatiha', 'Wudu & Salah',
  'Life of Prophet Muhammad ﷺ', 'Stories of the Prophets', 'Ramadan & Fasting',
  'Hajj & Umrah', 'Arabic Alphabet', 'Tajweed Rules', 'Quran Sciences',
  'Islamic Manners (Adab)', 'Zakat & Charity', 'Islamic History',
];

const AIQuizGenerator: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'mixed'>('mixed');
  const [courseContext, setCourseContext] = useState('');
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);

  const hasApiKey = hasOpenRouterApiKey();

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setQuiz(null);
    setAnswers({});
    setShowResults(false);

    try {
      const result = await generateQuiz(topic, numQuestions, difficulty, courseContext || undefined);
      setQuiz(result.questions);
    } catch {
      setQuiz(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionId: number, answer: string) => {
    if (showResults) return;
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const submitQuiz = () => {
    setShowResults(true);
  };

  const score = quiz
    ? quiz.filter(q => answers[q.id]?.toLowerCase() === q.correctAnswer.toLowerCase()).length
    : 0;

  const resetQuiz = () => {
    setQuiz(null);
    setAnswers({});
    setShowResults(false);
  };

  if (!hasApiKey) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <FileQuestion className="mx-auto mb-4 text-primary-400" size={48} />
          <h2 className="text-xl font-bold text-white mb-2">Quiz Generator Not Configured</h2>
          <p className="text-slate-400">Please configure the OpenRouter API key to enable the Smart Quiz Generator.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center">
          <FileQuestion className="text-white" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Smart Quiz Generator</h1>
          <p className="text-slate-400">AI-generated adaptive quizzes for any topic</p>
        </div>
      </div>

      {!quiz ? (
        /* Quiz Configuration */
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
          <div>
            <label className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-2 block">Topic</label>
            <input
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="Enter a topic or select from presets below"
              className="w-full px-4 py-3 bg-white/10 border border-white/15 rounded-xl text-white placeholder:text-slate-500 focus:border-primary-400 focus:outline-none"
            />
            <div className="flex flex-wrap gap-2 mt-3">
              {TOPIC_PRESETS.map(t => (
                <button
                  key={t}
                  onClick={() => setTopic(t)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    topic === t ? 'bg-amber-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-2 block">Number of Questions</label>
              <select
                value={numQuestions}
                onChange={e => setNumQuestions(parseInt(e.target.value))}
                className="w-full px-4 py-3 bg-white/10 border border-white/15 rounded-xl text-white focus:border-primary-400 focus:outline-none"
              >
                {[3, 5, 7, 10, 15].map(n => (
                  <option key={n} value={n}>{n} questions</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-2 block">Difficulty</label>
              <select
                value={difficulty}
                onChange={e => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard' | 'mixed')}
                className="w-full px-4 py-3 bg-white/10 border border-white/15 rounded-xl text-white focus:border-primary-400 focus:outline-none"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-2 block">Additional Context (optional)</label>
            <textarea
              value={courseContext}
              onChange={e => setCourseContext(e.target.value)}
              placeholder="Add specific content or focus areas for the quiz..."
              rows={3}
              className="w-full px-4 py-3 bg-white/10 border border-white/15 rounded-xl text-white placeholder:text-slate-500 focus:border-primary-400 focus:outline-none"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !topic.trim()}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-bold text-sm uppercase tracking-wider disabled:opacity-50 hover:from-amber-400 hover:to-orange-500 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 className="animate-spin" size={18} /> Generating Quiz...</>
            ) : (
              <><Sparkles size={18} /> Generate Quiz</>
            )}
          </button>
        </div>
      ) : (
        /* Quiz Display */
        <div className="space-y-4">
          {showResults && (
            <div className={`rounded-2xl p-6 text-center ${
              score / quiz.length >= 0.7
                ? 'bg-emerald-500/10 border border-emerald-500/20'
                : score / quiz.length >= 0.4
                ? 'bg-amber-500/10 border border-amber-500/20'
                : 'bg-red-500/10 border border-red-500/20'
            }`}>
              <h2 className="text-2xl font-bold text-white mb-1">
                Score: {score} / {quiz.length} ({Math.round((score / quiz.length) * 100)}%)
              </h2>
              <p className="text-slate-400 text-sm">
                {score / quiz.length >= 0.7 ? 'Excellent! Ma Sha Allah!' : score / quiz.length >= 0.4 ? 'Good effort! Keep studying.' : 'Keep practicing, you\'ll improve In Sha Allah!'}
              </p>
            </div>
          )}

          {quiz.map((q, idx) => {
            const userAnswer = answers[q.id];
            const isCorrect = userAnswer?.toLowerCase() === q.correctAnswer.toLowerCase();
            return (
              <div key={q.id} className={`bg-white/5 border rounded-2xl p-5 transition-all ${
                showResults
                  ? isCorrect ? 'border-emerald-500/30' : 'border-red-500/30'
                  : 'border-white/10'
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-white font-bold text-sm flex-1">
                    <span className="text-primary-400 mr-2">Q{idx + 1}.</span>
                    {q.question}
                  </h3>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    q.difficulty === 'easy' ? 'bg-emerald-500/20 text-emerald-400' :
                    q.difficulty === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {q.difficulty}
                  </span>
                </div>

                {q.type === 'mcq' && q.options && (
                  <div className="space-y-2 mb-3">
                    {q.options.map((opt, oi) => {
                      const isSelected = userAnswer === opt;
                      const isCorrectOpt = showResults && opt.toLowerCase() === q.correctAnswer.toLowerCase();
                      return (
                        <button
                          key={oi}
                          onClick={() => handleAnswer(q.id, opt)}
                          disabled={showResults}
                          className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all flex items-center gap-3 ${
                            showResults
                              ? isCorrectOpt
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : isSelected && !isCorrectOpt
                                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                : 'bg-white/5 text-slate-400 border border-white/5'
                              : isSelected
                              ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                              : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'
                          }`}
                        >
                          <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {String.fromCharCode(65 + oi)}
                          </span>
                          {opt}
                          {showResults && isCorrectOpt && <CheckCircle size={16} className="ml-auto text-emerald-400" />}
                          {showResults && isSelected && !isCorrectOpt && <XCircle size={16} className="ml-auto text-red-400" />}
                        </button>
                      );
                    })}
                  </div>
                )}

                {(q.type === 'true_false') && (
                  <div className="flex gap-3 mb-3">
                    {['True', 'False'].map(opt => {
                      const isSelected = userAnswer === opt;
                      const isCorrectOpt = showResults && opt.toLowerCase() === q.correctAnswer.toLowerCase();
                      return (
                        <button
                          key={opt}
                          onClick={() => handleAnswer(q.id, opt)}
                          disabled={showResults}
                          className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                            showResults
                              ? isCorrectOpt ? 'bg-emerald-500/20 text-emerald-300' : isSelected ? 'bg-red-500/20 text-red-300' : 'bg-white/5 text-slate-400'
                              : isSelected ? 'bg-primary-500/20 text-primary-300' : 'bg-white/5 text-slate-300 hover:bg-white/10'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                )}

                {(q.type === 'fill_blank' || q.type === 'short_answer') && (
                  <input
                    value={userAnswer || ''}
                    onChange={e => handleAnswer(q.id, e.target.value)}
                    disabled={showResults}
                    placeholder="Type your answer..."
                    className="w-full px-4 py-2.5 bg-white/10 border border-white/15 rounded-xl text-white text-sm placeholder:text-slate-500 focus:border-primary-400 focus:outline-none mb-3"
                  />
                )}

                {showResults && (
                  <div className="bg-white/5 rounded-lg p-3 mt-2">
                    <p className="text-xs text-slate-400 font-bold mb-1">Correct Answer: <span className="text-emerald-400">{q.correctAnswer}</span></p>
                    <p className="text-xs text-slate-400">{q.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}

          <div className="flex gap-3">
            {!showResults && (
              <button
                onClick={submitQuiz}
                disabled={Object.keys(answers).length === 0}
                className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-bold text-sm uppercase tracking-wider disabled:opacity-50 hover:from-amber-400 hover:to-orange-500 transition-all"
              >
                Submit Answers
              </button>
            )}
            <button
              onClick={resetQuiz}
              className="px-6 py-3 bg-white/10 text-white rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-white/20 transition-all flex items-center gap-2"
            >
              <RotateCcw size={16} /> New Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIQuizGenerator;
