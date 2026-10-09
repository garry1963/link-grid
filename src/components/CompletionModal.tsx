import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Star, Trophy, RotateCcw, ArrowRight, Share2, Home, Check } from 'lucide-react';
import { PuzzleDef } from '../types/puzzle';

interface CompletionModalProps {
  puzzle: PuzzleDef;
  elapsedSeconds: number;
  moves: number;
  hintsUsed: number;
  hasNextLevel: boolean;
  onNextLevel: () => void;
  onReplay: () => void;
  onHome: () => void;
}

export const CompletionModal: React.FC<CompletionModalProps> = ({
  puzzle,
  elapsedSeconds,
  moves,
  hintsUsed,
  hasNextLevel,
  onNextLevel,
  onReplay,
  onHome,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  // Calculate stars: 3 for 0 hints, 2 for 1-2 hints, 1 for > 2 hints
  const stars = hintsUsed === 0 ? 3 : hintsUsed <= 2 ? 2 : 1;

  useEffect(() => {
    // Fire celebratory confetti bursts
    const end = Date.now() + 1000;
    const colors = ['#06b6d4', '#10b981', '#f59e0b', '#a855f7', '#ec4899'];
    let animId: number | null = null;

    function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });

      if (Date.now() < end) {
        animId = requestAnimationFrame(frame);
      }
    }

    frame();

    return () => {
      if (animId) {
        cancelAnimationFrame(animId);
      }
    };
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleShare = () => {
    const title = puzzle.isDailyPuzzle ? `Daily Challenge ${puzzle.dateKey}` : puzzle.title;
    const starEmojis = '⭐'.repeat(stars);
    const text = `Dot Connect 🧩 ${title}\n` +
      `Grid: ${puzzle.width}×${puzzle.height} (${puzzle.difficulty.toUpperCase()})\n` +
      `Time: ${formatTime(elapsedSeconds)} | Moves: ${moves} | Rating: ${starEmojis}\n` +
      `100% Board Covered 🟢`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-center flex flex-col items-center">
        {/* Trophy icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-yellow-500/30 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-4 shadow-lg shadow-amber-500/10">
          <Trophy size={32} />
        </div>

        <h2 className="text-2xl font-black text-white tracking-tight mb-1">
          Puzzle Solved!
        </h2>
        <p className="text-sm font-medium text-slate-400 mb-4">
          All pairs connected & board 100% covered!
        </p>

        {/* Stars */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map(index => (
            <Star
              key={index}
              size={32}
              className={`transition-all duration-300 ${
                index <= stars
                  ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                  : 'text-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Stats card */}
        <div className="w-full grid grid-cols-3 gap-2 bg-slate-950/60 border border-slate-800/80 p-3 rounded-2xl mb-6">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Time</span>
            <span className="text-base font-bold text-white font-mono">{formatTime(elapsedSeconds)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Moves</span>
            <span className="text-base font-bold text-white">{moves}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Hints</span>
            <span className="text-base font-bold text-white">{hintsUsed}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          {hasNextLevel && (
            <button
              onClick={onNextLevel}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 active:scale-98 transition"
            >
              <span>Next Level</span>
              <ArrowRight size={18} />
            </button>
          )}

          {puzzle.isDailyPuzzle ? (
            <button
              onClick={handleShare}
              className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700/90 text-slate-200 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-slate-700/60 active:scale-98 transition"
            >
              {copied ? <Check size={15} className="text-emerald-400" /> : <Share2 size={15} />}
              <span>{copied ? 'Scorecard Copied!' : 'Share Scorecard'}</span>
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onReplay}
                className="py-3 px-3 bg-slate-800 hover:bg-slate-700/80 text-slate-200 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-slate-700/60 active:scale-98 transition"
              >
                <RotateCcw size={15} />
                <span>Replay</span>
              </button>

              <button
                onClick={handleShare}
                className="py-3 px-3 bg-slate-800 hover:bg-slate-700/80 text-slate-200 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-slate-700/60 active:scale-98 transition"
              >
                {copied ? <Check size={15} className="text-emerald-400" /> : <Share2 size={15} />}
                <span>{copied ? 'Copied!' : 'Share'}</span>
              </button>
            </div>
          )}

          <button
            onClick={onHome}
            className="w-full py-2.5 px-4 text-slate-400 hover:text-white font-medium text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
          >
            <Home size={15} />
            <span>Main Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
