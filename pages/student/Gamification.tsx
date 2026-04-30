import React, { useState } from 'react';
import { Trophy, Flame, Star, Medal, Lock, Unlock } from 'lucide-react';

const GamificationUI: React.FC = () => {
  const [viewMode, setViewMode] = useState<'badges' | 'leaderboard' | 'streaks'>('badges');

  // Badges
  const badges = [
    {
      id: 1,
      name: 'First Steps',
      description: 'Memorize your first 5 pages',
      icon: '🌱',
      unlocked: true,
      progress: 100,
      unlockedDate: '5 days ago',
    },
    {
      id: 2,
      name: 'Juz Master',
      description: 'Complete 5 full Juz',
      icon: '📖',
      unlocked: true,
      progress: 100,
      unlockedDate: '2 days ago',
    },
    {
      id: 3,
      name: 'Half Hafiz',
      description: 'Memorize 302 pages (Half Quran)',
      icon: '✨',
      unlocked: false,
      progress: 77,
      pagesNeeded: 68,
    },
    {
      id: 4,
      name: 'Perfect Week',
      description: 'Maintain 7-day memorization streak',
      icon: '🔥',
      unlocked: true,
      progress: 100,
      unlockedDate: '1 week ago',
    },
    {
      id: 5,
      name: 'Tajweed Expert',
      description: 'Score 95%+ on Tajweed tests',
      icon: '🎯',
      unlocked: false,
      progress: 88,
      testsNeeded: 1,
    },
    {
      id: 6,
      name: 'Marathon Runner',
      description: 'Maintain 30-day streak',
      icon: '⚡',
      unlocked: false,
      progress: 50,
      daysNeeded: 15,
    },
  ];

  // Leaderboard
  const leaderboard = [
    { rank: 1, name: 'Fatima Al-Harbi', pages: 289, streak: 22, avatar: '👩‍🎓' },
    { rank: 2, name: 'Ahmed Al-Dosari', pages: 267, streak: 18, avatar: '👨‍🎓' },
    { rank: 3, name: 'You', pages: 234, streak: 15, avatar: '😊' },
    { rank: 4, name: 'Aisha Mohammed', pages: 198, streak: 11, avatar: '👶' },
    { rank: 5, name: 'Hassan Khan', pages: 156, streak: 8, avatar: '👦' },
    { rank: 6, name: 'Layla Ibrahim', pages: 134, streak: 5, avatar: '👧' },
    { rank: 7, name: 'Omar Al-Ghanim', pages: 112, streak: 4, avatar: '🧑‍🎓' },
    { rank: 8, name: 'Mariam Hussain', pages: 98, streak: 3, avatar: '👩‍🦰' },
  ];

  // Streaks - Current students with active streaks
  const streaks = [
    { name: 'You', days: 15, emoji: '😊', totalPages: 234, avgPerDay: 15.6, nextMilestone: '20 days' },
    { name: 'Fatima', days: 22, emoji: '👩‍🎓', totalPages: 289, avgPerDay: 13.1, nextMilestone: '30 days' },
    { name: 'Ahmed', days: 18, emoji: '👨‍🎓', totalPages: 267, avgPerDay: 14.8, nextMilestone: '21 days' },
    { name: 'Aisha', days: 11, emoji: '👶', totalPages: 198, avgPerDay: 18.0, nextMilestone: '14 days' },
    { name: 'Hassan', days: 8, emoji: '👦', totalPages: 156, avgPerDay: 19.5, nextMilestone: '10 days' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f2b] via-[#0e1436] to-[#131b41] text-slate-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 mb-2">
          Gamification & Achievements
        </h1>
        <p className="text-slate-400">Track your progress, unlock badges, and climb the leaderboard</p>
      </div>

      {/* View Mode Selector */}
      <div className="flex gap-3 mb-8">
        {[
          { id: 'badges', label: '🏆 Badges' },
          { id: 'leaderboard', label: '🥇 Leaderboard' },
          { id: 'streaks', label: '🔥 Streaks' },
        ].map((mode) => (
          <button
            key={mode.id}
            onClick={() => setViewMode(mode.id as 'badges' | 'leaderboard' | 'streaks')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              viewMode === mode.id
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                : 'bg-slate-800/30 text-slate-400 hover:bg-slate-700/30'
            }`}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {/* Badges View */}
      {viewMode === 'badges' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className={`rounded-lg p-6 border transition transform hover:scale-105 ${
                  badge.unlocked
                    ? 'bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border-yellow-400/30'
                    : 'bg-gradient-to-br from-slate-800/30 to-slate-700/30 border-slate-600/30'
                }`}
              >
                <div className="text-center mb-4">
                  <div className="text-6xl mb-3">{badge.icon}</div>
                  {badge.unlocked ? (
                    <Unlock className="text-yellow-400 mx-auto mb-2" size={20} />
                  ) : (
                    <Lock className="text-slate-400 mx-auto mb-2" size={20} />
                  )}
                </div>
                <h3 className="text-lg font-bold text-center mb-1 text-yellow-200">{badge.name}</h3>
                <p className="text-sm text-slate-400 text-center mb-4">{badge.description}</p>

                {badge.unlocked ? (
                  <div className="text-center">
                    <p className="text-xs text-emerald-400 font-semibold mb-1">✓ UNLOCKED</p>
                    <p className="text-xs text-slate-400">{badge.unlockedDate}</p>
                  </div>
                ) : (
                  <div>
                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden mb-2">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
                        style={{ width: `${badge.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-400 text-center">
                      {badge.progress}% • {badge.pagesNeeded || badge.testsNeeded || badge.daysNeeded} to go
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Badge Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-slate-800/30 to-slate-700/10 border border-slate-600/30 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-slate-400">Unlocked Badges</p>
                <Trophy className="text-yellow-400" size={24} />
              </div>
              <p className="text-3xl font-bold text-yellow-300">4/6</p>
              <p className="text-sm text-slate-400 mt-1">2 more to unlock!</p>
            </div>
            <div className="bg-gradient-to-br from-slate-800/30 to-slate-700/10 border border-slate-600/30 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-slate-400">Total Points</p>
                <Star className="text-orange-400" size={24} />
              </div>
              <p className="text-3xl font-bold text-orange-300">2,450</p>
              <p className="text-sm text-slate-400 mt-1">from 15 accomplishments</p>
            </div>
            <div className="bg-gradient-to-br from-slate-800/30 to-slate-700/10 border border-slate-600/30 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-slate-400">Achievement %</p>
                <Medal className="text-blue-400" size={24} />
              </div>
              <p className="text-3xl font-bold text-blue-300">67%</p>
              <p className="text-sm text-slate-400 mt-1">Above class average</p>
            </div>
          </div>
        </>
      )}

      {/* Leaderboard View */}
      {viewMode === 'leaderboard' && (
        <>
          <div className="bg-gradient-to-br from-slate-800/30 to-slate-700/10 border border-slate-600/30 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-6">Global Leaderboard</h2>

            {/* Your Position Highlight */}
            <div className="mb-6 p-4 rounded-lg bg-blue-900/30 border border-blue-400/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-3xl font-bold text-blue-300">3</div>
                  <div>
                    <p className="font-semibold text-blue-200">You</p>
                    <p className="text-sm text-slate-400">234 pages • 15-day streak</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-400">55 pages behind</p>
                  <p className="text-xs text-blue-400 font-semibold">Rise to #2!</p>
                </div>
              </div>
            </div>

            {/* Full Leaderboard */}
            <div className="space-y-3">
              {leaderboard.map((entry) => (
                <div
                  key={entry.rank}
                  className={`flex items-center justify-between p-4 rounded-lg border transition ${
                    entry.rank === 3
                      ? 'bg-blue-900/20 border-blue-400/50'
                      : entry.rank === 1
                      ? 'bg-yellow-900/20 border-yellow-400/30'
                      : entry.rank === 2
                      ? 'bg-slate-600/20 border-slate-500/30'
                      : 'bg-slate-900/20 border-slate-600/30'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      entry.rank === 1
                        ? 'bg-yellow-500 text-yellow-900'
                        : entry.rank === 2
                        ? 'bg-slate-400 text-slate-900'
                        : entry.rank === 3
                        ? 'bg-orange-400 text-orange-900'
                        : 'bg-slate-700 text-slate-200'
                    }`}>
                      {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : entry.rank}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{entry.avatar} {entry.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-emerald-300">{entry.pages} pages</p>
                    <p className="text-xs text-slate-400">🔥 {entry.streak}d streak</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Leaderboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border border-yellow-400/30 rounded-lg p-6">
              <h3 className="font-semibold mb-4">🏆 Top Performer This Month</h3>
              <p className="text-2xl font-bold text-yellow-300 mb-1">Fatima Al-Harbi</p>
              <p className="text-slate-400 mb-4">289 pages, 22-day streak</p>
              <button className="w-full bg-yellow-600 hover:bg-yellow-700 py-2 rounded-lg font-semibold transition">
                View Profile
              </button>
            </div>

            <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border border-blue-400/30 rounded-lg p-6">
              <h3 className="font-semibold mb-4">📊 Your Rank Insights</h3>
              <div className="space-y-2 text-sm">
                <p className="text-slate-300">• You're in the top <span className="font-bold text-cyan-300">10%</span> of students</p>
                <p className="text-slate-300">• <span className="font-bold text-cyan-300">55 pages</span> to reach rank #2</p>
                <p className="text-slate-300">• Average rank progress: <span className="font-bold text-cyan-300">5 positions/month</span></p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Streaks View */}
      {viewMode === 'streaks' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Your Streak Highlighted */}
            <div className="lg:col-span-2 bg-gradient-to-br from-red-900/30 to-orange-900/30 border border-red-400/30 rounded-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-red-300 mb-1">Your Current Streak</h2>
                  <p className="text-slate-400">Keep it up! You're on fire 🔥</p>
                </div>
                <Flame className="text-red-400 animate-pulse" size={48} />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-red-900/20 p-4 rounded-lg">
                  <p className="text-slate-400 text-sm mb-1">Days</p>
                  <p className="text-4xl font-bold text-red-300">15</p>
                </div>
                <div className="bg-orange-900/20 p-4 rounded-lg">
                  <p className="text-slate-400 text-sm mb-1">Total Pages</p>
                  <p className="text-4xl font-bold text-orange-300">234</p>
                </div>
                <div className="bg-yellow-900/20 p-4 rounded-lg">
                  <p className="text-slate-400 text-sm mb-1">Avg/Day</p>
                  <p className="text-4xl font-bold text-yellow-300">15.6</p>
                </div>
                <div className="bg-emerald-900/20 p-4 rounded-lg">
                  <p className="text-slate-400 text-sm mb-1">Next Goal</p>
                  <p className="text-4xl font-bold text-emerald-300">20d</p>
                </div>
              </div>
              <div className="mt-6 p-4 bg-red-900/20 border border-red-400/30 rounded-lg">
                <p className="text-sm mb-2">Streak Milestone Progress</p>
                <div className="w-full h-3 bg-red-900/30 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-red-500 to-orange-500" style={{ width: `${(15/20)*100}%` }} />
                </div>
                <p className="text-xs text-slate-400 mt-2">75% to 20-day streak reward: +50 XP 🎁</p>
              </div>
            </div>
          </div>

          {/* Streaks Leaderboard */}
          <div className="bg-gradient-to-br from-slate-800/30 to-slate-700/10 border border-slate-600/30 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-6">🔥 Top Streaks</h3>
            <div className="space-y-3">
              {streaks.map((streak, idx) => (
                <div
                  key={streak.name}
                  className={`p-4 rounded-lg border ${
                    streak.name === 'You'
                      ? 'bg-blue-900/20 border-blue-400/30'
                      : 'bg-slate-900/20 border-slate-600/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{streak.emoji}</div>
                      <div>
                        <p className="font-semibold text-slate-100">{streak.name}</p>
                        <p className="text-sm text-slate-400">{streak.totalPages} pages memorized</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-2">
                        <Flame className="text-red-400" size={18} />
                        <span className="text-2xl font-bold text-red-300">{streak.days}</span>
                        <span className="text-slate-400">days</span>
                      </div>
                      <p className="text-xs text-slate-400">{streak.avgPerDay} pages/day</p>
                    </div>
                  </div>
                  <div className="mt-3 p-2 bg-slate-900/30 rounded text-xs text-slate-400">
                    Next milestone: {streak.nextMilestone}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Streak Streak Tips */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-gradient-to-br from-slate-800/30 to-slate-700/10 border border-slate-600/30 rounded-lg p-6">
              <p className="text-lg font-semibold mb-3">💡 Pro Tips</p>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>• Memorize at the same time daily</li>
                <li>• Use the 3-layer revision system</li>
                <li>• Skip weekends to reset stress</li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-slate-800/30 to-slate-700/10 border border-slate-600/30 rounded-lg p-6">
              <p className="text-lg font-semibold mb-3">🎁 Streak Rewards</p>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>• 7 days → 25 XP</li>
                <li>• 14 days → 100 XP</li>
                <li>• 30 days → Badge unlock</li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-slate-800/30 to-slate-700/10 border border-slate-600/30 rounded-lg p-6">
              <p className="text-lg font-semibold mb-3">⚠️ Streak Breaks</p>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>• 1 day miss → Streak frozen</li>
                <li>• 3 days miss → Streak reset</li>
                <li>• Can't recover once reset</li>
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default GamificationUI;
