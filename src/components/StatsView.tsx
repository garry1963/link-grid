import React from 'react';
import { ArrowLeft, BarChart2, Flame, Trophy, Clock, Zap, ShieldCheck } from 'lucide-react';
import { PlayerStatistics } from '../types/puzzle';

interface StatsViewProps {
  stats: PlayerStatistics;
  onBack: () => void;
}

export const StatsView: React.FC<StatsViewProps> = ({ stats, onBack }) => {
  const formatTotalTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m ${seconds % 60}s`;
  };

  const solveRate = stats.puzzlesAttempted > 0
    ? Math.round((stats.puzzlesCompleted / stats.puzzlesAttempted) * 100)
    : 0;

  return (
    <div className="w-full max-w-md mx-auto px-4 py-5 flex flex-col min-h-screen">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="p-2 -ml-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
        >
          <ArrowLeft size={22} />
        </button>
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">Player Statistics</h2>
          <p className="text-xs text-slate-400">Offline personal puzzle analytics</p>
        </div>
      </div>

      <div className="space-y-4 pb-8">
        {/* Top Highlight Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-slate-900/80 border border-slate-800/80 rounded-3xl flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Solved</span>
            <div className="text-3xl font-black text-cyan-400 font-mono mt-2">
              {stats.puzzlesCompleted}
            </div>
            <span className="text-[10px] text-slate-500 mt-1">{stats.puzzlesAttempted} attempted ({solveRate}%)</span>
          </div>

          <div className="p-4 bg-slate-900/80 border border-slate-800/80 rounded-3xl flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 text-amber-400">
              <Flame size={14} />
              <span>Daily Streak</span>
            </span>
            <div className="text-3xl font-black text-amber-400 font-mono mt-2">
              {stats.currentStreak} <span className="text-xs text-slate-400">days</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1">Best: {stats.bestStreak} days</span>
          </div>
        </div>

        {/* Secondary Metric Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-slate-900/80 border border-slate-800/80 rounded-3xl">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold mb-1">
              <Clock size={15} />
              <span>Play Time</span>
            </div>
            <div className="text-lg font-bold text-white font-mono">
              {formatTotalTime(stats.totalPlayingTime)}
            </div>
          </div>

          <div className="p-4 bg-slate-900/80 border border-slate-800/80 rounded-3xl">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold mb-1">
              <ShieldCheck size={15} className="text-emerald-400" />
              <span>Hint-Free</span>
            </div>
            <div className="text-lg font-bold text-emerald-400 font-mono">
              {stats.noHintCompletedCount} solves
            </div>
          </div>
        </div>

        {/* Breakdown by Difficulty */}
        <div className="p-5 bg-slate-900/80 border border-slate-800/80 rounded-3xl">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
            Completed by Difficulty
          </h3>

          <div className="space-y-2.5">
            {[
              { key: 'beginner', label: 'Beginner', color: '#10b981' },
              { key: 'easy', label: 'Easy', color: '#06b6d4' },
              { key: 'medium', label: 'Medium', color: '#f59e0b' },
              { key: 'hard', label: 'Hard', color: '#f97316' },
              { key: 'expert', label: 'Expert', color: '#ef4444' },
            ].map(tier => {
              const count = stats.completedByDifficulty[tier.key as keyof typeof stats.completedByDifficulty] || 0;
              return (
                <div key={tier.key} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tier.color }} />
                    <span className="font-medium text-slate-300">{tier.label}</span>
                  </div>
                  <span className="font-bold text-white font-mono">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
