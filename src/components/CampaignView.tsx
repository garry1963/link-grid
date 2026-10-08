import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, ChevronRight, Lock, Star, Trophy } from 'lucide-react';
import { Chapter } from '../types/puzzle';
import { CHAPTERS, getCampaignLevel } from '../services/generator';
import { PuzzleDef } from '../types/puzzle';

interface CampaignViewProps {
  completedLevelIds: Set<string>;
  onSelectLevel: (puzzle: PuzzleDef) => void;
  onBack: () => void;
}

export const CampaignView: React.FC<CampaignViewProps> = ({
  completedLevelIds,
  onSelectLevel,
  onBack,
}) => {
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);

  // If a chapter is selected, show its 50 levels
  if (selectedChapter) {
    const levels = Array.from({ length: selectedChapter.levelCount }, (_, i) => i + 1);

    return (
      <div className="w-full max-w-md mx-auto px-4 py-5 flex flex-col min-h-screen">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => setSelectedChapter(null)}
            className="p-2 -ml-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <ArrowLeft size={22} />
          </button>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Chapter {selectedChapter.number}: {selectedChapter.title}</span>
            </h2>
            <p className="text-xs text-slate-400">
              {selectedChapter.gridSize} • {selectedChapter.difficulty.toUpperCase()}
            </p>
          </div>
        </div>

        {/* Levels Grid (50 levels) */}
        <div className="grid grid-cols-5 gap-2.5 pb-8">
          {levels.map(levelNum => {
            const levelId = `${selectedChapter.id}_lvl_${levelNum}`;
            const isCompleted = completedLevelIds.has(levelId);

            // Level is unlocked if it's level 1 or previous level is completed (or chapter 1)
            const prevLevelId = `${selectedChapter.id}_lvl_${levelNum - 1}`;
            const isUnlocked = levelNum === 1 || selectedChapter.number === 1 || completedLevelIds.has(prevLevelId);

            return (
              <button
                key={levelNum}
                disabled={!isUnlocked}
                onClick={() => {
                  const puzzle = getCampaignLevel(selectedChapter.number, levelNum);
                  onSelectLevel(puzzle);
                }}
                className={`aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all active:scale-95 ${
                  isCompleted
                    ? 'bg-emerald-500/15 border-2 border-emerald-500/50 text-emerald-300 shadow-sm shadow-emerald-500/10'
                    : isUnlocked
                    ? 'bg-slate-800/80 border border-slate-700/80 hover:bg-slate-700 text-white shadow-md'
                    : 'bg-slate-900/40 border border-slate-800/40 text-slate-600 opacity-60'
                }`}
              >
                {isUnlocked ? (
                  <>
                    <span className="text-base font-extrabold">{levelNum}</span>
                    {isCompleted ? (
                      <CheckCircle2 size={13} className="text-emerald-400 mt-0.5" />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400/50 mt-1" />
                    )}
                  </>
                ) : (
                  <Lock size={15} />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Chapters Overview list
  return (
    <div className="w-full max-w-md mx-auto px-4 py-5 flex flex-col min-h-screen">
      {/* Top Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="p-2 -ml-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
        >
          <ArrowLeft size={22} />
        </button>
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">Puzzle Campaign</h2>
          <p className="text-xs text-slate-400">10 Chapters • 500 Curated Challenges</p>
        </div>
      </div>

      {/* Chapters list */}
      <div className="space-y-3 pb-8">
        {CHAPTERS.map(ch => {
          // Count completed in this chapter
          let completedInChapter = 0;
          for (let l = 1; l <= ch.levelCount; l++) {
            if (completedLevelIds.has(`${ch.id}_lvl_${l}`)) {
              completedInChapter++;
            }
          }
          const progressPercent = Math.round((completedInChapter / ch.levelCount) * 100);

          return (
            <div
              key={ch.id}
              onClick={() => setSelectedChapter(ch)}
              className="p-4 bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800/80 hover:border-slate-700 rounded-3xl cursor-pointer transition active:scale-98 flex items-center justify-between gap-3 shadow-lg"
            >
              <div className="flex items-center gap-3.5">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-md shrink-0"
                  style={{
                    backgroundColor: `${ch.themeColor}20`,
                    color: ch.themeColor,
                    border: `1px solid ${ch.themeColor}40`,
                  }}
                >
                  {ch.number}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">{ch.title}</h3>
                    <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-slate-800 text-slate-400 uppercase">
                      {ch.difficulty}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{ch.subtitle}</p>

                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%`, backgroundColor: ch.themeColor }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 font-mono">
                      {completedInChapter}/{ch.levelCount}
                    </span>
                  </div>
                </div>
              </div>

              <ChevronRight size={18} className="text-slate-500 shrink-0" />
            </div>
          );
        })}
      </div>
    </div>
  );
};
