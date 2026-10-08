import React, { useState } from 'react';
import { Lightbulb, Compass, ArrowRight, Sparkles, X, CheckCircle } from 'lucide-react';
import { ColorScheme, GAME_COLORS, Path, Point, PuzzleDef } from '../types/puzzle';
import { sound } from '../services/audio';

interface HintModalProps {
  puzzle: PuzzleDef;
  paths: Path[];
  onApplyPathHint: (colorId: number) => void;
  onApplyDirectionalHint: (cell: Point) => void;
  onRevealColorSolution: (path: Path) => void;
  onClose: () => void;
}

export const HintModal: React.FC<HintModalProps> = ({
  puzzle,
  paths,
  onApplyPathHint,
  onApplyDirectionalHint,
  onRevealColorSolution,
  onClose,
}) => {
  const [selectedTier, setSelectedTier] = useState<number>(1);

  // Find first unsolved color
  const unsolvedPair = puzzle.endpoints.find(ep => {
    const existing = paths.find(p => p.colorId === ep.colorId);
    if (!existing || existing.cells.length < 2) return true;
    const first = existing.cells[0];
    const last = existing.cells[existing.cells.length - 1];
    const ok = (first.x === ep.start.x && first.y === ep.start.y && last.x === ep.end.x && last.y === ep.end.y) ||
               (first.x === ep.end.x && first.y === ep.end.y && last.x === ep.start.x && last.y === ep.start.y);
    return !ok;
  }) || puzzle.endpoints[0];

  const colorInfo: ColorScheme = GAME_COLORS[unsolvedPair.colorId % GAME_COLORS.length];

  // Get solution for this pair if available
  const solutionForPair = puzzle.solution?.find(s => s.colorId === unsolvedPair.colorId);

  const handleTier1 = () => {
    sound.playHint();
    onClose();
  };

  const handleTier2 = () => {
    sound.playHint();
    onApplyPathHint(unsolvedPair.colorId);
    onClose();
  };

  const handleTier3 = () => {
    sound.playHint();
    if (solutionForPair && solutionForPair.cells.length > 1) {
      onApplyDirectionalHint(solutionForPair.cells[1]);
    }
    onClose();
  };

  const handleTier4 = () => {
    sound.playHint();
    if (solutionForPair) {
      onRevealColorSolution(solutionForPair);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Lightbulb size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Hint Assistance</h3>
              <p className="text-xs text-slate-400">Choose your level of guidance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* 4 Hint Tiers */}
        <div className="flex flex-col gap-2.5 mb-5">
          {/* Tier 1: General Strategy */}
          <div
            onClick={handleTier1}
            className="p-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-2xl cursor-pointer active:scale-98 transition flex items-start gap-3"
          >
            <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 mt-0.5">
              <Compass size={16} />
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold text-white">Level 1: Strategic Hint</div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Always route perimeter edges first. Dots near corners usually only have one viable exit path.
              </p>
            </div>
          </div>

          {/* Tier 2: Path Hint */}
          <div
            onClick={handleTier2}
            className="p-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-2xl cursor-pointer active:scale-98 transition flex items-start gap-3"
          >
            <div
              className="p-1.5 rounded-lg mt-0.5"
              style={{ backgroundColor: colorInfo.glow, color: colorInfo.hex }}
            >
              <Lightbulb size={16} />
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Level 2: Target Pair</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded" style={{ backgroundColor: colorInfo.hex, color: '#fff' }}>
                  {colorInfo.name}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Highlight the {colorInfo.name} endpoints on the board to prioritize connecting them next.
              </p>
            </div>
          </div>

          {/* Tier 3: Directional Hint */}
          <div
            onClick={handleTier3}
            className="p-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-2xl cursor-pointer active:scale-98 transition flex items-start gap-3"
          >
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 mt-0.5">
              <ArrowRight size={16} />
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold text-white">Level 3: Direction Step</div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Glows the immediate next cell segment for the current active flow.
              </p>
            </div>
          </div>

          {/* Tier 4: Reveal Path */}
          {solutionForPair && (
            <div
              onClick={handleTier4}
              className="p-3 bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/30 rounded-2xl cursor-pointer active:scale-98 transition flex items-start gap-3"
            >
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 mt-0.5">
                <Sparkles size={16} />
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-amber-300">Level 4: Reveal One Flow</div>
                <p className="text-[11px] text-amber-400/80 mt-0.5">
                  Automatically lay down the verified solution path for the {colorInfo.name} flow.
                </p>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/80 rounded-xl transition"
        >
          Nevermind, I'll solve it myself
        </button>
      </div>
    </div>
  );
};
