import { Point, EndpointPair, Path, PuzzleDef } from '../types/puzzle';

export function pointsEqual(p1: Point, p2: Point): boolean {
  return p1.x === p2.x && p1.y === p2.y;
}

export function isOrthogonalNeighbor(p1: Point, p2: Point): boolean {
  const dx = Math.abs(p1.x - p2.x);
  const dy = Math.abs(p1.y - p2.y);
  return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
}

export function isWithinBounds(p: Point, width: number, height: number): boolean {
  return p.x >= 0 && p.x < width && p.y >= 0 && p.y < height;
}

/**
 * Checks if a proposed step to `target` is valid for `activeColorId`
 */
export function canStepTo(
  target: Point,
  activeColorId: number,
  puzzle: PuzzleDef,
  paths: Path[]
): { valid: boolean; reason?: 'bounds' | 'wrong_endpoint' | 'blocked' } {
  if (!isWithinBounds(target, puzzle.width, puzzle.height)) {
    return { valid: false, reason: 'bounds' };
  }

  // Cannot step onto an endpoint belonging to a DIFFERENT color
  for (const ep of puzzle.endpoints) {
    if (ep.colorId !== activeColorId) {
      if (pointsEqual(target, ep.start) || pointsEqual(target, ep.end)) {
        return { valid: false, reason: 'wrong_endpoint' };
      }
    }
  }

  return { valid: true };
}

/**
 * Validates whether the board has reached 100% completion:
 * 1. Every endpoint pair has a valid continuous connecting path
 * 2. Every playable cell on the grid is occupied by exactly one path
 */
export function checkFullBoardCompletion(puzzle: PuzzleDef, paths: Path[]): {
  isComplete: boolean;
  connectedPairsCount: number;
  totalPairsCount: number;
  occupiedCellsCount: number;
  totalCellsCount: number;
  connectedColorIds: Set<number>;
} {
  const totalCellsCount = puzzle.width * puzzle.height;
  const totalPairsCount = puzzle.endpoints.length;
  const connectedColorIds = new Set<number>();
  const occupiedSet = new Set<string>();

  for (const ep of puzzle.endpoints) {
    const p = paths.find(item => item.colorId === ep.colorId);
    if (!p || p.cells.length < 2) continue;

    const first = p.cells[0];
    const last = p.cells[p.cells.length - 1];

    const connects = (pointsEqual(first, ep.start) && pointsEqual(last, ep.end)) ||
                     (pointsEqual(first, ep.end) && pointsEqual(last, ep.start));

    if (connects) {
      connectedColorIds.add(ep.colorId);
    }
  }

  // Count occupied cells
  for (const p of paths) {
    for (const cell of p.cells) {
      occupiedSet.add(`${cell.x},${cell.y}`);
    }
  }

  const connectedPairsCount = connectedColorIds.size;
  const occupiedCellsCount = occupiedSet.size;

  const isComplete = (connectedPairsCount === totalPairsCount) && (occupiedCellsCount === totalCellsCount);

  return {
    isComplete,
    connectedPairsCount,
    totalPairsCount,
    occupiedCellsCount,
    totalCellsCount,
    connectedColorIds,
  };
}

/**
 * Fast constraint solver to find or verify full coverage solution
 */
export class PuzzleSolver {
  private width: number;
  private height: number;
  private endpoints: EndpointPair[];
  private grid: (number | null)[][];
  private foundSolutions: Path[][] = [];

  constructor(puzzle: PuzzleDef) {
    this.width = puzzle.width;
    this.height = puzzle.height;
    this.endpoints = puzzle.endpoints;
    this.grid = Array.from({ length: this.height }, () => Array(this.width).fill(null));

    for (const ep of this.endpoints) {
      this.grid[ep.start.y][ep.start.x] = ep.colorId;
      this.grid[ep.end.y][ep.end.x] = ep.colorId;
    }
  }

  public solve(maxSolutions: number = 1): Path[] | null {
    this.foundSolutions = [];
    const currentPaths: Path[] = this.endpoints.map(ep => ({
      colorId: ep.colorId,
      cells: [ep.start],
    }));

    this.backtrack(0, currentPaths, maxSolutions);
    return this.foundSolutions.length > 0 ? this.foundSolutions[0] : null;
  }

  private backtrack(pairIndex: number, currentPaths: Path[], maxSolutions: number): void {
    if (this.foundSolutions.length >= maxSolutions) return;

    if (pairIndex >= this.endpoints.length) {
      // Check if all cells filled
      let filled = 0;
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          if (this.grid[y][x] !== null) filled++;
        }
      }
      if (filled === this.width * this.height) {
        this.foundSolutions.push(JSON.parse(JSON.stringify(currentPaths)));
      }
      return;
    }

    const ep = this.endpoints[pairIndex];
    const path = currentPaths[pairIndex];
    const head = path.cells[path.cells.length - 1];

    if (pointsEqual(head, ep.end)) {
      this.backtrack(pairIndex + 1, currentPaths, maxSolutions);
      return;
    }

    const neighbors = [
      { x: head.x + 1, y: head.y },
      { x: head.x - 1, y: head.y },
      { x: head.x, y: head.y + 1 },
      { x: head.x, y: head.y - 1 },
    ];

    for (const n of neighbors) {
      if (!isWithinBounds(n, this.width, this.height)) continue;

      if (pointsEqual(n, ep.end)) {
        path.cells.push(n);
        this.backtrack(pairIndex + 1, currentPaths, maxSolutions);
        path.cells.pop();
        continue;
      }

      if (this.grid[n.y][n.x] === null) {
        this.grid[n.y][n.x] = ep.colorId;
        path.cells.push(n);

        this.backtrack(pairIndex, currentPaths, maxSolutions);

        path.cells.pop();
        this.grid[n.y][n.x] = null;
      }
    }
  }
}
