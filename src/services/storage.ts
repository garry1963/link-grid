import { PuzzleProgress, PlayerStatistics, Settings, Achievement } from '../types/puzzle';

const STORAGE_PREFIX = 'dot_connect_v1_';

const DEFAULT_SETTINGS: Settings = {
  theme: 'dark',
  soundEnabled: true,
  vibrationEnabled: true,
  animationsEnabled: true,
  colorAccessibilityMode: false,
  showTimer: true,
  showMoves: true,
  volume: 0.7,
  highContrastGrid: true,
};

const DEFAULT_STATS: PlayerStatistics = {
  puzzlesAttempted: 0,
  puzzlesCompleted: 0,
  dailyPuzzlesCompleted: 0,
  currentStreak: 0,
  bestStreak: 0,
  totalPlayingTime: 0,
  totalHintsUsed: 0,
  completedByDifficulty: {
    beginner: 0,
    easy: 0,
    medium: 0,
    hard: 0,
    expert: 0,
  },
  noHintCompletedCount: 0,
};

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_connect', title: 'First Connection', description: 'Complete your very first puzzle', iconName: 'Zap', isUnlocked: false, progressValue: 0, targetValue: 1 },
  { id: 'ten_solved', title: 'Getting in the Flow', description: 'Solve 10 puzzles across any mode', iconName: 'Target', isUnlocked: false, progressValue: 0, targetValue: 10 },
  { id: 'fifty_solved', title: 'Grid Master', description: 'Solve 50 puzzles across any mode', iconName: 'Award', isUnlocked: false, progressValue: 0, targetValue: 50 },
  { id: 'hundred_solved', title: 'Centurion Solver', description: 'Solve 100 puzzles across any mode', iconName: 'Trophy', isUnlocked: false, progressValue: 0, targetValue: 100 },
  { id: 'streak_7', title: 'Week of Dedication', description: 'Maintain a 7-day daily puzzle streak', iconName: 'Flame', isUnlocked: false, progressValue: 0, targetValue: 7 },
  { id: 'streak_30', title: 'Monthly Habit', description: 'Maintain a 30-day daily puzzle streak', iconName: 'Calendar', isUnlocked: false, progressValue: 0, targetValue: 30 },
  { id: 'expert_solver', title: 'Expert Logic', description: 'Solve an Expert 8x8 or 9x9 difficulty puzzle', iconName: 'Compass', isUnlocked: false, progressValue: 0, targetValue: 1 },
  { id: 'no_hint_master', title: 'Pure Intuition', description: 'Complete 25 puzzles without using any hints', iconName: 'ShieldCheck', isUnlocked: false, progressValue: 0, targetValue: 25 },
  { id: 'chapter_1', title: 'First Milestone', description: 'Complete all levels in Chapter 1: First Connections', iconName: 'CheckCircle', isUnlocked: false, progressValue: 0, targetValue: 50 },
  { id: 'all_filled', title: 'Pixel Perfect', description: 'Fill every cell on a 7x7 or larger grid with zero mistakes', iconName: 'Sparkles', isUnlocked: false, progressValue: 0, targetValue: 1 },
];

class StorageService {
  private memoryCache: Map<string, string> = new Map();

  private getItem(key: string): string | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(STORAGE_PREFIX + key);
      }
    } catch {
      // In restricted iframe
    }
    return this.memoryCache.get(key) || null;
  }

  private setItem(key: string, value: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_PREFIX + key, value);
      }
    } catch {
      // In restricted iframe
    }
    this.memoryCache.set(key, value);
  }

  public getSettings(): Settings {
    const raw = this.getItem('settings');
    if (!raw) return DEFAULT_SETTINGS;
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  public saveSettings(settings: Settings): void {
    this.setItem('settings', JSON.stringify(settings));
  }

  public getStats(): PlayerStatistics {
    const raw = this.getItem('stats');
    if (!raw) return DEFAULT_STATS;
    try {
      const parsed = JSON.parse(raw);
      // Auto-heal over-inflated streak from the previous event multiplier bug:
      if (parsed.dailyPuzzlesCompleted <= 1 && parsed.currentStreak > Math.max(1, parsed.dailyPuzzlesCompleted)) {
        parsed.currentStreak = Math.max(0, parsed.dailyPuzzlesCompleted);
        parsed.bestStreak = Math.min(parsed.bestStreak, Math.max(1, parsed.dailyPuzzlesCompleted));
      }
      return { ...DEFAULT_STATS, ...parsed };
    } catch {
      return DEFAULT_STATS;
    }
  }

  public saveStats(stats: PlayerStatistics): void {
    this.setItem('stats', JSON.stringify(stats));
  }

  public getProgress(puzzleId: string): PuzzleProgress | null {
    const raw = this.getItem(`progress_${puzzleId}`);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  public saveProgress(progress: PuzzleProgress): void {
    this.setItem(`progress_${progress.puzzleId}`, JSON.stringify(progress));
    this.setItem('last_played_id', progress.puzzleId);
  }

  public getLastPlayedPuzzleId(): string | null {
    return this.getItem('last_played_id');
  }

  public getAchievements(): Achievement[] {
    const raw = this.getItem('achievements');
    if (!raw) return INITIAL_ACHIEVEMENTS;
    try {
      const stored: Achievement[] = JSON.parse(raw);
      return INITIAL_ACHIEVEMENTS.map(initial => {
        const found = stored.find(s => s.id === initial.id);
        return found ? { ...initial, ...found } : initial;
      });
    } catch {
      return INITIAL_ACHIEVEMENTS;
    }
  }

  public saveAchievements(achievements: Achievement[]): void {
    this.setItem('achievements', JSON.stringify(achievements));
  }

  public getDailySolvedMap(): Record<string, boolean> {
    const raw = this.getItem('daily_solved');
    if (!raw) return {};
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }

  public markDailySolved(dateKey: string): void {
    const current = this.getDailySolvedMap();
    current[dateKey] = true;
    this.setItem('daily_solved', JSON.stringify(current));
  }

  public getCompletedCampaignLevelIds(): Set<string> {
    const raw = this.getItem('campaign_completed');
    if (!raw) return new Set();
    try {
      const arr = JSON.parse(raw);
      return new Set(Array.isArray(arr) ? arr : []);
    } catch {
      return new Set();
    }
  }

  public markCampaignLevelCompleted(levelId: string): void {
    const set = this.getCompletedCampaignLevelIds();
    set.add(levelId);
    this.setItem('campaign_completed', JSON.stringify(Array.from(set)));
  }

  public resetAllProgress(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const keysToRemove: string[] = [];
        for (let i = 0; i < window.localStorage.length; i++) {
          const k = window.localStorage.key(i);
          if (k && k.startsWith(STORAGE_PREFIX)) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach(k => window.localStorage.removeItem(k));
      }
    } catch {
      // In restricted iframe
    }
    this.memoryCache.clear();
  }
}

export const storage = new StorageService();
