import React, { useState } from 'react';
import { ArrowLeft, Calendar, Flame, Trophy, CheckCircle, ChevronRight, Play } from 'lucide-react';
import { getDailyPuzzle } from '../services/generator';
import { PuzzleDef } from '../types/puzzle';

interface DailyViewProps {
  currentStreak: number;
  bestStreak: number;
  dailySolvedMap: Record<string, boolean>;
  onSelectDaily: (puzzle: PuzzleDef) => void;
  onBack: () => void;
}

export const DailyView: React.FC<DailyViewProps> = ({
  currentStreak,
  bestStreak,
  dailySolvedMap,
  onSelectDaily,
  onBack,
}) => {
  const todayDate = new Date();
  const formatKey = (d: Date) => d.toISOString().split('T')[0];
  const todayKey = formatKey(todayDate);
  const isTodaySolved = !!dailySolvedMap[todayKey];

  // Generate last 14 days for archive
  const pastDays = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = formatKey(d);
    return {
      date: d,
      key,
      isToday: i === 0,
      isSolved: !!dailySolvedMap[key],
    };
  });

  return (
    <div className="w-full max-w-md mx-auto px-4 py-5 flex flex-col min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="p-2 -ml-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
        >
          <ArrowLeft size={22} />
        </button>
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">Daily Challenge</h2>
          <p className="text-xs text-slate-400">One synchronized puzzle every day</p>
        </div>
      </div>

      {/* Streak Dashboard Card */}
      <div className="p-5 bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-transparent border border-amber-500/30 rounded-3xl mb-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
              <Flame size={16} />
              <span>Current Streak</span>
            </div>
            <div className="text-3xl font-black text-white font-mono flex items-baseline gap-1.5">
              <span>{currentStreak}</span>
              <span className="text-sm font-semibold text-slate-400">Days</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Best Streak</span>
            <div className="text-xl font-bold text-amber-300 font-mono mt-0.5">
              {bestStreak} Days
            </div>
          </div>
        </div>

        {/* Play Today's Puzzle Button */}
        <div className="mt-5 pt-4 border-t border-amber-500/20 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-white">
              {todayDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
            </div>
            <div className="text-[11px] text-slate-400">
              {isTodaySolved ? 'Completed ⭐ • No Replay Allowed' : 'Ready to solve'}
            </div>
          </div>

          {isTodaySolved ? (
            <div className="py-2.5 px-4 bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm">
              <CheckCircle size={15} />
              <span>Completed</span>
            </div>
          ) : (
            <button
              onClick={() => onSelectDaily(getDailyPuzzle(todayKey))}
              className="py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition"
            >
              <Play size={15} fill="currentColor" />
              <span>Play Now</span>
            </button>
          )}
        </div>
      </div>

      {/* Daily Archive List */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
          <Calendar size={16} className="text-cyan-400" />
          <span>Past 14 Days Archive</span>
        </h3>
        <span className="text-xs text-slate-400">
          {pastDays.filter(d => d.isSolved).length}/14 Solved
        </span>
      </div>

      <div className="space-y-2 pb-8">
        {pastDays.map(item => {
          const isCompleted = item.isSolved;
          return (
            <div
              key={item.key}
              onClick={() => {
                if (!isCompleted) {
                  onSelectDaily(getDailyPuzzle(item.key));
                }
              }}
              className={`p-3.5 bg-slate-900/80 border rounded-2xl flex items-center justify-between transition ${
                isCompleted
                  ? 'border-emerald-500/30 opacity-80 cursor-default'
                  : 'hover:bg-slate-800/80 border-slate-800/80 cursor-pointer active:scale-98'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                    isCompleted
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {isCompleted ? <CheckCircle size={16} /> : item.date.getDate()}
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>
                      {item.date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                    {item.isToday && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                        Today
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {isCompleted ? 'Solved • No Replay' : 'Unsolved • Tap to Play'}
                  </span>
                </div>
              </div>

              {isCompleted ? (
                <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                  Locked
                </span>
              ) : (
                <ChevronRight size={16} className="text-slate-600" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
