import { Chapter, Difficulty, EndpointPair, Path, Point, PuzzleDef } from '../types/puzzle';

export const CHAPTERS: Chapter[] = [
  { id: 'ch1', number: 1, title: 'First Connections', subtitle: 'Gentle introductions to linear flow logic', difficulty: 'beginner', gridSize: '4×4 & 5×5', levelCount: 50, themeColor: '#06b6d4' },
  { id: 'ch2', number: 2, title: 'Simple Paths', subtitle: 'Smooth paths with gradual cornering', difficulty: 'easy', gridSize: '5×5', levelCount: 50, themeColor: '#10b981' },
  { id: 'ch3', number: 3, title: 'Tight Turns', subtitle: 'Navigate narrow corridors and wall bounds', difficulty: 'easy', gridSize: '5×5 & 6×6', levelCount: 50, themeColor: '#eab308' },
  { id: 'ch4', number: 4, title: 'Crossing Challenges', subtitle: 'Untangling intertwined flow branches', difficulty: 'medium', gridSize: '6×6', levelCount: 50, themeColor: '#f97316' },
  { id: 'ch5', number: 5, title: 'Compact Grids', subtitle: 'Dense spaces with minimal room for detour', difficulty: 'medium', gridSize: '6×6 & 7×7', levelCount: 50, themeColor: '#ef4444' },
  { id: 'ch6', number: 6, title: 'Complex Networks', subtitle: 'Multiple interlocked color channels', difficulty: 'hard', gridSize: '7×7', levelCount: 50, themeColor: '#a855f7' },
  { id: 'ch7', number: 7, title: 'Expert Connections', subtitle: 'Deep foresight and perimeter tracing', difficulty: 'hard', gridSize: '7×7 & 8×8', levelCount: 50, themeColor: '#ec4899' },
  { id: 'ch8', number: 8, title: 'Master Puzzles', subtitle: 'Large scale grids with deceptive initial moves', difficulty: 'expert', gridSize: '8×8', levelCount: 50, themeColor: '#6366f1' },
  { id: 'ch9', number: 9, title: 'Extreme Logic', subtitle: 'Vast boards testing comprehensive patience', difficulty: 'expert', gridSize: '8×8 & 9×9', levelCount: 50, themeColor: '#14b8a6' },
  { id: 'ch10', number: 10, title: 'Daily Masterclass', subtitle: 'The pinnacle of dot connect mastery', difficulty: 'expert', gridSize: '9×9', levelCount: 50, themeColor: '#f59e0b' },
];

/**
 * Deterministic pseudo-random number generator (Mulberry32)
 */
export class PRNG {
  private state: number;

  constructor(seed: number | string) {
    if (typeof seed === 'string') {
      let h = 2166136261 >>> 0;
      for (let i = 0; i < seed.length; i++) {
        h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
      }
      this.state = h >>> 0;
    } else {
      this.state = seed >>> 0;
    }
  }

  public next(): number {
    let t = (this.state += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  public nextInt(min: number, max: number): number {
    return Math.floor(min + this.next() * (max - min + 1));
  }

  public shuffle<T>(array: T[]): T[] {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
}

/**
 * Procedural generation engine that constructs guaranteed 100% solvable puzzles
 * by carving space-filling path partitions across the board.
 */
export function generateValidPuzzle(
  width: number,
  height: number,
  targetPairs: number,
  seed: number | string,
  meta?: { title?: string; chapterId?: string; levelNumber?: number; mode?: PuzzleDef['mode']; difficulty?: Difficulty; dateKey?: string }
): PuzzleDef {
  const rng = new PRNG(seed);
  const totalCells = width * height;
  const numPairs = Math.min(12, Math.max(3, targetPairs));

  // Step 1: Create a continuous Hamiltonian / serpentine order across the grid
  const fullOrder: Point[] = [];
  for (let y = 0; y < height; y++) {
    const rowPoints: Point[] = [];
    for (let x = 0; x < width; x++) {
      rowPoints.push({ x, y });
    }
    // S-curve snake order
    if (y % 2 === 1) {
      rowPoints.reverse();
    }
    fullOrder.push(...rowPoints);
  }

  // Step 2: Randomly perturb/cut the snake order into non-overlapping connected path segments
  // Each segment must have at least 2 cells
  const cutPoints = new Set<number>();
  const candidates: number[] = [];
  for (let i = 2; i <= totalCells - 2; i++) {
    candidates.push(i);
  }
  const shuffledCandidates = rng.shuffle(candidates);

  // We need (numPairs - 1) cuts
  for (const cut of shuffledCandidates) {
    if (cutPoints.size >= numPairs - 1) break;

    // Ensure at least 2 cells distance between any cut
    let tooClose = false;
    for (const existing of cutPoints) {
      if (Math.abs(existing - cut) < 2) {
        tooClose = true;
        break;
      }
    }
    if (!tooClose && cut >= 2 && (totalCells - cut) >= 2) {
      cutPoints.add(cut);
    }
  }

  const sortedCuts = [0, ...Array.from(cutPoints).sort((a, b) => a - b), totalCells];
  const paths: Path[] = [];
  const endpoints: EndpointPair[] = [];

  for (let i = 0; i < sortedCuts.length - 1; i++) {
    const startIdx = sortedCuts[i];
    const endIdx = sortedCuts[i + 1];
    const segCells = fullOrder.slice(startIdx, endIdx);

    if (segCells.length >= 2) {
      const colorId = i % 12;
      paths.push({
        colorId,
        cells: segCells,
      });

      endpoints.push({
        id: `ep_${colorId}`,
        colorId,
        start: segCells[0],
        end: segCells[segCells.length - 1],
      });
    }
  }

  const title = meta?.title || `${width}×${height} Puzzle`;
  const mode = meta?.mode || 'campaign';
  const difficulty = meta?.difficulty || (width <= 5 ? 'beginner' : width <= 6 ? 'easy' : width <= 7 ? 'medium' : width <= 8 ? 'hard' : 'expert');

  return {
    id: meta?.chapterId ? `${meta.chapterId}_lvl_${meta.levelNumber}` : `puzzle_${seed}`,
    title,
    chapterId: meta?.chapterId,
    levelNumber: meta?.levelNumber,
    mode,
    difficulty,
    width,
    height,
    endpoints,
    solution: paths,
    createdAt: Date.now(),
    isDailyPuzzle: mode === 'daily',
    dateKey: meta?.dateKey,
  };
}

/**
 * Generates a campaign level for Chapter 1-10
 */
export function getCampaignLevel(chapterNumber: number, levelNumber: number): PuzzleDef {
  const chapter = CHAPTERS[chapterNumber - 1] || CHAPTERS[0];
  let width = 5;
  let height = 5;
  let pairs = 4;

  switch (chapterNumber) {
    case 1:
      width = levelNumber <= 25 ? 4 : 5;
      height = width;
      pairs = width === 4 ? 3 : 4;
      break;
    case 2:
      width = 5;
      height = 5;
      pairs = levelNumber <= 25 ? 4 : 5;
      break;
    case 3:
      width = levelNumber <= 25 ? 5 : 6;
      height = width;
      pairs = 5;
      break;
    case 4:
      width = 6;
      height = 6;
      pairs = levelNumber <= 25 ? 5 : 6;
      break;
    case 5:
      width = levelNumber <= 25 ? 6 : 7;
      height = width;
      pairs = 6;
      break;
    case 6:
      width = 7;
      height = 7;
      pairs = levelNumber <= 25 ? 6 : 7;
      break;
    case 7:
      width = levelNumber <= 25 ? 7 : 8;
      height = width;
      pairs = 7;
      break;
    case 8:
      width = 8;
      height = 8;
      pairs = levelNumber <= 25 ? 7 : 8;
      break;
    case 9:
      width = levelNumber <= 25 ? 8 : 9;
      height = width;
      pairs = levelNumber <= 25 ? 8 : 9;
      break;
    case 10:
      width = 9;
      height = 9;
      pairs = levelNumber <= 25 ? 9 : 10;
      break;
  }

  const seed = `ch_${chapterNumber}_lvl_${levelNumber}_seed_894`;
  return generateValidPuzzle(width, height, pairs, seed, {
    title: `${chapter.title} #${levelNumber}`,
    chapterId: chapter.id,
    levelNumber,
    mode: 'campaign',
    difficulty: chapter.difficulty,
  });
}

/**
 * Generates deterministic Daily Puzzle for a given date
 */
export function getDailyPuzzle(dateKey: string): PuzzleDef {
  // Format: YYYY-MM-DD
  const [year, month, day] = dateKey.split('-').map(Number);
  const dayOfYear = (month - 1) * 31 + day;

  // Rotate sizes smoothly across weekdays: Mon=5x5, Tue=6x6, Wed=6x6, Thu=7x7, Fri=7x7, Sat=8x8, Sun=8x8
  const d = new Date(year, month - 1, day);
  const dayOfWeek = d.getDay(); // 0 is Sunday
  let size = 6;
  let pairs = 5;
  let diff: Difficulty = 'medium';

  if (dayOfWeek === 1) { // Monday (easy start)
    size = 5;
    pairs = 4;
    diff = 'easy';
  } else if (dayOfWeek === 2 || dayOfWeek === 3) { // Tuesday / Wednesday
    size = 6;
    pairs = 5;
    diff = 'medium';
  } else if (dayOfWeek === 4 || dayOfWeek === 5) { // Thursday / Friday
    size = 7;
    pairs = 6;
    diff = 'hard';
  } else { // Weekend
    size = 8;
    pairs = 7;
    diff = 'expert';
  }

  const seed = `daily_puzzle_${dateKey}_app_id_dotconnect_2026`;
  return generateValidPuzzle(size, size, pairs, seed, {
    title: `Daily Challenge — ${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`,
    mode: 'daily',
    difficulty: diff,
    dateKey,
  });
}

/**
 * Generates a customized random puzzle
 */
export function getRandomPuzzle(gridSize: number, difficulty: Difficulty): PuzzleDef {
  const size = Math.max(4, Math.min(9, gridSize));
  let pairs = 4;
  if (difficulty === 'beginner') pairs = Math.max(3, size - 2);
  else if (difficulty === 'easy') pairs = Math.max(4, size - 1);
  else if (difficulty === 'medium') pairs = size;
  else if (difficulty === 'hard') pairs = size + 1;
  else if (difficulty === 'expert') pairs = Math.min(10, size + 2);

  const seed = `random_${Date.now()}_${Math.random()}`;
  return generateValidPuzzle(size, size, pairs, seed, {
    title: `Random ${size}×${size} (${difficulty.toUpperCase()})`,
    mode: 'random',
    difficulty,
  });
}

/**
 * Generates practice puzzle with relaxed unlimited hints
 */
export function getPracticePuzzle(gridSize: number = 5): PuzzleDef {
  const seed = `practice_${Date.now()}_${Math.random()}`;
  return generateValidPuzzle(gridSize, gridSize, Math.max(3, gridSize - 1), seed, {
    title: `Practice ${gridSize}×${gridSize}`,
    mode: 'practice',
    difficulty: 'easy',
  });
}
