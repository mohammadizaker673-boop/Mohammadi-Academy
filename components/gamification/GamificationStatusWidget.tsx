import React from 'react';
import { Zap, Flame, Award } from 'lucide-react';
import { GamificationStatus, formatXP, getLevelTitle, getNextXPMilestone } from '../../services/gamificationService';

interface GamificationStatusWidgetProps {
  status: GamificationStatus;
  showDetails?: boolean;
}

const GamificationStatusWidget: React.FC<GamificationStatusWidgetProps> = ({
  status,
  showDetails = false,
}) => {
  const nextXPNeeded = getNextXPMilestone(status.totalXP, status.level);
  const levelTitle = getLevelTitle(status.level);

  if (showDetails) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black text-white">Your Progress</h3>
          <span className="text-2xl">⭐</span>
        </div>

        {/* Level Section */}
        <div className="bg-slate-800/60 rounded-xl p-4">
          <p className="text-xs text-slate-400 uppercase tracking-[0.2em] font-bold mb-2">Level</p>
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-4xl font-black text-amber-300">{status.level}</p>
              <p className="text-sm text-amber-200 font-semibold">{levelTitle}</p>
            </div>
            <p className="text-2xl">🏆</p>
          </div>

          {/* Level Progress Bar */}
          <div className="space-y-1">
            <p className="text-xs text-slate-400">
              {status.currentLevelProgress}% to next level
            </p>
            <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
                style={{ width: `${status.currentLevelProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* XP Section */}
        <div className="bg-slate-800/60 rounded-xl p-4">
          <p className="text-xs text-slate-400 uppercase tracking-[0.2em] font-bold mb-2 flex items-center gap-1">
            <Zap size={12} className="text-yellow-400" /> Experience Points
          </p>
          <p className="text-3xl font-black text-yellow-300 mb-1">{formatXP(status.totalXP)}</p>
          <p className="text-xs text-slate-400">
            {formatXP(nextXPNeeded)} needed for next level
          </p>
        </div>

        {/* Streak Section */}
        {status.streak > 0 && (
          <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/20">
            <p className="text-xs text-red-300 uppercase tracking-[0.2em] font-bold mb-2 flex items-center gap-1">
              <Flame size={12} /> Streak
            </p>
            <p className="text-3xl font-black text-red-400">{status.streak} 🔥</p>
            <p className="text-xs text-red-200 mt-1">Keep it going!</p>
          </div>
        )}

        {/* Badges Section */}
        {status.badges.length > 0 && (
          <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
            <p className="text-xs text-purple-300 uppercase tracking-[0.2em] font-bold mb-3 flex items-center gap-1">
              <Award size={12} /> Badges Earned
            </p>
            <div className="grid grid-cols-2 gap-2">
              {status.badges.slice(0, 6).map(badge => (
                <div key={badge.badgeId} className="bg-purple-500/20 rounded-lg p-2 text-center">
                  <p className="text-2xl mb-1">{badge.icon}</p>
                  <p className="text-xs font-semibold text-purple-200 leading-tight">{badge.title}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Next Badge Hint */}
        {status.nextBadgeThreshold && (
          <div className="bg-blue-500/10 rounded-xl p-3 border border-blue-500/20">
            <p className="text-xs text-blue-300 font-semibold">
              💡 Next badge in {status.nextBadgeThreshold} lessons!
            </p>
          </div>
        )}
      </div>
    );
  }

  // Compact view (for header)
  return (
    <div className="flex items-center gap-4 text-sm">
      {/* Level Badge */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30">
        <span className="text-xs font-black text-amber-300">LV {status.level}</span>
      </div>

      {/* XP */}
      <div className="flex items-center gap-1.5 text-yellow-300">
        <Zap size={14} />
        <span className="font-semibold text-xs">{formatXP(status.totalXP)}</span>
      </div>

      {/* Streak */}
      {status.streak > 0 && (
        <div className="flex items-center gap-1.5 text-red-400">
          <Flame size={14} />
          <span className="font-semibold text-xs">{status.streak}</span>
        </div>
      )}
    </div>
  );
};

export default GamificationStatusWidget;
