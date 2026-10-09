export interface Point {
  x: number;
  y: number;
}

export type Difficulty = 'beginner' | 'easy' | 'medium' | 'hard' | 'expert';

export type GameMode = 'campaign' | 'daily' | 'random' | 'practice';

export interface ColorScheme {
  id: number;
  name: string;
  hex: string;
  glow: string;
  border: string;
  symbol: string; // Accessibility symbol (e.g., Circle, Triangle, Square, Star, etc.)
  shapeName: string;
}

export const GAME_COLORS: ColorScheme[] = [
  { id: 0, name: 'Cyan Blue', hex: '#06b6d4', glow: 'rgba(6, 182, 212, 0.45)', border: '#0891b2', symbol: '●', shapeName: 'Circle' },
  { id: 1, name: 'Neon Amber', hex: '#f59e0b', glow: 'rgba(245, 158, 11, 0.45)', border: '#d97706', symbol: '▲', shapeName: 'Triangle' },
  { id: 2, name: 'Emerald Green', hex: '#10b981', glow: 'rgba(16, 185, 129, 0.45)', border: '#059669', symbol: '■', shapeName: 'Square' },
  { id: 3, name: 'Electric Purple', hex: '#a855f7', glow: 'rgba(168, 85, 247, 0.45)', border: '#9333ea', symbol: '★', shapeName: 'Star' },
  { id: 4, name: 'Vibrant Rose', hex: '#f43f5e', glow: 'rgba(244, 63, 94, 0.45)', border: '#e11d48', symbol: '◆', shapeName: 'Diamond' },
  { id: 5, name: 'Sunny Yellow', hex: '#eab308', glow: 'rgba(234, 179, 8, 0.45)', border: '#ca8a04', symbol: '✦', shapeName: 'Sparkle' },
  { id: 6, name: 'Sky Blue', hex: '#3b82f6', glow: 'rgba(59, 130, 246, 0.45)', border: '#2563eb', symbol: '✚', shapeName: 'Cross' },
  { id: 7, name: 'Hot Magenta', hex: '#ec4899', glow: 'rgba(236, 72, 153, 0.45)', border: '#db2777', symbol: '♥', shapeName: 'Heart' },
  { id: 8, name: 'Lime Green', hex: '#84cc16', glow: 'rgba(132, 204, 22, 0.45)', border: '#65a30d', symbol: '⬢', shapeName: 'Hexagon' },
  { id: 9, name: 'Bright Orange', hex: '#ff6b35', glow: 'rgba(255, 107, 53, 0.45)', border: '#ea580c', symbol: '✿', shapeName: 'Flower' },
  { id: 10, name: 'Teal Mint', hex: '#14b8a6', glow: 'rgba(20, 184, 166, 0.45)', border: '#0d9488', symbol: '✶', shapeName: 'Burst' },
  { id: 11, name: 'Deep Indigo', hex: '#6366f1', glow: 'rgba(99, 102, 241, 0.45)', border: '#4f46e5', symbol: '❖', shapeName: 'Rhombus' },
];

export interface EndpointPair {
  id: string;
  colorId: number;
  start: Point;
  end: Point;
}

export interface Path {
  colorId: number;
  cells: Point[];
}

export interface PuzzleDef {
  id: string;
  title: string;
  chapterId?: string;
  levelNumber?: number;
  mode: GameMode;
  difficulty: Difficulty;
  width: number;
  height: number;
  endpoints: EndpointPair[];
  solution?: Path[]; // Verified solution path coordinates
  createdAt: number;
  isDailyPuzzle?: boolean;
  dateKey?: string; // YYYY-MM-DD
}

export interface PuzzleProgress {
  puzzleId: string;
  paths: Path[];
  history: Path[][];
  future: Path[][];
  isCompleted: boolean;
  elapsedTime: number; // in seconds
  moveCount: number;
  hintsUsed: number;
  completedPairs: number;
  occupiedCellCount: number;
  stars: number;
  startedAt: number;
  completedAt?: number;
  lastPlayedAt: number;
}

export interface PlayerStatistics {
  puzzlesAttempted: number;
  puzzlesCompleted: number;
  dailyPuzzlesCompleted: number;
  currentStreak: number;
  bestStreak: number;
  lastDailyDate?: string;
  totalPlayingTime: number; // in seconds
  totalHintsUsed: number;
  completedByDifficulty: Record<Difficulty, number>;
  noHintCompletedCount: number;
}

export interface Settings {
  theme: 'dark' | 'light' | 'oled';
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  animationsEnabled: boolean;
  colorAccessibilityMode: boolean;
  showTimer: boolean;
  showMoves: boolean;
  volume: number;
  highContrastGrid?: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: string;
  isUnlocked: boolean;
  unlockedAt?: number;
  progressValue: number;
  targetValue: number;
}

export interface Chapter {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  difficulty: Difficulty;
  gridSize: string;
  levelCount: number;
  themeColor: string;
}
