import React, { useState } from 'react';
import { ChevronRight, CheckCircle2, Clock, Zap, Target, AlertCircle, RefreshCw } from 'lucide-react';

const RevisionScheduleUI: React.FC = () => {
  const [selectedLayer, setSelectedLayer] = useState<'layer1' | 'layer2' | 'layer3'>('layer1');
  const [completedToday, setCompletedToday] = useState({
    layer1: 8,
    layer2: 4,
    layer3: 2,
  });

  // Layer 1: Same-day binding (completed today)
  const layer1Tasks = [
    { pageNum: 232, duration: '15 min', tajweed: 'Noon Sakinah', completed: true },
    { pageNum: 233, duration: '15 min', tajweed: 'Meem Sakinah', completed: true },
    { pageNum: 234, duration: '15 min', tajweed: 'Madd Rules', completed: false },
    { pageNum: 235, duration: '15 min', tajweed: 'Emphatic Letters', completed: false },
  ];

  // Layer 2: 7-day cycle (weekly rotation)
  const layer2Tasks = [
    { juz: 'Juz 10', pages: '156-160', completedDays: 2, totalDays: 3, status: 'in-progress' },
    { juz: 'Juz 9', pages: '133-154', completedDays: 3, totalDays: 3, status: 'completed' },
    { juz: 'Juz 11', pages: '161-177', completedDays: 0, totalDays: 3, status: 'pending' },
    { juz: 'Juz 12', pages: '178-188', completedDays: 1, totalDays: 3, status: 'in-progress' },
  ];

  // Layer 3: Spaced rotation (long-term retention)
  const layer3Tasks = [
    { juz: 'Juz 1-3', duration: 'Monthly', lastReview: '2 days ago', nextDue: 'Tomorrow', confidence: 92 },
    { juz: 'Juz 4-6', duration: 'Monthly', lastReview: '5 days ago', nextDue: '3 days', confidence: 78 },
    { juz: 'Juz 7-9', duration: 'Bi-weekly', lastReview: '8 days ago', nextDue: '4 days', confidence: 65 },
  ];

  const handleCompleteTask = (pageNum: number) => {
    setCompletedToday((prev) => ({
      ...prev,
      layer1: prev.layer1 + 1,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f2b] via-[#0e1436] to-[#131b41] text-slate-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 mb-2">
          3-Layer Revision Engine
        </h1>
        <p className="text-slate-400">Intelligent spaced repetition and retention optimization</p>
      </div>

      {/* Revision Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-900/30 to-blue-600/10 border border-blue-400/30 rounded-lg p-6 cursor-pointer transition hover:border-blue-400/50"
          onClick={() => setSelectedLayer('layer1')}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-blue-300">Layer 1: Same-Day Binding</h3>
            <Zap className="text-blue-400" size={20} />
          </div>
          <p className="text-2xl font-bold text-blue-200 mb-2">{completedToday.layer1}/12</p>
          <p className="text-xs text-slate-400 mb-3">Completed today • 15 min each</p>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
              style={{ width: `${(completedToday.layer1 / 12) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-900/30 to-emerald-600/10 border border-emerald-400/30 rounded-lg p-6 cursor-pointer transition hover:border-emerald-400/50"
          onClick={() => setSelectedLayer('layer2')}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-emerald-300">Layer 2: 7-Day Cycle</h3>
            <RefreshCw className="text-emerald-400" size={20} />
          </div>
          <p className="text-2xl font-bold text-emerald-200 mb-2">2/4</p>
          <p className="text-xs text-slate-400 mb-3">Juz rotation • 45 min each</p>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-green-500"
              style={{ width: '50%' }}
            />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-900/30 to-purple-600/10 border border-purple-400/30 rounded-lg p-6 cursor-pointer transition hover:border-purple-400/50"
          onClick={() => setSelectedLayer('layer3')}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-purple-300">Layer 3: Spaced Retention</h3>
            <Target className="text-purple-400" size={20} />
          </div>
          <p className="text-2xl font-bold text-purple-200 mb-2">8/30</p>
          <p className="text-xs text-slate-400 mb-3">Monthly/Bi-weekly • Long-term</p>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
              style={{ width: `${(8 / 30) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Layer Details */}
      <div className="bg-gradient-to-br from-slate-800/30 to-slate-700/10 border border-slate-600/30 rounded-lg p-6 mb-8">
        {selectedLayer === 'layer1' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-blue-300 mb-1">Layer 1: Same-Day Binding</h2>
                <p className="text-slate-400 text-sm">Memorize and bind pages within the same day for maximum retention</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-200">{completedToday.layer1}/12</p>
                <p className="text-xs text-slate-400">Completed</p>
              </div>
            </div>

            <div className="space-y-3">
              {layer1Tasks.map((task) => (
                <div
                  key={task.pageNum}
                  className={`p-4 rounded-lg border transition ${
                    task.completed
                      ? 'bg-blue-900/20 border-blue-400/30'
                      : 'bg-slate-900/20 border-slate-600/30 hover:border-slate-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {task.completed ? (
                        <CheckCircle2 className="text-emerald-400" size={24} />
                      ) : (
                        <div className="w-6 h-6 border-2 border-slate-400 rounded-full" />
                      )}
                      <div>
                        <p className="font-semibold text-slate-100">Page {task.pageNum}</p>
                        <p className="text-sm text-slate-400">{task.tajweed}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCompleteTask(task.pageNum)}
                      className={`px-4 py-2 rounded-lg font-semibold transition ${
                        task.completed
                          ? 'bg-emerald-900/30 text-emerald-300'
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                    >
                      {task.completed ? '✓ Done' : 'Start'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {selectedLayer === 'layer2' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-emerald-300 mb-1">Layer 2: 7-Day Cycle</h2>
                <p className="text-slate-400 text-sm">Review each Juz 3 times over 7 days for reinforcement</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-emerald-200">2/4</p>
                <p className="text-xs text-slate-400">Juz Groups</p>
              </div>
            </div>

            <div className="space-y-4">
              {layer2Tasks.map((task) => (
                <div
                  key={task.juz}
                  className="p-4 rounded-lg border bg-slate-900/20 border-slate-600/30 hover:border-slate-500/50 transition"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-slate-100">{task.juz}</p>
                      <p className="text-sm text-slate-400">{task.pages}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        task.status === 'completed'
                          ? 'bg-emerald-900/30 text-emerald-300'
                          : task.status === 'in-progress'
                          ? 'bg-blue-900/30 text-blue-300'
                          : 'bg-slate-700/30 text-slate-300'
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            task.status === 'completed'
                              ? 'bg-emerald-500'
                              : task.status === 'in-progress'
                              ? 'bg-blue-500'
                              : 'bg-slate-600'
                          }`}
                          style={{ width: `${(task.completedDays / task.totalDays) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        {task.completedDays}/{task.totalDays} reviews
                      </p>
                    </div>
                    <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-semibold text-sm transition">
                      Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {selectedLayer === 'layer3' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-purple-300 mb-1">Layer 3: Spaced Retention</h2>
                <p className="text-slate-400 text-sm">Long-term review with increasing intervals for permanent memorization</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-purple-200">8/30</p>
                <p className="text-xs text-slate-400">Juz Groups</p>
              </div>
            </div>

            <div className="space-y-4">
              {layer3Tasks.map((task, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg border bg-slate-900/20 border-slate-600/30 hover:border-slate-500/50 transition"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-100">{task.juz}</p>
                      <p className="text-sm text-slate-400">Review frequency: {task.duration}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-purple-300">Confidence: {task.confidence}%</p>
                      <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden mt-1">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                          style={{ width: `${task.confidence}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div className="bg-slate-800/50 p-3 rounded">
                      <p className="text-xs text-slate-400 mb-1">Last Review</p>
                      <p className="font-semibold text-slate-200">{task.lastReview}</p>
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded">
                      <p className="text-xs text-slate-400 mb-1">Next Due</p>
                      <p className="font-semibold text-slate-200">{task.nextDue}</p>
                    </div>
                    <button className="bg-purple-600 hover:bg-purple-700 rounded text-sm font-semibold transition">
                      Review Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Weak Pages Alert for Revision Adjustment */}
      <div className="bg-gradient-to-br from-red-900/20 to-orange-900/20 border border-red-400/30 rounded-lg p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="text-red-400" size={24} />
          <h3 className="text-lg font-semibold">Weak Pages Requiring Priority Revision</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { page: 145, failures: 3, revision: 'LAYER 1 ONLY', priority: 'CRITICAL' },
            { page: 267, failures: 2, revision: 'Layer 1 + Layer 2', priority: 'HIGH' },
            { page: 89, failures: 2, revision: 'Layer 1 + Layer 2', priority: 'MEDIUM' },
          ].map((item) => (
            <div
              key={item.page}
              className="bg-red-900/30 border border-red-400/30 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-red-200">Page {item.page}</p>
                <span className={`text-xs px-2 py-1 rounded font-bold ${
                  item.priority === 'CRITICAL'
                    ? 'bg-red-600/50 text-red-100'
                    : item.priority === 'HIGH'
                    ? 'bg-orange-600/50 text-orange-100'
                    : 'bg-yellow-600/50 text-yellow-100'
                }`}>
                  {item.priority}
                </span>
              </div>
              <p className="text-sm text-slate-300 mb-3">{item.failures} failures detected</p>
              <p className="text-xs text-slate-400 mb-3">Extra: {item.revision}</p>
              <button className="w-full bg-red-600/50 hover:bg-red-600 text-sm py-2 rounded font-semibold transition">
                Increase Frequency
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-slate-800/30 to-slate-700/10 border border-slate-600/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">How This Works</h3>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-900/30 text-blue-400 font-bold flex-shrink-0">
                1
              </div>
              <div>
                <p className="font-semibold text-slate-200">Same-Day Binding</p>
                <p className="text-sm text-slate-400">Review new pages 4 times today for immediate memory formation</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-emerald-900/30 text-emerald-400 font-bold flex-shrink-0">
                2
              </div>
              <div>
                <p className="font-semibold text-slate-200">7-Day Reinforcement</p>
                <p className="text-sm text-slate-400">Review each Juz 3 times over 7 days for deeper retention</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-purple-900/30 text-purple-400 font-bold flex-shrink-0">
                3
              </div>
              <div>
                <p className="font-semibold text-slate-200">Long-Term Spacing</p>
                <p className="text-sm text-slate-400">Monthly/bi-weekly reviews with increasing intervals for permanence</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800/30 to-slate-700/10 border border-slate-600/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Today's Summary</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/30">
              <span className="text-slate-400">Layer 1 Completed</span>
              <span className="font-semibold text-blue-300">8/12</span>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/30">
              <span className="text-slate-400">Layer 2 In Progress</span>
              <span className="font-semibold text-emerald-300">2/4</span>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/30">
              <span className="text-slate-400">Layer 3 Reviews</span>
              <span className="font-semibold text-purple-300">2/8</span>
            </div>
            <div className="flex items-center justify-between pt-3">
              <span className="text-slate-400">Est. Time Remaining</span>
              <span className="font-semibold text-cyan-300">2h 15m</span>
            </div>
          </div>
          <button className="w-full mt-4 bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 py-3 rounded-lg font-semibold transition">
            Continue Revisions
          </button>
        </div>
      </div>
    </div>
  );
};

export default RevisionScheduleUI;
