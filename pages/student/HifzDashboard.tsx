import React, { useState } from 'react';
import { BarChart3, BookOpen, Trophy, TrendingUp } from 'lucide-react';

const StudentHifzDashboard: React.FC = () => {
  const [studentData] = useState({
    name: 'Ahmed',
    currentJuz: 12,
    totalPagesMemoized: 234,
    retentionScore: 87,
    streakDays: 15,
    completionPercentage: 39,
  });

  console.log('StudentHifzDashboard loaded successfully');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f2b] via-[#0e1436] to-[#131b41] text-slate-100 p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
          السلام عليكم {studentData.name}
        </h1>
        <p className="text-slate-400">Welcome to your Hifz Journey</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-900/30 to-purple-600/10 border border-purple-400/30 rounded-lg p-6">
          <BookOpen className="text-purple-400 mb-2" size={28} />
          <p className="text-slate-400 text-sm">Pages Memorized</p>
          <p className="text-3xl font-bold text-purple-300">{studentData.totalPagesMemoized}</p>
        </div>

        <div className="bg-gradient-to-br from-cyan-900/30 to-cyan-600/10 border border-cyan-400/30 rounded-lg p-6">
          <TrendingUp className="text-cyan-400 mb-2" size={28} />
          <p className="text-slate-400 text-sm">Current Progress</p>
          <p className="text-3xl font-bold text-cyan-300">{studentData.currentJuz}/30 Juz</p>
        </div>

        <div className="bg-gradient-to-br from-green-900/30 to-green-600/10 border border-green-400/30 rounded-lg p-6">
          <BarChart3 className="text-green-400 mb-2" size={28} />
          <p className="text-slate-400 text-sm">Retention Score</p>
          <p className="text-3xl font-bold text-green-300">{studentData.retentionScore}%</p>
        </div>

        <div className="bg-gradient-to-br from-orange-900/30 to-orange-600/10 border border-orange-400/30 rounded-lg p-6">
          <p className="text-orange-300 text-2xl mb-1">🔥</p>
          <p className="text-slate-400 text-sm">Current Streak</p>
          <p className="text-3xl font-bold text-orange-300">{studentData.streakDays} Days</p>
        </div>
      </div>

      <div className="mt-8 bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border border-blue-400/30 rounded-lg p-8 text-center">
        <p className="text-cyan-300 text-lg font-semibold">✨ Hifz System Ready</p>
        <p className="text-slate-300 mt-2">Additional features are loading...</p>
      </div>
    </div>
  );
};

export default StudentHifzDashboard;
