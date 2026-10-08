import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Calendar,
  Shuffle,
  Coffee,
  Archive,
  BarChart2,
  Award,
  Settings as SettingsIcon,
  HelpCircle,
  Flame,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import {
  Difficulty,
  Path,
  PlayerStatistics,
  Point,
  PuzzleDef,
  PuzzleProgress,
  Settings,
} from './types/puzzle';
import { storage, INITIAL_ACHIEVEMENTS } from './services/storage';
import { sound } from './services/audio';
import { checkFullBoardCompletion } from './services/solver';
import { getCampaignLevel, getDailyPuzzle, getPracticePuzzle } from './services/generator';

import { GameBoard } from './components/GameBoard';
import { HeaderBar } from './components/HeaderBar';
import { CompletionModal } from './components/CompletionModal';
import { HintModal } from './components/HintModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { CampaignView } from './components/CampaignView';
import { DailyView } from './components/DailyView';
import { RandomView } from './components/RandomView';
import { StatsView } from './components/StatsView';
import { AchievementsView } from './components/AchievementsView';
import { SettingsView } from './components/SettingsView';

type ViewMode =
  | 'menu'
  | 'game'
  | 'campaign'
  | 'daily'
  | 'random'
  | 'practice'
  | 'stats'
  | 'achievements'
  | 'settings';

export default function App() {
  const [view, setView] = useState<ViewMode>('menu');
  const [settings, setSettings] = useState<Settings>(() => storage.getSettings());
  const [stats, setStats] = useState<PlayerStatistics>(() => storage.getStats());
  const [achievements, setAchievements] = useState(() => storage.getAchievements());
  const [completedCampaignLevelIds, setCompletedCampaignLevelIds] = useState<Set<string>>(
    () => storage.getCompletedCampaignLevelIds()
  );
  const [dailySolvedMap, setDailySolvedMap] = useState<Record<string, boolean>>(
    () => storage.getDailySolvedMap()
  );

  // Active game session state
  const [currentPuzzle, setCurrentPuzzle] = useState<PuzzleDef | null>(null);
  const [currentPaths, setCurrentPaths] = useState<Path[]>([]);
  const [undoStack, setUndoStack] = useState<Path[][]>([]);
  const [redoStack, setRedoStack] = useState<Path[][]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [moveCount, setMoveCount] = useState<number>(0);
  const [hintsUsed, setHintsUsed] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Hint modals & indicators
  const [showHintModal, setShowHintModal] = useState<boolean>(false);
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);
  const [highlightedColorId, setHighlightedColorId] = useState<number | null>(null);
  const [suggestedCell, setSuggestedCell] = useState<Point | null>(null);

  // Timer reference
  const timerRef = useRef<number | null>(null);

  // Sync audio with settings on boot
  useEffect(() => {
    sound.setSoundEnabled(settings.soundEnabled);
    sound.setHapticsEnabled(settings.vibrationEnabled);
  }, [settings]);

  // Game timer
  useEffect(() => {
    if (view === 'game' && !isCompleted) {
      timerRef.current = window.setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [view, isCompleted]);

  // Load and start a puzzle
  const loadPuzzle = useCallback((puzzle: PuzzleDef) => {
    setCurrentPuzzle(puzzle);
    setIsCompleted(false);
    setHighlightedColorId(null);
    setSuggestedCell(null);
    setShowHintModal(false);

    // Retrieve any saved progress
    const saved = storage.getProgress(puzzle.id);
    if (saved && !saved.isCompleted) {
      setCurrentPaths(saved.paths);
      setUndoStack(saved.history || []);
      setRedoStack(saved.future || []);
      setElapsedSeconds(saved.elapsedTime || 0);
      setMoveCount(saved.moveCount || 0);
      setHintsUsed(saved.hintsUsed || 0);
    } else {
      setCurrentPaths([]);
      setUndoStack([]);
      setRedoStack([]);
      setElapsedSeconds(0);
      setMoveCount(0);
      setHintsUsed(0);

      // Record attempt
      setStats(prev => {
        const updated = { ...prev, puzzlesAttempted: prev.puzzlesAttempted + 1 };
        storage.saveStats(updated);
        return updated;
      });
    }

    setView('game');
  }, []);

  // Update paths from GameBoard interaction
  const handlePathsChange = useCallback(
    (newPaths: Path[], moveIncrement: boolean = false) => {
      if (!currentPuzzle || isCompleted) return;

      // Push previous state to undo stack
      setUndoStack(prev => [...prev.slice(-30), currentPaths]);
      setRedoStack([]); // Clear redo
      setCurrentPaths(newPaths);

      if (moveIncrement) {
        setMoveCount(prev => prev + 1);
      }

      // Check board completion
      const result = checkFullBoardCompletion(currentPuzzle, newPaths);
      if (result.isComplete && !isCompleted) {
        handlePuzzleSolved();
      }

      // Persist in-progress state
      storage.saveProgress({
        puzzleId: currentPuzzle.id,
        paths: newPaths,
        history: undoStack,
        future: [],
        isCompleted: result.isComplete,
        elapsedTime: elapsedSeconds,
        moveCount: moveCount + (moveIncrement ? 1 : 0),
        hintsUsed,
        completedPairs: result.connectedPairsCount,
        occupiedCellCount: result.occupiedCellsCount,
        stars: 3,
        startedAt: Date.now(),
        lastPlayedAt: Date.now(),
      });
    },
    [currentPuzzle, isCompleted, currentPaths, undoStack, elapsedSeconds, moveCount, hintsUsed]
  );

  // Victory celebration & analytics updates
  const handlePuzzleSolved = () => {
    if (!currentPuzzle) return;
    setIsCompleted(true);
    sound.playComplete();

    // Mark completed in storage
    if (currentPuzzle.chapterId && currentPuzzle.levelNumber) {
      storage.markCampaignLevelCompleted(currentPuzzle.id);
      setCompletedCampaignLevelIds(prev => new Set(prev).add(currentPuzzle.id));
    }
    if (currentPuzzle.isDailyPuzzle && currentPuzzle.dateKey) {
      storage.markDailySolved(currentPuzzle.dateKey);
      setDailySolvedMap(prev => ({ ...prev, [currentPuzzle.dateKey!]: true }));
    }

    // Update player statistics
    setStats(prev => {
      const todayStr = new Date().toISOString().split('T')[0];
      let newStreak = prev.currentStreak;
      if (currentPuzzle.isDailyPuzzle && currentPuzzle.dateKey === todayStr) {
        newStreak = prev.currentStreak + 1;
      }

      const diffKey = currentPuzzle.difficulty;
      const updated: PlayerStatistics = {
        ...prev,
        puzzlesCompleted: prev.puzzlesCompleted + 1,
        dailyPuzzlesCompleted: currentPuzzle.isDailyPuzzle
          ? prev.dailyPuzzlesCompleted + 1
          : prev.dailyPuzzlesCompleted,
        currentStreak: newStreak,
        bestStreak: Math.max(prev.bestStreak, newStreak),
        totalPlayingTime: prev.totalPlayingTime + elapsedSeconds,
        totalHintsUsed: prev.totalHintsUsed + hintsUsed,
        completedByDifficulty: {
          ...prev.completedByDifficulty,
          [diffKey]: (prev.completedByDifficulty[diffKey] || 0) + 1,
        },
        noHintCompletedCount:
          hintsUsed === 0 ? prev.noHintCompletedCount + 1 : prev.noHintCompletedCount,
      };
      storage.saveStats(updated);
      return updated;
    });

    // Check & unlock achievements
    setAchievements(prev => {
      const updated = prev.map(a => {
        let currentVal = a.progressValue;
        if (a.id === 'first_connect') currentVal = 1;
        if (a.id === 'ten_solved') currentVal = Math.min(10, stats.puzzlesCompleted + 1);
        if (a.id === 'fifty_solved') currentVal = Math.min(50, stats.puzzlesCompleted + 1);
        if (a.id === 'hundred_solved') currentVal = Math.min(100, stats.puzzlesCompleted + 1);
        if (a.id === 'streak_7') currentVal = Math.min(7, stats.currentStreak + 1);
        if (a.id === 'streak_30') currentVal = Math.min(30, stats.currentStreak + 1);
        if (a.id === 'expert_solver' && currentPuzzle.difficulty === 'expert') currentVal = 1;
        if (a.id === 'no_hint_master' && hintsUsed === 0) currentVal = Math.min(25, stats.noHintCompletedCount + 1);
        if (a.id === 'all_filled' && currentPuzzle.width >= 7) currentVal = 1;

        const isNowUnlocked = currentVal >= a.targetValue;
        return {
          ...a,
          progressValue: currentVal,
          isUnlocked: a.isUnlocked || isNowUnlocked,
          unlockedAt: a.isUnlocked ? a.unlockedAt : isNowUnlocked ? Date.now() : undefined,
        };
      });
      storage.saveAchievements(updated);
      return updated;
    });
  };

  // Undo move
  const handleUndo = () => {
    if (undoStack.length === 0) return;
    sound.playBacktrack();
    const previous = undoStack[undoStack.length - 1];
    setRedoStack(prev => [...prev, currentPaths]);
    setUndoStack(prev => prev.slice(0, -1));
    setCurrentPaths(previous);
  };

  // Redo move
  const handleRedo = () => {
    if (redoStack.length === 0) return;
    sound.playStep();
    const next = redoStack[redoStack.length - 1];
    setUndoStack(prev => [...prev, currentPaths]);
    setRedoStack(prev => prev.slice(0, -1));
    setCurrentPaths(next);
  };

  // Reset all paths
  const handleReset = () => {
    if (currentPaths.length === 0) return;
    sound.playBacktrack();
    setUndoStack(prev => [...prev, currentPaths]);
    setRedoStack([]);
    setCurrentPaths([]);
  };

  // Next level in campaign
  const handleNextLevel = () => {
    if (!currentPuzzle || !currentPuzzle.chapterId || !currentPuzzle.levelNumber) return;
    const chapterNum = parseInt(currentPuzzle.chapterId.replace('ch', ''), 10) || 1;
    const nextLvl = currentPuzzle.levelNumber + 1;
    if (nextLvl <= 50) {
      loadPuzzle(getCampaignLevel(chapterNum, nextLvl));
    } else {
      // Go to next chapter
      if (chapterNum < 10) {
        loadPuzzle(getCampaignLevel(chapterNum + 1, 1));
      } else {
        setView('campaign');
      }
    }
  };

  // Back to Main Menu handler (cleans up modal and game state)
  const handleBackToMenu = useCallback(() => {
    sound.playClick();
    setIsCompleted(false);
    setShowHintModal(false);
    setShowHowToPlay(false);
    setHighlightedColorId(null);
    setSuggestedCell(null);
    setCurrentPuzzle(null);
    setCurrentPaths([]);
    setUndoStack([]);
    setRedoStack([]);
    setView('menu');
  }, []);

  // Compute live board completion status
  const boardStatus = currentPuzzle
    ? checkFullBoardCompletion(currentPuzzle, currentPaths)
    : { connectedPairsCount: 0, totalPairsCount: 0, occupiedCellsCount: 0, totalCellsCount: 0 };

  const todayStr = new Date().toISOString().split('T')[0];
  const lastPlayedId = storage.getLastPlayedPuzzleId();

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans select-none overflow-x-hidden">
      {/* View routing */}
      {view === 'menu' && (
        <div className="w-full max-w-md mx-auto px-4 py-6 flex flex-col justify-between min-h-screen animate-in fade-in duration-300">
          {/* Top Brand Header */}
          <div className="flex flex-col items-center text-center mt-2">
            {/* Visual Dot Logo */}
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 rounded-full bg-cyan-400 shadow-[0_0_12px_#06b6d4]" />
              <div className="w-12 h-1.5 bg-gradient-to-r from-cyan-400 via-emerald-400 to-amber-400 rounded-full" />
              <div className="w-4 h-4 rounded-full bg-amber-400 shadow-[0_0_12px_#f59e0b]" />
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-md">
              DOT CONNECT
            </h1>
            <p className="text-xs text-slate-400 font-medium tracking-wide mt-1">
              Connect every dot. Fill every cell.
            </p>
          </div>

          {/* Quick Continue Card (if active session) */}
          {lastPlayedId && (
            <div
              onClick={() => {
                const p = storage.getProgress(lastPlayedId);
                if (p) {
                  // If it was campaign or daily, recreate the puzzle
                  if (lastPlayedId.startsWith('ch')) {
                    const parts = lastPlayedId.split('_lvl_');
                    const chNum = parseInt(parts[0].replace('ch', ''), 10) || 1;
                    const lvlNum = parseInt(parts[1], 10) || 1;
                    loadPuzzle(getCampaignLevel(chNum, lvlNum));
                  } else if (lastPlayedId.startsWith('daily_')) {
                    loadPuzzle(getDailyPuzzle(todayStr));
                  } else {
                    loadPuzzle(getPracticePuzzle(5));
                  }
                }
              }}
              className="mt-4 p-4 bg-gradient-to-r from-cyan-500/15 to-blue-500/15 border border-cyan-500/40 rounded-3xl cursor-pointer hover:border-cyan-400 transition active:scale-98 flex items-center justify-between shadow-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500 text-slate-950 flex items-center justify-center font-bold shadow-md">
                  <Play size={18} fill="currentColor" />
                </div>
                <div>
                  <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                    Resume Game
                  </div>
                  <div className="text-sm font-extrabold text-white">Continue Last Puzzle</div>
                </div>
              </div>
              <ArrowRight size={18} className="text-cyan-400" />
            </div>
          )}

          {/* Primary Modes Grid */}
          <div className="space-y-2.5 my-5">
            {/* 1. Puzzle Campaign */}
            <button
              onClick={() => {
                sound.playClick();
                setView('campaign');
              }}
              className="w-full p-4 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 rounded-3xl transition active:scale-98 flex items-center justify-between text-left shadow-lg group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                  <Play size={22} fill="currentColor" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Puzzle Campaign</div>
                  <div className="text-xs text-slate-400">10 Chapters • 500 Progressive Levels</div>
                </div>
              </div>
              <div className="text-xs font-bold text-cyan-400 font-mono px-2 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                {completedCampaignLevelIds.size}/500
              </div>
            </button>

            {/* 2. Daily Challenge */}
            <button
              onClick={() => {
                sound.playClick();
                setView('daily');
              }}
              className="w-full p-4 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 rounded-3xl transition active:scale-98 flex items-center justify-between text-left shadow-lg group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                  <Calendar size={22} />
                </div>
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span>Daily Challenge</span>
                    {dailySolvedMap[todayStr] && (
                      <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/30">
                        Solved ⭐
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400">Shared daily puzzle + Streak tracking</div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-amber-400 font-mono px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <Flame size={13} />
                <span>{stats.currentStreak}</span>
              </div>
            </button>

            {/* 3. Random Puzzle */}
            <button
              onClick={() => {
                sound.playClick();
                setView('random');
              }}
              className="w-full p-4 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 rounded-3xl transition active:scale-98 flex items-center justify-between text-left shadow-lg group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                  <Shuffle size={22} />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Random Puzzle</div>
                  <div className="text-xs text-slate-400">Custom grid sizes 4×4 up to 9×9</div>
                </div>
              </div>
              <ArrowRight size={18} className="text-slate-600" />
            </button>

            {/* 4. Practice Mode */}
            <button
              onClick={() => {
                sound.playClick();
                loadPuzzle(getPracticePuzzle(5));
              }}
              className="w-full p-4 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 rounded-3xl transition active:scale-98 flex items-center justify-between text-left shadow-lg group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                  <Coffee size={22} />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Practice Mode</div>
                  <div className="text-xs text-slate-400">Relaxed logic with unlimited assistance</div>
                </div>
              </div>
              <ArrowRight size={18} className="text-slate-600" />
            </button>
          </div>

          {/* Secondary Hub Grid: Stats, Achievements, Settings, How to Play */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            <button
              onClick={() => {
                sound.playClick();
                setView('stats');
              }}
              className="p-3 bg-slate-900/80 hover:bg-slate-800 border border-slate-800/80 rounded-2xl flex flex-col items-center justify-center gap-1 text-slate-300 transition active:scale-95 shadow-md"
            >
              <BarChart2 size={18} className="text-cyan-400" />
              <span className="text-[10px] font-bold">Stats</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setView('achievements');
              }}
              className="p-3 bg-slate-900/80 hover:bg-slate-800 border border-slate-800/80 rounded-2xl flex flex-col items-center justify-center gap-1 text-slate-300 transition active:scale-95 shadow-md"
            >
              <Award size={18} className="text-amber-400" />
              <span className="text-[10px] font-bold">Badges</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setView('settings');
              }}
              className="p-3 bg-slate-900/80 hover:bg-slate-800 border border-slate-800/80 rounded-2xl flex flex-col items-center justify-center gap-1 text-slate-300 transition active:scale-95 shadow-md"
            >
              <SettingsIcon size={18} className="text-slate-400" />
              <span className="text-[10px] font-bold">Settings</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setShowHowToPlay(true);
              }}
              className="p-3 bg-slate-900/80 hover:bg-slate-800 border border-slate-800/80 rounded-2xl flex flex-col items-center justify-center gap-1 text-slate-300 transition active:scale-95 shadow-md"
            >
              <HelpCircle size={18} className="text-emerald-400" />
              <span className="text-[10px] font-bold">Rules</span>
            </button>
          </div>

          {/* Offline & Standalone badge */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-medium py-1">
            <ShieldCheck size={14} className="text-emerald-500/80" />
            <span>100% Offline Capable • Native Touch Engine</span>
          </div>
        </div>
      )}

      {/* Campaign View */}
      {view === 'campaign' && (
        <CampaignView
          completedLevelIds={completedCampaignLevelIds}
          onSelectLevel={loadPuzzle}
          onBack={() => setView('menu')}
        />
      )}

      {/* Daily Challenge View */}
      {view === 'daily' && (
        <DailyView
          currentStreak={stats.currentStreak}
          bestStreak={stats.bestStreak}
          dailySolvedMap={dailySolvedMap}
          onSelectDaily={loadPuzzle}
          onBack={() => setView('menu')}
        />
      )}

      {/* Random Puzzle View */}
      {view === 'random' && (
        <RandomView onStartPuzzle={loadPuzzle} onBack={() => setView('menu')} />
      )}

      {/* Statistics View */}
      {view === 'stats' && <StatsView stats={stats} onBack={() => setView('menu')} />}

      {/* Achievements View */}
      {view === 'achievements' && (
        <AchievementsView achievements={achievements} onBack={() => setView('menu')} />
      )}

      {/* Settings View */}
      {view === 'settings' && (
        <SettingsView
          settings={settings}
          onUpdateSettings={s => {
            setSettings(s);
            storage.saveSettings(s);
          }}
          onResetAllData={() => {
            storage.resetAllProgress();
            setStats(storage.getStats());
            setAchievements(storage.getAchievements());
            setCompletedCampaignLevelIds(new Set());
            setDailySolvedMap({});
          }}
          onBack={() => setView('menu')}
        />
      )}

      {/* Active Puzzle Gameplay View */}
      {view === 'game' && currentPuzzle && (
        <div className="w-full flex-1 flex flex-col justify-between py-2 sm:py-4 animate-in fade-in duration-200">
          {/* Header Bar */}
          <HeaderBar
            puzzle={currentPuzzle}
            connectedPairs={boardStatus.connectedPairsCount}
            totalPairs={boardStatus.totalPairsCount}
            occupiedCells={boardStatus.occupiedCellsCount}
            totalCells={boardStatus.totalCellsCount}
            moves={moveCount}
            elapsedSeconds={elapsedSeconds}
            showTimer={settings.showTimer}
            showMoves={settings.showMoves}
            canUndo={undoStack.length > 0}
            canRedo={redoStack.length > 0}
            onBack={handleBackToMenu}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onReset={handleReset}
            onHint={() => setShowHintModal(true)}
          />

          {/* Interactive Game Board */}
          <div className="flex-1 flex items-center justify-center px-4 my-2">
            <GameBoard
              puzzle={currentPuzzle}
              paths={currentPaths}
              onPathsChange={handlePathsChange}
              colorAccessibilityMode={settings.colorAccessibilityMode}
              highlightedColorId={highlightedColorId}
              suggestedCell={suggestedCell}
            />
          </div>

          {/* Bottom helper tip */}
          <div className="w-full max-w-[420px] mx-auto text-center px-4 py-1 text-[11px] text-slate-500 font-medium">
            {boardStatus.connectedPairsCount === boardStatus.totalPairsCount &&
            boardStatus.occupiedCellsCount < boardStatus.totalCellsCount ? (
              <span className="text-amber-400 animate-pulse font-semibold">
                ⚠️ All pairs connected! Now fill remaining {boardStatus.totalCellsCount - boardStatus.occupiedCellsCount} cells to complete!
              </span>
            ) : (
              <span>Touch and drag endpoints to connect matching colors</span>
            )}
          </div>
        </div>
      )}

      {/* Progressive Hint Modal - only in active game session */}
      {view === 'game' && showHintModal && currentPuzzle && (
        <HintModal
          puzzle={currentPuzzle}
          paths={currentPaths}
          onApplyPathHint={colorId => {
            setHintsUsed(h => h + 1);
            setHighlightedColorId(colorId);
            setTimeout(() => setHighlightedColorId(null), 4000);
          }}
          onApplyDirectionalHint={cell => {
            setHintsUsed(h => h + 1);
            setSuggestedCell(cell);
            setTimeout(() => setSuggestedCell(null), 4000);
          }}
          onRevealColorSolution={revealedPath => {
            setHintsUsed(h => h + 1);
            const otherPaths = currentPaths.filter(p => p.colorId !== revealedPath.colorId);
            handlePathsChange([...otherPaths, revealedPath], true);
          }}
          onClose={() => setShowHintModal(false)}
        />
      )}

      {/* Completion Modal - only in active game session */}
      {view === 'game' && isCompleted && currentPuzzle && (
        <CompletionModal
          puzzle={currentPuzzle}
          elapsedSeconds={elapsedSeconds}
          moves={moveCount}
          hintsUsed={hintsUsed}
          hasNextLevel={
            currentPuzzle.mode === 'campaign' &&
            !!currentPuzzle.chapterId &&
            !!currentPuzzle.levelNumber
          }
          onNextLevel={handleNextLevel}
          onReplay={() => {
            setIsCompleted(false);
            setCurrentPaths([]);
            setUndoStack([]);
            setRedoStack([]);
            setElapsedSeconds(0);
            setMoveCount(0);
            setHintsUsed(0);
          }}
          onHome={handleBackToMenu}
        />
      )}

      {/* How to Play Rules Modal */}
      {showHowToPlay && <HowToPlayModal onClose={() => setShowHowToPlay(false)} />}
    </div>
  );
}
