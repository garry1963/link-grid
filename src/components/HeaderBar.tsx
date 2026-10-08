import React from 'react';
import { ArrowLeft, RotateCcw, Undo2, Redo2, Lightbulb, Play, Pause } from 'lucide-react';
import { Difficulty, PuzzleDef } from '../types/puzzle';

interface HeaderBarProps {
  puzzle: PuzzleDef;
  connectedPairs: number;
  totalPairs: number;
  occupiedCells: number;
  totalCells: number;
  moves: number;
  elapsedSeconds: number;
  showTimer: boolean;
  showMoves: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onBack: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  onHint: () => void;
}

const difficultyBadgeColors: Record<Difficulty, string> = {
  beginner: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  easy: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  medium: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  hard: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  expert: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
};

export const HeaderBar: React.FC<HeaderBarProps> = ({
  puzzle,
  connectedPairs,
  totalPairs,
  occupiedCells,
  totalCells,
  moves,
  elapsedSeconds,
  showTimer,
  showMoves,
  canUndo,
  canRedo,
  onBack,
  onUndo,
  onRedo,
  onReset,
  onHint,
}) => {
  const percentFilled = Math.round((occupiedCells / totalCells) * 100);
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-[440px] mx-auto px-3 py-2 flex flex-col gap-2.5">
      {/* Top Bar with Navigation and Title */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          aria-label="Back to Menu"
          className="p-2 -ml-1 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/60 active:scale-95 transition"
        >
          <ArrowLeft size={22} />
        </button>

        <div className="text-center flex flex-col items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight line-clamp-1">
              {puzzle.title}
            </h1>
            <span
              className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                difficultyBadgeColors[puzzle.difficulty]
              }`}
            >
              {puzzle.difficulty}
            </span>
          </div>
          <span className="text-[11px] font-medium text-slate-400">
            {puzzle.width}×{puzzle.height} Grid
          </span>
        </div>

        <div className="w-8" />
      </div>

      {/* Progress & Stat Indicators */}
      <div className="grid grid-cols-3 gap-2 bg-slate-900/70 border border-slate-800/80 p-2.5 rounded-2xl backdrop-blur-md">
        {/* Flows Connected */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Flows</span>
          <div className="flex items-baseline gap-1">
            <span className={`text-base font-extrabold ${connectedPairs === totalPairs ? 'text-emerald-400' : 'text-white'}`}>
              {connectedPairs}
            </span>
            <span className="text-xs text-slate-500 font-bold">/{totalPairs}</span>
          </div>
        </div>

        {/* Board Filled */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Pipe Filled</span>
          <div className="flex items-baseline gap-1">
            <span className={`text-base font-extrabold ${percentFilled === 100 ? 'text-cyan-400' : 'text-white'}`}>
              {percentFilled}%
            </span>
          </div>
        </div>

        {/* Moves & Timer */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            {showTimer ? 'Time' : 'Moves'}
          </span>
          <span className="text-base font-extrabold text-white font-mono">
            {showTimer ? formatTime(elapsedSeconds) : moves}
          </span>
        </div>
      </div>

      {/* Mini Progress Bar */}
      <div className="w-full bg-slate-800/60 h-1.5 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-300"
          style={{ width: `${percentFilled}%` }}
        />
      </div>

      {/* Action Controls Toolbar: Undo, Redo, Reset, Hint */}
      <div className="flex items-center justify-between px-2 pt-1">
        <div className="flex items-center gap-1.5">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            aria-label="Undo move"
            className="p-2.5 text-slate-300 hover:text-white bg-slate-800/70 hover:bg-slate-700/80 disabled:opacity-35 disabled:hover:bg-slate-800/70 rounded-xl transition active:scale-95 border border-slate-700/50"
            title="Undo"
          >
            <Undo2 size={18} />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            aria-label="Redo move"
            className="p-2.5 text-slate-300 hover:text-white bg-slate-800/70 hover:bg-slate-700/80 disabled:opacity-35 disabled:hover:bg-slate-800/70 rounded-xl transition active:scale-95 border border-slate-700/50"
            title="Redo"
          >
            <Redo2 size={18} />
          </button>
          <button
            onClick={onReset}
            aria-label="Reset all paths"
            className="p-2.5 text-slate-300 hover:text-rose-400 bg-slate-800/70 hover:bg-slate-700/80 rounded-xl transition active:scale-95 border border-slate-700/50"
            title="Reset Paths"
          >
            <RotateCcw size={18} />
          </button>
        </div>

        <button
          onClick={onHint}
          aria-label="Get a hint"
          className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 border border-amber-500/40 text-amber-300 font-semibold text-xs rounded-xl transition active:scale-95 shadow-sm"
        >
          <Lightbulb size={16} className="text-amber-400" />
          <span>Hint</span>
        </button>
      </div>
    </div>
  );
};
