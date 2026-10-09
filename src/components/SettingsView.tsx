import React, { useState } from 'react';
import { ArrowLeft, Volume2, Smartphone, Eye, Clock, Hash, Trash2, Shield, Info, Grid } from 'lucide-react';
import { Settings } from '../types/puzzle';
import { sound } from '../services/audio';

interface SettingsViewProps {
  settings: Settings;
  onUpdateSettings: (newSettings: Settings) => void;
  onResetAllData: () => void;
  onBack: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onResetAllData,
  onBack,
}) => {
  const [confirmReset, setConfirmReset] = useState<boolean>(false);

  const toggle = (key: keyof Settings) => {
    sound.playClick();
    const updated = { ...settings, [key]: !settings[key] };
    if (key === 'soundEnabled') {
      sound.setSoundEnabled(updated.soundEnabled);
    }
    if (key === 'vibrationEnabled') {
      sound.setHapticsEnabled(updated.vibrationEnabled);
    }
    onUpdateSettings(updated);
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
          <h2 className="text-xl font-black text-white tracking-tight">Settings</h2>
          <p className="text-xs text-slate-400">Game preferences & accessibility</p>
        </div>
      </div>

      <div className="space-y-4 pb-8">
        {/* Audio & Haptics */}
        <div className="p-5 bg-slate-900/80 border border-slate-800/80 rounded-3xl space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Audio & Haptics
          </h3>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-800 text-slate-300">
                <Volume2 size={18} />
              </div>
              <div>
                <div className="text-sm font-bold text-white">Sound Effects</div>
                <div className="text-xs text-slate-400">Tactile audio synthesizer chimes</div>
              </div>
            </div>
            <button
              onClick={() => toggle('soundEnabled')}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                settings.soundEnabled ? 'bg-cyan-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  settings.soundEnabled ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-800 text-slate-300">
                <Smartphone size={18} />
              </div>
              <div>
                <div className="text-sm font-bold text-white">Haptic Vibration</div>
                <div className="text-xs text-slate-400">Subtle vibration when connecting dots</div>
              </div>
            </div>
            <button
              onClick={() => toggle('vibrationEnabled')}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                settings.vibrationEnabled ? 'bg-cyan-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  settings.vibrationEnabled ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Accessibility */}
        <div className="p-5 bg-slate-900/80 border border-slate-800/80 rounded-3xl space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Accessibility
          </h3>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-800 text-slate-300">
                <Eye size={18} />
              </div>
              <div>
                <div className="text-sm font-bold text-white">Color-Blind Symbols</div>
                <div className="text-xs text-slate-400">Display distinct symbols (●, ▲, ■, ★) on dots</div>
              </div>
            </div>
            <button
              onClick={() => toggle('colorAccessibilityMode')}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                settings.colorAccessibilityMode ? 'bg-cyan-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  settings.colorAccessibilityMode ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-800 text-slate-300">
                <Grid size={18} />
              </div>
              <div>
                <div className="text-sm font-bold text-white">High-Definition Grid</div>
                <div className="text-xs text-slate-400">Crisp vector lines & node pips for tablets</div>
              </div>
            </div>
            <button
              onClick={() => toggle('highContrastGrid')}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                (settings.highContrastGrid ?? true) ? 'bg-cyan-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  (settings.highContrastGrid ?? true) ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Display HUD */}
        <div className="p-5 bg-slate-900/80 border border-slate-800/80 rounded-3xl space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            In-Game HUD
          </h3>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-800 text-slate-300">
                <Clock size={18} />
              </div>
              <div>
                <div className="text-sm font-bold text-white">Show Elapsed Timer</div>
                <div className="text-xs text-slate-400">Track solving time in header</div>
              </div>
            </div>
            <button
              onClick={() => toggle('showTimer')}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                settings.showTimer ? 'bg-cyan-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  settings.showTimer ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-800 text-slate-300">
                <Hash size={18} />
              </div>
              <div>
                <div className="text-sm font-bold text-white">Show Move Counter</div>
                <div className="text-xs text-slate-400">Count pipe drawing steps</div>
              </div>
            </div>
            <button
              onClick={() => toggle('showMoves')}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                settings.showMoves ? 'bg-cyan-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  settings.showMoves ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="p-4 bg-slate-900/50 border border-slate-800/60 rounded-2xl flex items-start gap-3">
          <Shield size={18} className="text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-400 leading-relaxed">
            <strong>Offline Privacy:</strong> All gameplay progress, daily streaks, and custom statistics are saved exclusively on your local device. No tracking or external data transmission.
          </p>
        </div>

        {/* Reset Progress */}
        <div className="p-5 bg-rose-500/10 border border-rose-500/20 rounded-3xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-rose-300">Reset Progress</div>
              <div className="text-xs text-rose-400/80">Clear all saved campaign & daily streaks</div>
            </div>
            {confirmReset ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setConfirmReset(false)}
                  className="px-2.5 py-1.5 text-xs text-slate-300 bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onResetAllData();
                    setConfirmReset(false);
                  }}
                  className="px-2.5 py-1.5 text-xs font-bold text-white bg-rose-600 rounded-lg"
                >
                  Confirm
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmReset(true)}
                className="p-2 text-rose-400 hover:text-white bg-rose-500/20 hover:bg-rose-500/30 rounded-xl transition"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
