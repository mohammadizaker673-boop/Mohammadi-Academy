import React, { useState } from 'react';
import { Play, CheckCircle2, XCircle, Clock, Volume2, Pause, Mic, StopCircle, Download } from 'lucide-react';

const TestInterface: React.FC = () => {
  const [testMode, setTestMode] = useState<'select' | 'in-progress' | 'results'>('select');
  const [selectedTestType, setSelectedTestType] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [testProgress, setTestProgress] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(10);

  const testTypes = [
    {
      id: 'random-ayah',
      name: 'Random Ayah Start',
      description: 'Recite starting from a random Ayah within a Juz',
      duration: '5-10 min',
      difficulty: 'Medium',
      icon: '🎲',
    },
    {
      id: 'continue-middle',
      name: 'Continue from Middle',
      description: 'Complete a Surah starting from the middle',
      duration: '10-15 min',
      difficulty: 'Hard',
      icon: '➡️',
    },
    {
      id: 'timed-test',
      name: 'Timed Challenge',
      description: 'Recite as many pages as possible in 30 minutes',
      duration: '30 min',
      difficulty: 'Medium',
      icon: '⏱️',
    },
    {
      id: 'full-page',
      name: 'Full Page Test',
      description: 'Recite an entire page without pauses',
      duration: '5-8 min',
      difficulty: 'Medium',
      icon: '📖',
    },
    {
      id: 'juz-test',
      name: 'Full Juz Test',
      description: 'Complete memorization of a full Juz (30 pages)',
      duration: '60-90 min',
      difficulty: 'Very Hard',
      icon: '📚',
    },
    {
      id: 'live-test',
      name: 'Live Teacher Test',
      description: 'Real-time test with your teacher monitoring',
      duration: 'As scheduled',
      difficulty: 'Hard',
      icon: '👨‍🏫',
    },
  ];

  const testQuestions = [
    {
      id: 1,
      type: 'random-ayah',
      prompt: 'Recite from Ayah 45 onwards',
      surah: 'An-Nisa',
      juz: 4,
      startingAyah: 45,
    },
    {
      id: 2,
      type: 'continue-middle',
      prompt: 'Complete this Surah from where it cuts off',
      surah: 'Al-Imran',
      startingAyah: 153,
    },
    {
      id: 3,
      type: 'random-ayah',
      prompt: 'Recite from Ayah 20 onwards',
      surah: 'Al-Baqarah',
      juz: 1,
      startingAyah: 20,
    },
  ];

  const testResults = {
    score: 85,
    maxScore: 100,
    duration: '12m 34s',
    accuracy: 92,
    testType: 'Random Ayah Start',
    completedAt: 'Today, 2:45 PM',
    feedback: 'Great performance! Your Meem Sakinah needs slight improvement.',
    questions: [
      {
        id: 1,
        result: 'correct',
        score: 95,
        comment: 'Excellent Tajweed application',
      },
      {
        id: 2,
        result: 'correct',
        score: 88,
        comment: 'Small hesitation at Ayah 156',
      },
      {
        id: 3,
        result: 'incorrect',
        score: 72,
        comment: 'Meem Sakinah not pronounced clearly',
      },
    ],
  };

  const handleStartTest = (typeId: string) => {
    setSelectedTestType(typeId);
    setTestMode('in-progress');
    setTestProgress(0);
  };

  const handleFinishRecording = () => {
    setTestMode('results');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f2b] via-[#0e1436] to-[#131b41] text-slate-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
          Hifz Testing Module
        </h1>
        <p className="text-slate-400">Start a test to evaluate your memorization progress</p>
      </div>

      {/* Test Selection Mode */}
      {testMode === 'select' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {testTypes.map((test) => (
              <button
                key={test.id}
                onClick={() => handleStartTest(test.id)}
                className="text-left bg-gradient-to-br from-slate-800/30 to-slate-700/10 border border-slate-600/30 rounded-lg p-6 hover:border-slate-500/50 transition transform hover:scale-105"
              >
                <div className="text-4xl mb-3">{test.icon}</div>
                <h3 className="text-lg font-bold text-slate-100 mb-1">{test.name}</h3>
                <p className="text-sm text-slate-400 mb-4">{test.description}</p>

                <div className="flex items-center justify-between text-xs">
                  <div>
                    <p className="text-slate-500">
                      <Clock size={14} className="inline mr-1" />
                      {test.duration}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded font-semibold ${
                      test.difficulty === 'Medium'
                        ? 'bg-yellow-900/30 text-yellow-300'
                        : test.difficulty === 'Hard'
                        ? 'bg-orange-900/30 text-orange-300'
                        : test.difficulty === 'Very Hard'
                        ? 'bg-red-900/30 text-red-300'
                        : 'bg-green-900/30 text-green-300'
                    }`}
                  >
                    {test.difficulty}
                  </span>
                </div>

                <button
                  onClick={() => handleStartTest(test.id)}
                  className="w-full mt-4 bg-purple-600 hover:bg-purple-700 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
                >
                  <Play size={18} />
                  Start Test
                </button>
              </button>
            ))}
          </div>

          {/* Info Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-slate-800/30 to-slate-700/10 border border-slate-600/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">📋 Test Guidelines</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>✓ Record yourself reciting</li>
                <li>✓ Teacher will review within 24 hours</li>
                <li>✓ Mistakes won't be held against you</li>
                <li>✓ Tests help track weak pages</li>
                <li>✓ Use tests to build confidence</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-slate-800/30 to-slate-700/10 border border-slate-600/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">📊 Your Test History</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Today: 1 test</span>
                  <span className="text-emerald-300">85% score</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">This week: 5 tests</span>
                  <span className="text-emerald-300">88% avg</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">This month: 18 tests</span>
                  <span className="text-emerald-300">86% avg</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Test In Progress Mode */}
      {testMode === 'in-progress' && (
        <>
          <div className="mb-8">
            <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-400/30 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-purple-300">
                  {testTypes.find((t) => t.id === selectedTestType)?.name}
                </h2>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Time Elapsed</p>
                  <p className="text-3xl font-bold text-purple-200">2:34</p>
                </div>
              </div>

              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                  style={{ width: `${testProgress}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-2">Question {testProgress} of {totalQuestions}</p>
            </div>
          </div>

          {/* Question Display */}
          <div className="bg-gradient-to-br from-slate-800/30 to-slate-700/10 border border-slate-600/30 rounded-lg p-8 mb-8">
            <h3 className="text-xl font-semibold mb-6">Test Question</h3>

            <div className="bg-slate-900/30 border border-slate-600/30 rounded-lg p-6 mb-6">
              <p className="text-slate-400 text-sm mb-2">Surah: An-Nisa | Juz: 4</p>
              <p className="text-lg font-semibold text-slate-100 mb-4">Recite from Ayah 45 onwards (approximately 3-4 minutes)</p>

              <div className="bg-blue-900/20 border border-blue-400/30 rounded-lg p-4 mb-6">
                <p className="text-sm text-slate-400 mb-2">📖 Starting Ayah</p>
                <p className="text-lg text-blue-200 font-semibold">
                  "يَا أَيُّهَا الَّذِينَ آمَنُوا..."
                </p>
                <p className="text-sm text-slate-400 mt-2">Continue until you complete the assigned verses</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center gap-2 bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-400/30 px-4 py-2 rounded-lg transition">
                  <Volume2 size={18} />
                  Listen
                </button>
                <button className="flex items-center justify-center gap-2 bg-slate-700/30 hover:bg-slate-700/50 border border-slate-500/30 px-4 py-2 rounded-lg transition">
                  <Play size={18} />
                  Replay
                </button>
              </div>
            </div>

            {/* Recording Section */}
            <div className="bg-gradient-to-br from-red-900/30 to-orange-900/30 border border-red-400/30 rounded-lg p-8">
              <h4 className="font-semibold text-red-200 mb-6">🎙️ Record Your Recitation</h4>

              <div className="flex flex-col items-center mb-6">
                <div
                  className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 transition ${
                    isRecording
                      ? 'bg-red-600 animate-pulse'
                      : 'bg-slate-800/50 border-2 border-slate-600'
                  }`}
                >
                  {isRecording ? (
                    <div className="w-16 h-16 bg-red-700 rounded-full animate-pulse" />
                  ) : (
                    <Mic size={40} className="text-red-400" />
                  )}
                </div>

                <p className="text-2xl font-bold text-slate-100 mb-2">
                  {isRecording ? (
                    <>
                      <span className="text-red-400">● REC</span> {recordingTime.toString().padStart(2, '0')}:00
                    </>
                  ) : (
                    'Ready to record'
                  )}
                </p>

                <div className="flex gap-4">
                  <button
                    onClick={() => setIsRecording(!isRecording)}
                    className={`px-8 py-3 rounded-lg font-semibold transition flex items-center gap-2 ${
                      isRecording
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                    }`}
                  >
                    {isRecording ? (
                      <>
                        <StopCircle size={20} />
                        Stop Recording
                      </>
                    ) : (
                      <>
                        <Mic size={20} />
                        Start Recording
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="text-xs text-slate-400 text-center">
                <p>✓ Keep recording until you finish the assigned verses</p>
                <p>✓ Pause if needed (gaps won't be counted against you)</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-4">
            <button
              onClick={() => setTestProgress(Math.max(0, testProgress - 10))}
              className="flex-1 bg-slate-700/30 hover:bg-slate-700/50 px-6 py-3 rounded-lg font-semibold transition"
            >
              ← Previous
            </button>
            <button
              onClick={() => {
                if (testProgress >= 100) {
                  setTestMode('results');
                } else {
                  setTestProgress(Math.min(100, testProgress + 10));
                }
              }}
              className="flex-1 bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold transition"
            >
              {testProgress >= 100 ? 'Finish Test' : 'Next →'}
            </button>
          </div>
        </>
      )}

      {/* Results Mode */}
      {testMode === 'results' && (
        <>
          {/* Score Card */}
          <div className="bg-gradient-to-br from-emerald-900/30 to-teal-900/30 border border-emerald-400/30 rounded-lg p-8 mb-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-emerald-200 mb-2">Test Completed! 🎉</h2>
              <p className="text-slate-400">Completed on {testResults.completedAt}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-emerald-900/20 p-6 rounded-lg text-center">
                <p className="text-slate-400 text-sm mb-2">Overall Score</p>
                <p className="text-4xl font-bold text-emerald-300 mb-1">{testResults.score}%</p>
                <p className="text-xs text-slate-400">out of {testResults.maxScore}</p>
              </div>
              <div className="bg-cyan-900/20 p-6 rounded-lg text-center">
                <p className="text-slate-400 text-sm mb-2">Accuracy</p>
                <p className="text-4xl font-bold text-cyan-300 mb-1">{testResults.accuracy}%</p>
                <p className="text-xs text-slate-400">phrases correct</p>
              </div>
              <div className="bg-purple-900/20 p-6 rounded-lg text-center">
                <p className="text-slate-400 text-sm mb-2">Duration</p>
                <p className="text-4xl font-bold text-purple-300 mb-1">{testResults.duration}</p>
                <p className="text-xs text-slate-400">total time</p>
              </div>
            </div>

            <div className="bg-slate-900/30 p-4 rounded-lg border border-slate-600/30 mb-6">
              <p className="text-sm text-slate-400 mb-2">📝 Teacher Feedback</p>
              <p className="text-slate-200">{testResults.feedback}</p>
            </div>

            <div className="flex gap-4">
              <button className="flex-1 bg-emerald-600 hover:bg-emerald-700 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition">
                <Download size={20} />
                Download Certificate
              </button>
              <button className="flex-1 bg-slate-700/30 hover:bg-slate-700/50 py-3 rounded-lg font-semibold transition">
                Share Score
              </button>
            </div>
          </div>

          {/* Question Results */}
          <div className="bg-gradient-to-br from-slate-800/30 to-slate-700/10 border border-slate-600/30 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Detailed Results</h3>
            <div className="space-y-3">
              {testResults.questions.map((q) => (
                <div
                  key={q.id}
                  className={`p-4 rounded-lg border ${
                    q.result === 'correct'
                      ? 'bg-emerald-900/20 border-emerald-400/30'
                      : 'bg-red-900/20 border-red-400/30'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {q.result === 'correct' ? (
                        <CheckCircle2 className="text-emerald-400" size={20} />
                      ) : (
                        <XCircle className="text-red-400" size={20} />
                      )}
                      <div>
                        <p className="font-semibold text-slate-100">Question {q.id}</p>
                        <p className="text-sm text-slate-400">{q.comment}</p>
                      </div>
                    </div>
                    <span
                      className={`font-bold ${
                        q.result === 'correct' ? 'text-emerald-300' : 'text-red-300'
                      }`}
                    >
                      {q.score}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Next Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-slate-800/30 to-slate-700/10 border border-slate-600/30 rounded-lg p-6">
              <h4 className="font-semibold text-blue-300 mb-3">📚 Practice More</h4>
              <p className="text-sm text-slate-400 mb-4">Focus on areas that need improvement</p>
              <button className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg font-semibold transition">
                Start Practice Session
              </button>
            </div>

            <div className="bg-gradient-to-br from-slate-800/30 to-slate-700/10 border border-slate-600/30 rounded-lg p-6">
              <h4 className="font-semibold text-purple-300 mb-3">👨‍🏫 Review with Teacher</h4>
              <p className="text-sm text-slate-400 mb-4">Request one-on-one review</p>
              <button className="w-full bg-purple-600 hover:bg-purple-700 py-2 rounded-lg font-semibold transition">
                Schedule Review
              </button>
            </div>

            <div className="bg-gradient-to-br from-slate-800/30 to-slate-700/10 border border-slate-600/30 rounded-lg p-6">
              <h4 className="font-semibold text-emerald-300 mb-3">🎯 Take Another Test</h4>
              <p className="text-sm text-slate-400 mb-4">Try a different test type</p>
              <button
                onClick={() => setTestMode('select')}
                className="w-full bg-emerald-600 hover:bg-emerald-700 py-2 rounded-lg font-semibold transition"
              >
                New Test
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TestInterface;
