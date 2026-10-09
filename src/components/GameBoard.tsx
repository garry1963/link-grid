import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ColorScheme, GAME_COLORS, Path, Point, PuzzleDef } from '../types/puzzle';
import { isOrthogonalNeighbor, pointsEqual } from '../services/solver';
import { sound } from '../services/audio';

interface GameBoardProps {
  puzzle: PuzzleDef;
  paths: Path[];
  onPathsChange: (newPaths: Path[], moveIncrement?: boolean) => void;
  colorAccessibilityMode: boolean;
  highContrastGrid?: boolean;
  highlightedColorId?: number | null;
  suggestedCell?: Point | null;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  puzzle,
  paths,
  onPathsChange,
  colorAccessibilityMode,
  highContrastGrid = true,
  highlightedColorId,
  suggestedCell,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeColorId, setActiveColorId] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const getColor = useCallback((colorId: number): ColorScheme => {
    return GAME_COLORS[colorId % GAME_COLORS.length];
  }, []);

  // Convert client coordinate into grid cell (col x, row y)
  const getCellFromCoords = useCallback(
    (clientX: number, clientY: number): Point | null => {
      if (!containerRef.current) return null;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      if (x < 0 || x >= rect.width || y < 0 || y >= rect.height) return null;

      const cellWidth = rect.width / puzzle.width;
      const cellHeight = rect.height / puzzle.height;

      const col = Math.floor(x / cellWidth);
      const row = Math.floor(y / cellHeight);

      if (col >= 0 && col < puzzle.width && row >= 0 && row < puzzle.height) {
        return { x: col, y: row };
      }
      return null;
    },
    [puzzle.width, puzzle.height]
  );

  // Checks if a cell is an endpoint of another color
  const isEndpointOfAnotherColor = useCallback(
    (cell: Point, currentColorId: number): boolean => {
      for (const ep of puzzle.endpoints) {
        if (ep.colorId !== currentColorId) {
          if (pointsEqual(cell, ep.start) || pointsEqual(cell, ep.end)) {
            return true;
          }
        }
      }
      return false;
    },
    [puzzle.endpoints]
  );

  // Handle pointer down (touch or mouse)
  const handlePointerStart = useCallback(
    (clientX: number, clientY: number) => {
      const cell = getCellFromCoords(clientX, clientY);
      if (!cell) return;

      // 1. Check if clicked directly on an endpoint
      for (const ep of puzzle.endpoints) {
        const isStart = pointsEqual(cell, ep.start);
        const isEnd = pointsEqual(cell, ep.end);

        if (isStart || isEnd) {
          sound.playStep(ep.colorId);
          setActiveColorId(ep.colorId);
          setIsDragging(true);

          // Reset or re-route path from this endpoint
          const otherPaths = paths.filter(p => p.colorId !== ep.colorId);
          onPathsChange([...otherPaths, { colorId: ep.colorId, cells: [cell] }], true);
          return;
        }
      }

      // 2. Check if clicked on an existing drawn path
      for (const p of paths) {
        const cellIndex = p.cells.findIndex(c => pointsEqual(c, cell));
        if (cellIndex !== -1) {
          sound.playStep(p.colorId);
          setActiveColorId(p.colorId);
          setIsDragging(true);

          // Truncate path up to this point and continue dragging
          const truncated = p.cells.slice(0, cellIndex + 1);
          const otherPaths = paths.filter(item => item.colorId !== p.colorId);
          onPathsChange([...otherPaths, { colorId: p.colorId, cells: truncated }], true);
          return;
        }
      }
    },
    [getCellFromCoords, paths, puzzle.endpoints, onPathsChange]
  );

  // Handle pointer move
  const handlePointerMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!isDragging || activeColorId === null) return;
      const cell = getCellFromCoords(clientX, clientY);
      if (!cell) return;

      const currentPath = paths.find(p => p.colorId === activeColorId);
      if (!currentPath || currentPath.cells.length === 0) return;

      const head = currentPath.cells[currentPath.cells.length - 1];

      // If already on the same cell, do nothing
      if (pointsEqual(head, cell)) return;

      // Check if user is backtracking to the previous cell
      if (currentPath.cells.length >= 2) {
        const previousCell = currentPath.cells[currentPath.cells.length - 2];
        if (pointsEqual(previousCell, cell)) {
          sound.playBacktrack();
          const popped = currentPath.cells.slice(0, -1);
          const otherPaths = paths.filter(p => p.colorId !== activeColorId);
          onPathsChange([...otherPaths, { colorId: activeColorId, cells: popped }]);
          return;
        }
      }

      // Must be orthogonal neighbor (no diagonal moves)
      if (!isOrthogonalNeighbor(head, cell)) {
        return;
      }

      // Cannot step on an endpoint belonging to another color
      if (isEndpointOfAnotherColor(cell, activeColorId)) {
        sound.playInvalid();
        return;
      }

      // Check if self-intersecting earlier in own path: truncate to that loop point
      const ownIdx = currentPath.cells.findIndex(c => pointsEqual(c, cell));
      if (ownIdx !== -1) {
        sound.playBacktrack();
        const truncated = currentPath.cells.slice(0, ownIdx + 1);
        const otherPaths = paths.filter(p => p.colorId !== activeColorId);
        onPathsChange([...otherPaths, { colorId: activeColorId, cells: truncated }]);
        return;
      }

      // Find the endpoint pair for this color
      const ep = puzzle.endpoints.find(e => e.colorId === activeColorId);
      if (!ep) return;

      // If stepping into another color's path, cut/truncate that other path
      let updatedPaths = paths.map(p => {
        if (p.colorId === activeColorId) return p;
        const collisionIndex = p.cells.findIndex(c => pointsEqual(c, cell));
        if (collisionIndex !== -1) {
          // Truncate other path before the collision
          return {
            ...p,
            cells: p.cells.slice(0, collisionIndex),
          };
        }
        return p;
      }).filter(p => p.cells.length > 0);

      // Add cell to current path
      const nextCells = [...currentPath.cells, cell];
      const otherPaths = updatedPaths.filter(p => p.colorId !== activeColorId);
      const newPaths = [...otherPaths, { colorId: activeColorId, cells: nextCells }];

      // Check if this step connects the pair!
      const reachedEnd = (pointsEqual(cell, ep.start) && pointsEqual(nextCells[0], ep.end)) ||
                         (pointsEqual(cell, ep.end) && pointsEqual(nextCells[0], ep.start));

      if (reachedEnd) {
        sound.playConnect(activeColorId);
        setIsDragging(false);
        setActiveColorId(null);
      } else {
        sound.playStep(activeColorId);
      }

      onPathsChange(newPaths);
    },
    [isDragging, activeColorId, getCellFromCoords, paths, isEndpointOfAnotherColor, puzzle.endpoints, onPathsChange]
  );

  const handlePointerEnd = useCallback(() => {
    setIsDragging(false);
    setActiveColorId(null);
  }, []);

  // Global window listeners to maintain smooth dragging outside container boundaries
  useEffect(() => {
    if (!isDragging) return;

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onTouchEnd = () => handlePointerEnd();
    const onMouseMove = (e: MouseEvent) => {
      handlePointerMove(e.clientX, e.clientY);
    };
    const onMouseUp = () => handlePointerEnd();

    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('touchcancel', onTouchEnd);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging, handlePointerMove, handlePointerEnd]);

  // Compute connected status per color
  const isColorConnected = useCallback(
    (colorId: number): boolean => {
      const ep = puzzle.endpoints.find(e => e.colorId === colorId);
      const p = paths.find(item => item.colorId === colorId);
      if (!ep || !p || p.cells.length < 2) return false;
      const first = p.cells[0];
      const last = p.cells[p.cells.length - 1];
      return (pointsEqual(first, ep.start) && pointsEqual(last, ep.end)) ||
             (pointsEqual(first, ep.end) && pointsEqual(last, ep.start));
    },
    [paths, puzzle.endpoints]
  );

  return (
    <div className="relative w-full max-w-[420px] sm:max-w-[500px] md:max-w-[580px] lg:max-w-[640px] xl:max-w-[680px] aspect-square mx-auto select-none touch-none p-2 sm:p-3 md:p-3.5 bg-gradient-to-b from-[#141e33] to-[#090e1a] rounded-3xl border-2 border-slate-700/80 shadow-2xl shadow-cyan-950/25 backdrop-blur-xl">
      <div
        ref={containerRef}
        onMouseDown={e => handlePointerStart(e.clientX, e.clientY)}
        onTouchStart={e => {
          if (e.touches.length > 0) {
            handlePointerStart(e.touches[0].clientX, e.touches[0].clientY);
          }
        }}
        className="relative w-full h-full rounded-2xl overflow-hidden bg-[#080d18] border-2 border-slate-700/90 shadow-inner"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${puzzle.width}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${puzzle.height}, minmax(0, 1fr))`,
        }}
      >
        {/* High-definition grid cell tiles */}
        {Array.from({ length: puzzle.height }).map((_, r) =>
          Array.from({ length: puzzle.width }).map((_, c) => {
            const isSuggested = suggestedCell && suggestedCell.x === c && suggestedCell.y === r;
            return (
              <div
                key={`cell_${c}_${r}`}
                className={`relative flex items-center justify-center bg-[#0c1424] border transition-colors duration-200 ${
                  highContrastGrid
                    ? 'border-slate-700/80 sm:border-slate-600/85'
                    : 'border-slate-800/60'
                } shadow-[inset_0_0_8px_rgba(0,0,0,0.5)] ${
                  isSuggested ? 'bg-amber-400/25 ring-2 ring-amber-400 ring-inset animate-pulse' : ''
                }`}
              >
                {/* Center dot node guide - distinct and tactile */}
                <div
                  className={`rounded-full pointer-events-none transition-all ${
                    highContrastGrid
                      ? 'w-2 h-2 sm:w-2.5 sm:h-2.5 bg-slate-500/50 border border-slate-400/30'
                      : 'w-1.5 h-1.5 sm:w-2 sm:h-2 bg-slate-600/30'
                  }`}
                />
              </div>
            );
          })
        )}

        {/* SVG Path & Grid Layer */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
          viewBox={`0 0 ${puzzle.width * 100} ${puzzle.height * 100}`}
        >
          {/* Vector Grid Layer: Sharp, high-contrast lines on high-DPI tablets */}
          <g className="grid-vector-lines">
            {Array.from({ length: puzzle.width - 1 }).map((_, i) => (
              <line
                key={`gv_${i}`}
                x1={(i + 1) * 100}
                y1={0}
                x2={(i + 1) * 100}
                y2={puzzle.height * 100}
                stroke={highContrastGrid ? '#334668' : '#22314a'}
                strokeWidth={highContrastGrid ? '2.5' : '1.8'}
              />
            ))}
            {Array.from({ length: puzzle.height - 1 }).map((_, i) => (
              <line
                key={`gh_${i}`}
                x1={0}
                y1={(i + 1) * 100}
                x2={puzzle.width * 100}
                y2={(i + 1) * 100}
                stroke={highContrastGrid ? '#334668' : '#22314a'}
                strokeWidth={highContrastGrid ? '2.5' : '1.8'}
              />
            ))}
            {/* Grid Crosshair Intersections */}
            {Array.from({ length: puzzle.width - 1 }).map((_, c) =>
              Array.from({ length: puzzle.height - 1 }).map((_, r) => (
                <circle
                  key={`gi_${c}_${r}`}
                  cx={(c + 1) * 100}
                  cy={(r + 1) * 100}
                  r="2.5"
                  fill="#64748b"
                  opacity={highContrastGrid ? 0.85 : 0.5}
                />
              ))
            )}
            {/* Crisp Inner Board Boundary */}
            <rect
              x="0.5"
              y="0.5"
              width={puzzle.width * 100 - 1}
              height={puzzle.height * 100 - 1}
              fill="none"
              stroke="#3a4f75"
              strokeWidth="2.5"
            />
          </g>
          {paths.map(p => {
            if (p.cells.length < 2) return null;
            const color = getColor(p.colorId);
            const isActive = activeColorId === p.colorId;
            const isConnected = isColorConnected(p.colorId);

            const pointsString = p.cells
              .map(c => `${c.x * 100 + 50},${c.y * 100 + 50}`)
              .join(' ');

            return (
              <g key={`path_${p.colorId}`}>
                {/* Outer soft aura glow */}
                <polyline
                  points={pointsString}
                  fill="none"
                  stroke={color.glow}
                  strokeWidth={isActive ? '48' : '36'}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={isActive ? 0.85 : isConnected ? 0.6 : 0.45}
                  className="transition-all duration-150"
                />
                {/* Main solid pipe body */}
                <polyline
                  points={pointsString}
                  fill="none"
                  stroke={color.hex}
                  strokeWidth="28"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={isActive ? 1 : isConnected ? 0.95 : 0.85}
                  className="transition-all duration-100"
                />
                {/* Subtle top specular sheen */}
                <polyline
                  points={pointsString}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={0.3}
                />
              </g>
            );
          })}
        </svg>

        {/* Endpoints Overlay */}
        {puzzle.endpoints.map(ep => {
          const color = getColor(ep.colorId);
          const isConnected = isColorConnected(ep.colorId);
          const isActive = activeColorId === ep.colorId;
          const isHighlighted = highlightedColorId === ep.colorId;

          const renderEndpoint = (point: Point, isStartNode: boolean) => {
            const cellPercentW = 100 / puzzle.width;
            const cellPercentH = 100 / puzzle.height;
            const leftPercent = point.x * cellPercentW;
            const topPercent = point.y * cellPercentH;

            return (
              <div
                key={`ep_${ep.colorId}_${isStartNode ? 'start' : 'end'}`}
                className="absolute z-20 flex items-center justify-center pointer-events-none transition-transform duration-200"
                style={{
                  width: `${cellPercentW}%`,
                  height: `${cellPercentH}%`,
                  left: `${leftPercent}%`,
                  top: `${topPercent}%`,
                  transform: isActive ? 'scale(1.12)' : isHighlighted ? 'scale(1.2)' : 'scale(1)',
                }}
              >
                {/* Outer pulsing ring when highlighted or active */}
                {(isActive || isHighlighted) && (
                  <div
                    className="absolute inset-1 rounded-full animate-ping opacity-60"
                    style={{ backgroundColor: color.hex }}
                  />
                )}

                {/* Main Dot Body */}
                <div
                  className="relative rounded-full shadow-lg flex items-center justify-center transition-all duration-200"
                  style={{
                    width: '74%',
                    height: '74%',
                    backgroundColor: color.hex,
                    boxShadow: `0 0 16px ${color.glow}, inset 0 2px 4px rgba(255,255,255,0.4)`,
                  }}
                >
                  {/* Inner contrasting center dot or accessibility symbol */}
                  {colorAccessibilityMode ? (
                    <span className="text-white text-xs sm:text-sm font-black drop-shadow-md">
                      {color.symbol}
                    </span>
                  ) : (
                    <div
                      className={`rounded-full transition-transform duration-300 ${
                        isConnected ? 'scale-100 bg-white/95 w-3 h-3 shadow-inner' : 'scale-75 bg-slate-900/60 w-2.5 h-2.5'
                      }`}
                    />
                  )}
                </div>
              </div>
            );
          };

          return (
            <React.Fragment key={`pair_${ep.colorId}`}>
              {renderEndpoint(ep.start, true)}
              {renderEndpoint(ep.end, false)}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
