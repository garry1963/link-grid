import React from 'react';
import { X, Check, AlertTriangle, Sparkles } from 'lucide-react';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">How to Play</h2>
              <p className="text-xs text-slate-400">Master the rules of Dot Connect</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 text-xs text-slate-300">
          {/* Rule 1 */}
          <div className="p-3.5 bg-slate-800/60 border border-slate-700/50 rounded-2xl flex gap-3">
            <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center shrink-0">
              1
            </div>
            <div>
              <h4 className="font-bold text-white text-sm mb-1">Connect Matching Dots</h4>
              <p className="leading-relaxed text-slate-400">
                Touch and drag from any colored endpoint to its matching partner to establish a continuous pipe connection.
              </p>
            </div>
          </div>

          {/* Rule 2 */}
          <div className="p-3.5 bg-slate-800/60 border border-slate-700/50 rounded-2xl flex gap-3">
            <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center shrink-0">
              2
            </div>
            <div>
              <h4 className="font-bold text-white text-sm mb-1">Orthogonal Movement Only</h4>
              <p className="leading-relaxed text-slate-400">
                Paths travel horizontally or vertically. Diagonal connections are strictly forbidden in Classic rules.
              </p>
            </div>
          </div>

          {/* Rule 3 */}
          <div className="p-3.5 bg-slate-800/60 border border-slate-700/50 rounded-2xl flex gap-3">
            <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center shrink-0">
              3
            </div>
            <div>
              <h4 className="font-bold text-white text-sm mb-1">No Crossing or Overlaps</h4>
              <p className="leading-relaxed text-slate-400">
                Paths cannot cross each other or enter another color's endpoint dot. If you draw into an existing path, it will truncate to avoid overlapping.
              </p>
            </div>
          </div>

          {/* Rule 4 */}
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex gap-3">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">
              4
            </div>
            <div>
              <h4 className="font-bold text-emerald-300 text-sm mb-1">Fill Every Single Cell (100%)</h4>
              <p className="leading-relaxed text-emerald-400/90">
                It is not enough to just connect all pairs! A puzzle is only solved when <strong>every playable grid cell is occupied by a path</strong>.
              </p>
            </div>
          </div>

          {/* Controls Tip */}
          <div className="p-3.5 bg-slate-800/40 border border-slate-700/30 rounded-2xl flex gap-3 items-center">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
              <Check size={16} />
            </div>
            <p className="text-[11px] text-slate-300">
              <strong>Pro Tip:</strong> Drag backwards along your own path to quickly erase/backtrack, or tap an existing path cell to branch from there.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-cyan-500/20"
        >
          Got it, let's play!
        </button>
      </div>
    </div>
  );
};
