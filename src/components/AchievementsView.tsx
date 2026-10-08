import React from 'react';
import { ArrowLeft, Award, Trophy, Zap, Target, Flame, Calendar, Compass, ShieldCheck, CheckCircle, Sparkles } from 'lucide-react';
import { Achievement } from '../types/puzzle';

interface AchievementsViewProps {
  achievements: Achievement[];
  onBack: () => void;
}

const iconMap: Record<string, React.ReactNode> = {
  Zap: <Zap size={18} />,
  Target: <Target size={18} />,
  Award: <Award size={18} />,
  Trophy: <Trophy size={18} />,
  Flame: <Flame size={18} />,
  Calendar: <Calendar size={18} />,
  Compass: <Compass size={18} />,
  ShieldCheck: <ShieldCheck size={18} />,
  CheckCircle: <CheckCircle size={18} />,
  Sparkles: <Sparkles size={18} />,
};

export const AchievementsView: React.FC<AchievementsViewProps> = ({ achievements, onBack }) => {
  const unlockedCount = achievements.filter(a => a.isUnlocked).length;

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
          <h2 className="text-xl font-black text-white tracking-tight">Achievements</h2>
          <p className="text-xs text-slate-400">
            {unlockedCount} of {achievements.length} Unlocked
          </p>
        </div>
      </div>

      <div className="space-y-3 pb-8">
        {achievements.map(ach => {
          const percent = Math.min(100, Math.round((ach.progressValue / ach.targetValue) * 100));

          return (
            <div
              key={ach.id}
              className={`p-4 rounded-3xl border transition-all ${
                ach.isUnlocked
                  ? 'bg-slate-900/90 border-amber-500/40 shadow-lg shadow-amber-500/5'
                  : 'bg-slate-950/60 border-slate-800/80 opacity-75'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                    ach.isUnlocked
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {iconMap[ach.iconName] || <Award size={18} />}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className={`text-sm font-bold ${ach.isUnlocked ? 'text-white' : 'text-slate-300'}`}>
                      {ach.title}
                    </h3>
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      {ach.progressValue}/{ach.targetValue}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    {ach.description}
                  </p>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        ach.isUnlocked ? 'bg-amber-400' : 'bg-cyan-500/80'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
