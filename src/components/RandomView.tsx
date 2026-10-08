import React, { useState } from 'react';
import { ArrowLeft, Play, Sparkles } from 'lucide-react';
import { Difficulty, PuzzleDef } from '../types/puzzle';
import { getRandomPuzzle } from '../services/generator';

interface RandomViewProps {
  onStartPuzzle: (puzzle: PuzzleDef) => void;
  onBack: () => void;
}

const SIZES = [4, 5, 6, 7, 8, 9];
const DIFFICULTIES: { id: Difficulty; label: string; desc: string }[] = [
  { id: 'beginner', label: 'Beginner', desc: 'Short paths, minimal turns' },
  { id: 'easy', label: 'Easy', desc: 'Relaxed space and fewer color pairs' },
  { id: 'medium', label: 'Medium', desc: 'Balanced twists and route planning' },
  { id: 'hard', label: 'Hard', desc: 'Dense grids, intricate path weaving' },
  { id: 'expert', label: 'Expert', desc: 'Maximum complexity, strict constraints' },
];

export const RandomView: React.FC<RandomViewProps> = ({ onStartPuzzle, onBack }) => {
  const [selectedSize, setSelectedSize] = useState<number>(6);
  const [selectedDiff, setSelectedDiff] = useState<Difficulty>('medium');

  const handleGenerate = () => {
    const puzzle = getRandomPuzzle(selectedSize, selectedDiff);
    onStartPuzzle(puzzle);
  };

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
          <h2 className="text-xl font-black text-white tracking-tight">Random Puzzle</h2>
          <p className="text-xs text-slate-400">Generate limitless customized logic boards</p>
        </div>
      </div>

      <div className="space-y-6 pb-8">
        {/* Grid Size Selection */}
        <div className="p-5 bg-slate-900/80 border border-slate-800/80 rounded-3xl">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-3">
            Grid Dimensions
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {SIZES.map(size => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`py-3 rounded-2xl font-extrabold text-sm transition-all active:scale-95 ${
                  selectedSize === size
                    ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25 ring-2 ring-cyan-400'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80'
                }`}
              >
                {size} × {size}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Selection */}
        <div className="p-5 bg-slate-900/80 border border-slate-800/80 rounded-3xl">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-3">
            Difficulty Tier
          </label>
          <div className="space-y-2">
            {DIFFICULTIES.map(diff => (
              <div
                key={diff.id}
                onClick={() => setSelectedDiff(diff.id)}
                className={`p-3.5 rounded-2xl cursor-pointer border transition-all active:scale-98 flex items-center justify-between ${
                  selectedDiff === diff.id
                    ? 'bg-slate-800 border-cyan-500/70 text-white shadow-md'
                    : 'bg-slate-950/50 border-slate-800/60 text-slate-400 hover:bg-slate-800/50'
                }`}
              >
                <div>
                  <div className={`text-sm font-bold ${selectedDiff === diff.id ? 'text-cyan-400' : 'text-slate-200'}`}>
                    {diff.label}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{diff.desc}</div>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    selectedDiff === diff.id ? 'border-cyan-400' : 'border-slate-600'
                  }`}
                >
                  {selectedDiff === diff.id && <div className="w-2 h-2 rounded-full bg-cyan-400" />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-base rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/20 active:scale-98 transition"
        >
          <Sparkles size={18} />
          <span>Generate & Play</span>
        </button>
      </div>
    </div>
  );
};
