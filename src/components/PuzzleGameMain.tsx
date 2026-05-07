import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Grid from './Grid';
import ShapesContainer from './ShapesContainer';
import TouchDragPreview from './TouchDragPreview';
import CelebrationAnimation from './CelebrationAnimation';
import { Piece, GameState } from '@/types/interfaces';

import { isHighlightedCurrentDate, canPlacePiece, calculatePieceCenter, placePiece } from './PuzzleGameLogic';
import { handleTransform } from './Transform';
import { checkWinCondition, getTotalAvailableCells, getFilledCells } from './checkWinCondition';
import { setStorageItem, getStorageItem, removeStorageItem, STORAGE_KEYS, checkAndResetForNewDay } from '@/lib/localStorage';
import { useAppContext } from '@/contexts/AppContext';
import { useCapacitor } from '@/hooks/useCapacitor';
import { ImpactStyle } from '@capacitor/haptics';
import { useTheme } from '@/contexts/theme-provider';
import { APP_COLORS } from '@/lib/colors';
import { SHAPES, ShapeNames, InitialBoard, createShapesCopy } from '@/lib/common.js';

interface PuzzleGameProps {
  onGameComplete: (score: number) => void;
}

// ============================================================================
// Module-level constants
// ============================================================================

// Grid dimensions
const GRID_COLS = 7;
const GRID_ROWS = 8;
const GRID_FIRST_INDEX = 0;
const GRID_LAST_COL_INDEX = GRID_COLS - 1;
const GRID_LAST_ROW_INDEX = GRID_ROWS - 1;

// Calendar layout constants
const CALENDAR_HEADER_ROW_TOP = 0;
const CALENDAR_HEADER_ROW_BOTTOM = 1;
const CALENDAR_HEADER_COL_LIMIT = 6;
const CALENDAR_DAYS_START_ROW = 2;
const CALENDAR_DAYS_END_ROW = 5;
const CALENDAR_FOOTER_ROW = 7;
const CALENDAR_FOOTER_COL_START = 4;
const CALENDAR_DEAD_COL = 6;
const CALENDAR_FULL_ROW = 6;
const CALENDAR_MAX_DAYS = 28;
const DEAD_CELL_VALUE = 'dead';

// Piece initial positioning
const PIECE_POS_BASE_OFFSET = 50;
const PIECE_POS_X_SPACING = 120;
const PIECE_POS_Y_SPACING = 100;
const PIECES_PER_ROW = 5;

// Touch drag tuning
const TOUCH_FOCAL_RADIUS_RATIO = 0.75;

// Timing
const NEW_DAY_CHECK_INTERVAL_MS = 60000;

// Layout sizing
const GRID_CONTAINER_MIN_HEIGHT = '320px';
const GRID_CONTAINER_LG_WIDTH = 'lg:w-[448px]';

// Default state shapes
const DEFAULT_STATS_SHAPE = {
  gamesPlayed: 0, gamesWon: 0, currentStreak: 0, maxStreak: 0,
  averageScore: 0, totalScore: 0, lastPlayedDate: null,
  winPercentage: 0, bestScore: 0, dailyStats: []
};

const DEFAULT_GAME_STATE: GameState = {
  grid: InitialBoard.map(() => Array(GRID_COLS).fill(null)),
  pieces: [], moves: 0, placedPieces: [],
  pieceShapes: [], pieceColors: [], gameWon: false
};

// UI strings / classNames
const WIN_MESSAGE = '🎉 YOU WIN! 🎉';
const RESET_BUTTON_LABEL = 'Reset';
const SIMULATE_MIDNIGHT_LABEL = 'Simulate Midnight';
const MOVES_LABEL = 'moves';
const CALENDAR_GRID_DATA_ATTR = 'data-calendar-grid';
const CALENDAR_GRID_SELECTOR = `[${CALENDAR_GRID_DATA_ATTR}]`;
const FOCUS_EVENT = 'focus';

const ROOT_CLASS = 'h-full flex flex-col max-h-full bg-background';
const HEADER_WRAPPER_CLASS = 'flex-shrink-0 px-1 md:px-4 pt-4 md:pt-6';
const HEADER_INNER_CLASS = 'w-full flex flex-col items-center';
const PANEL_CLASS = 'rounded-xl px-5 py-3 md:px-6 md:py-4 border border-border/60 bg-card';
const MOVES_TITLE_CLASS = 'text-lg md:text-xl font-semibold text-center text-foreground';
const WIN_MESSAGE_CLASS = 'text-emerald-600 dark:text-emerald-400 font-semibold text-center mt-1.5 text-sm md:text-base';
const RESET_ROW_CLASS = 'flex gap-2 mb-6 md:mb-8';
const RESET_BUTTON_CLASS = 'text-xs md:text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted !transition-none';

const CONTENT_CLASS = 'flex-1 flex flex-col lg:flex-row p-1 md:p-4 gap-4 md:gap-10 min-h-0 max-h-full overflow-hidden items-center lg:items-start justify-center lg:max-w-5xl lg:mx-auto';
const GRID_COL_CLASS = 'w-full lg:w-auto flex-shrink-0 mb-1 md:mb-0 flex items-center lg:items-start justify-center';
const GRID_CENTER_CLASS = 'flex items-center lg:items-start justify-center';
const SHAPES_COL_CLASS = 'flex-1 min-h-0 max-h-full flex items-start justify-center lg:max-w-md';

// Theme key
const THEME_DARK = 'dark';

// ============================================================================
// Helpers
// ============================================================================

// Convert SHAPES from common.js to boolean matrix format for compatibility
const convertShapeToBoolean = (shapeMatrix: (string | number)[][]): boolean[][] => {
  return shapeMatrix.map(row =>
    row.map(cell => cell !== 0 && cell !== null)
  );
};

// Build initial position object for a piece given its index
const buildInitialPiecePosition = (index: number) => ({
  x: PIECE_POS_BASE_OFFSET + (index % PIECES_PER_ROW) * PIECE_POS_X_SPACING,
  y: PIECE_POS_BASE_OFFSET + Math.floor(index / PIECES_PER_ROW) * PIECE_POS_Y_SPACING,
});

// Create puzzle pieces from SHAPES
const createPuzzlePieces = () => {
  return ShapeNames.map((shapeName, index) => {
    const shape = SHAPES[shapeName];
    return {
      id: `piece-${index}`,
      shape: convertShapeToBoolean(shape.matrix),
      matrix: shape.matrix,
      color: shape.color,
      shapeName
    };
  });
};

// Build a fresh array of Piece objects ready to render
const buildFreshPieces = (color: string): Piece[] => {
  const shapesPieces = createPuzzlePieces();
  return shapesPieces.map((shapePiece, index) => ({
    id: shapePiece.id,
    shape: shapePiece.shape,
    color,
    position: buildInitialPiecePosition(index),
    isPlaced: false,
  }));
};

// Build a fresh empty grid
const buildEmptyGrid = (): (string | null)[][] =>
  InitialBoard.map(() => Array(GRID_COLS).fill(null));

// Get today's date string in YYYY-MM-DD form
const getTodayDateString = (): string => new Date().toISOString().split('T')[0];

// Build a safely-shaped stats object from whatever was loaded
const buildSafeStats = (currentStats: typeof DEFAULT_STATS_SHAPE) => ({
  ...DEFAULT_STATS_SHAPE,
  ...currentStats,
  dailyStats: Array.isArray(currentStats.dailyStats) ? currentStats.dailyStats : [],
});

// Build a color map from a list of pieces
const buildColorMapFromPieces = (puzzlePieces: Piece[]): Map<string, string> => {
  const colorMap = new Map<string, string>();
  puzzlePieces.forEach(piece => colorMap.set(piece.id, piece.color));
  return colorMap;
};

// Compute preview cells for a piece anchored at (adjustedRow, adjustedCol)
const computePreviewCells = (
  piece: Piece,
  adjustedRow: number,
  adjustedCol: number
): { row: number; col: number }[] => {
  const previewCells: { row: number; col: number }[] = [];
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (piece.shape[r][c]) {
        previewCells.push({ row: adjustedRow + r, col: adjustedCol + c });
      }
    }
  }
  return previewCells;
};

// True if (row, col) is inside the grid bounds
const isInGridBounds = (row: number, col: number): boolean =>
  row >= GRID_FIRST_INDEX && row < GRID_ROWS &&
  col >= GRID_FIRST_INDEX && col < GRID_COLS;

// ============================================================================
// Component
// ============================================================================

const PuzzleGame: React.FC<PuzzleGameProps> = ({ onGameComplete }) => {
  const { selectedPieceColor } = useAppContext();
  const { theme } = useTheme();
  const { hapticFeedback, hideKeyboard } = useCapacitor();

  const [grid, setGrid] = useState<(string | null)[][]>(buildEmptyGrid());
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [selectedPiece, setSelectedPiece] = useState<string | null>(null);

  const [draggedPiece, setDraggedPiece] = useState<string | null>(null);
  const [dragPreview, setDragPreview] = useState<{ row: number; col: number }[] | null>(null);
  const [gameWon, setGameWon] = useState(false);
  const [moves, setMoves] = useState(0);
  const [placedPieces, setPlacedPieces] = useState<{ row: number; col: number }[]>([]);
  const [pieceShapes, setPieceShapes] = useState<Map<string, { row: number; col: number }[]>>(new Map());
  const [pieceColors, setPieceColors] = useState<Map<string, string>>(new Map());

  // Touch drag state
  const [touchDragState, setTouchDragState] = useState<{
    isDragging: boolean;
    pieceId: string | null;
    startPos: { x: number; y: number } | null;
    currentPos: { x: number; y: number } | null;
    dragElement: HTMLElement | null;
  }>({
    isDragging: false,
    pieceId: null,
    startPos: null,
    currentPos: null,
    dragElement: null
  });

  const saveGameState = () => {
    const gameState: GameState = {
      grid, pieces, moves, placedPieces,
      pieceShapes: Array.from(pieceShapes.entries()),
      pieceColors: Array.from(pieceColors.entries()),
      gameWon
    };
    setStorageItem(STORAGE_KEYS.GAME_STATE, gameState);
  };

  const loadGameState = (): boolean => {
    const savedState = getStorageItem(STORAGE_KEYS.GAME_STATE, DEFAULT_GAME_STATE);

    if (savedState.pieces.length > 0) {
      setGrid(savedState.grid);
      setPieces(savedState.pieces);
      setMoves(savedState.moves);
      setPlacedPieces(savedState.placedPieces);
      setPieceShapes(new Map(savedState.pieceShapes));
      setPieceColors(new Map(savedState.pieceColors));
      setGameWon(savedState.gameWon);
      return true;
    }
    return false;
  };

  // Initialize a fresh game and persist colors
  const initializeFreshPieces = () => {
    const puzzlePieces = buildFreshPieces(selectedPieceColor.value);
    setPieces(puzzlePieces);
    setPieceColors(buildColorMapFromPieces(puzzlePieces));
  };

  // Update lastPlayedDate to today, defensively shaping stats
  const updateLastPlayedDateToToday = () => {
    const today = getTodayDateString();
    const currentStats = getStorageItem(STORAGE_KEYS.GAME_STATS, DEFAULT_STATS_SHAPE);
    const safeStats = buildSafeStats(currentStats);
    setStorageItem(STORAGE_KEYS.GAME_STATS, { ...safeStats, lastPlayedDate: today });
  };

  useEffect(() => {
    // Always check if it's a new day first
    const { wasReset } = checkAndResetForNewDay();
    if (wasReset) {
      // New day detected, start fresh game
      updateLastPlayedDateToToday();
      initializeFreshPieces();

      // Reset all game state
      setGrid(buildEmptyGrid());
      setMoves(0);
      setPlacedPieces([]);
      setPieceShapes(new Map());
      setGameWon(false);
      return;
    }

    // Same day, try to load saved state
    if (loadGameState()) return;

    // No saved state, initialize new game and update lastPlayedDate
    const today = getTodayDateString();
    const currentStats = getStorageItem(STORAGE_KEYS.GAME_STATS, DEFAULT_STATS_SHAPE);
    const safeStats = buildSafeStats(currentStats);
    if (safeStats.lastPlayedDate !== today) {
      setStorageItem(STORAGE_KEYS.GAME_STATS, { ...safeStats, lastPlayedDate: today });
    }

    initializeFreshPieces();
  }, [selectedPieceColor]);

  // Add effect to check for date changes periodically
  useEffect(() => {
    const checkDateChange = () => {
      const { wasReset } = checkAndResetForNewDay();
      if (wasReset) {
        // Date changed, reset game state for new day
        setPlacedPieces([]);
        setPieceShapes(new Map());
        setSelectedPiece(null);
        setGameWon(false);

        // Reinitialize pieces
        initializeFreshPieces();
        updateLastPlayedDateToToday();
      }
    };

    // Check immediately
    checkDateChange();

    // Set up interval to check every minute
    const interval = setInterval(checkDateChange, NEW_DAY_CHECK_INTERVAL_MS);

    // Also check when window gains focus (user returns to tab)
    const handleFocus = () => checkDateChange();
    window.addEventListener(FOCUS_EVENT, handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener(FOCUS_EVENT, handleFocus);
    };
  }, [selectedPieceColor]);

  // Check for new day when moves are made
  const checkForNewDay = () => {
    const { wasReset } = checkAndResetForNewDay();
    if (wasReset) {
      // Reset all game state for new day
      setGrid(buildEmptyGrid());
      setMoves(0);
      setPlacedPieces([]);
      setPieceShapes(new Map());
      setSelectedPiece(null);
      setGameWon(false);

      // Reinitialize pieces
      initializeFreshPieces();
      return true;
    }
    return false;
  };

  // Update piece colors when selected color changes
  useEffect(() => {
    if (pieces.length === 0) return; // Don't run if pieces aren't initialized yet

    setPieces(prev => prev.map(piece => ({
      ...piece,
      color: selectedPieceColor.value
    })));

    // Update the color map for all pieces, including placed ones
    const newColorMap = new Map<string, string>();
    pieces.forEach(piece => newColorMap.set(piece.id, selectedPieceColor.value));
    setPieceColors(newColorMap);
  }, [selectedPieceColor, pieces.length]);

  useEffect(() => {
    if (pieces.length > 0) saveGameState();
  }, [grid, pieces, moves, placedPieces, pieceShapes, pieceColors, gameWon]);

  useEffect(() => {
    if (pieces.length > 0) {
      const hasWon = checkWinCondition(pieces, grid, isValidCalendarCell);
      if (hasWon && !gameWon) {
        setGameWon(true);
        hapticFeedback(ImpactStyle.Heavy);
        onGameComplete(moves);
      }
    }
  }, [pieces, grid, gameWon, moves, onGameComplete, hapticFeedback]);

  const removePiece = async (pieceId: string) => {
    // Don't allow removing pieces after winning
    if (gameWon) return;

    const piece = pieces.find(p => p.id === pieceId);
    if (!piece || !piece.isPlaced) return;
    await hapticFeedback(ImpactStyle.Light);

    const newGrid = grid.map(row => [...row]);
    const piecePositions = pieceShapes.get(pieceId) || [];

    piecePositions.forEach(pos => {
      if (isInGridBounds(pos.row, pos.col)) {
        newGrid[pos.row][pos.col] = null;
      }
    });

    setGrid(newGrid);
    setPieces(prev => prev.map(p => p.id === pieceId ? { ...p, isPlaced: false } : p));
    setPlacedPieces(prev => prev.filter(pos => !piecePositions.some(piecePos => piecePos.row === pos.row && piecePos.col === pos.col)));

    const newPieceShapes = new Map(pieceShapes);
    newPieceShapes.delete(pieceId);
    setPieceShapes(newPieceShapes);
    // Don't increment moves counter when removing pieces
  };

  const resetGame = async () => {
    await hapticFeedback(ImpactStyle.Medium);
    await hideKeyboard();

    setGrid(buildEmptyGrid());
    setPieces(prev => prev.map(p => ({ ...p, isPlaced: false, color: selectedPieceColor.value })));
    // Removed setMoves(0) - moves counter now persists across resets
    setPlacedPieces([]);
    setPieceShapes(new Map());
    setSelectedPiece(null);
    setGameWon(false);
  };

  const handleHint = async () => {
    await hapticFeedback(ImpactStyle.Light);
  };

  const isValidCalendarCell = (row: number, col: number): boolean => {
    if (row === CALENDAR_HEADER_ROW_TOP && col === CALENDAR_DEAD_COL) return false;
    if (row === CALENDAR_HEADER_ROW_BOTTOM && col === CALENDAR_DEAD_COL) return false;
    if (row === CALENDAR_FOOTER_ROW && col < CALENDAR_FOOTER_COL_START) return false;
    if (row === CALENDAR_HEADER_ROW_TOP) return col < CALENDAR_HEADER_COL_LIMIT;
    if (row === CALENDAR_HEADER_ROW_BOTTOM) return col < CALENDAR_HEADER_COL_LIMIT;
    if (row >= CALENDAR_DAYS_START_ROW && row <= CALENDAR_DAYS_END_ROW) {
      return (row - CALENDAR_DAYS_START_ROW) * GRID_COLS + col + 1 <= CALENDAR_MAX_DAYS;
    }
    if (row === CALENDAR_FULL_ROW) return true;
    if (row === CALENDAR_FOOTER_ROW) return col >= CALENDAR_FOOTER_COL_START;
    return false;
  };

  const getCellContent = (row: number, col: number): string => {
    if (row >= GRID_FIRST_INDEX && row < InitialBoard.length && col >= GRID_FIRST_INDEX && col < InitialBoard[row].length) {
      const content = InitialBoard[row][col];
      return content === DEAD_CELL_VALUE ? '' : content;
    }
    return '';
  };

  const handleDragStart = (pieceId: string) => {
    setDraggedPiece(pieceId);
    hapticFeedback(ImpactStyle.Light);
  };

  const handleDragEnd = () => {
    setDraggedPiece(null);
    setDragPreview(null);
  };

  const handleDragOver = (e: React.DragEvent, row: number, col: number) => {
    e.preventDefault();
    if (!draggedPiece) return;

    const piece = pieces.find(p => p.id === draggedPiece);
    if (!piece || piece.isPlaced) return;

    const { centerRow, centerCol } = calculatePieceCenter(piece.shape);
    const adjustedRow = row - centerRow;
    const adjustedCol = col - centerCol;

    if (canPlacePiece(piece, adjustedRow, adjustedCol, grid, isValidCalendarCell, getCellContent)) {
      setDragPreview(computePreviewCells(piece, adjustedRow, adjustedCol));
    } else {
      setDragPreview(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, row: number, col: number) => {
    e.preventDefault();

    // Get the piece ID from the dataTransfer object
    const pieceId = e.dataTransfer.getData('text/plain');
    if (!pieceId) return;

    const piece = pieces.find(p => p.id === pieceId);
    if (!piece || piece.isPlaced) return;

    const { centerRow, centerCol } = calculatePieceCenter(piece.shape);
    const adjustedRow = row - centerRow;
    const adjustedCol = col - centerCol;

    if (canPlacePiece(piece, adjustedRow, adjustedCol, grid, isValidCalendarCell, getCellContent)) {
      await hapticFeedback(ImpactStyle.Medium);
      placePiece(piece, adjustedRow, adjustedCol, grid, setGrid, setPlacedPieces, setPieceShapes, setPieces, setMoves, setSelectedPiece, checkForNewDay);
    }

    setDraggedPiece(null);
    setDragPreview(null);
  };

  // Touch event handlers for mobile drag and drop
  const handleTouchStart = (e: React.TouchEvent, pieceId: string) => {
    e.preventDefault(); // Prevent default touch behavior
    const touch = e.touches[0];
    setTouchDragState({
      isDragging: true,
      pieceId,
      startPos: { x: touch.clientX, y: touch.clientY },
      currentPos: { x: touch.clientX, y: touch.clientY },
      dragElement: e.currentTarget as HTMLElement
    });
    setDraggedPiece(pieceId);
    hapticFeedback(ImpactStyle.Light);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchDragState.isDragging || !touchDragState.pieceId) return;

    e.preventDefault();
    const touch = e.touches[0];
    setTouchDragState(prev => ({
      ...prev,
      currentPos: { x: touch.clientX, y: touch.clientY }
    }));

    // Find grid element and calculate position with larger focal point
    const gridElement = document.querySelector(CALENDAR_GRID_SELECTOR);
    if (!gridElement) return;

    const rect = gridElement.getBoundingClientRect();
    const cellSize = rect.width / GRID_COLS;

    // Expand the focal point by using a larger area around the touch point
    const focalRadius = cellSize * TOUCH_FOCAL_RADIUS_RATIO;
    const centerX = touch.clientX - rect.left;
    const centerY = touch.clientY - rect.top;

    // Find the closest valid grid position within the focal area
    const rawCol = Math.floor(centerX / cellSize);
    const rawRow = Math.floor(centerY / cellSize);

    // Clamp to grid bounds
    const bestCol = Math.max(GRID_FIRST_INDEX, Math.min(GRID_LAST_COL_INDEX, rawCol));
    const bestRow = Math.max(GRID_FIRST_INDEX, Math.min(GRID_LAST_ROW_INDEX, rawRow));

    if (!isInGridBounds(bestRow, bestCol)) return;

    // Update drag preview
    const piece = pieces.find(p => p.id === touchDragState.pieceId);
    if (!piece || piece.isPlaced) return;

    const { centerRow, centerCol } = calculatePieceCenter(piece.shape);
    const adjustedRow = bestRow - centerRow;
    const adjustedCol = bestCol - centerCol;

    if (canPlacePiece(piece, adjustedRow, adjustedCol, grid, isValidCalendarCell, getCellContent)) {
      setDragPreview(computePreviewCells(piece, adjustedRow, adjustedCol));
    } else {
      setDragPreview(null);
    }
  };

  const handleTouchEnd = async (e: React.TouchEvent) => {
    if (!touchDragState.isDragging || !touchDragState.pieceId) return;

    const touch = e.changedTouches[0];

    // Find grid element and calculate drop position
    const gridElement = document.querySelector(CALENDAR_GRID_SELECTOR);
    if (gridElement) {
      const rect = gridElement.getBoundingClientRect();
      const cellSize = rect.width / GRID_COLS;
      const col = Math.floor((touch.clientX - rect.left) / cellSize);
      const row = Math.floor((touch.clientY - rect.top) / cellSize);

      if (isInGridBounds(row, col)) {
        // Check if touch ended over a valid grid cell by using elementFromPoint
        const elementAtPoint = document.elementFromPoint(touch.clientX, touch.clientY);
        const isOverGrid = Boolean(
          elementAtPoint && (
            elementAtPoint.closest(CALENDAR_GRID_SELECTOR) ||
            elementAtPoint.hasAttribute(CALENDAR_GRID_DATA_ATTR)
          )
        );

        if (isOverGrid) {
          const piece = pieces.find(p => p.id === touchDragState.pieceId);
          if (piece && !piece.isPlaced) {
            const { centerRow, centerCol } = calculatePieceCenter(piece.shape);
            const adjustedRow = row - centerRow;
            const adjustedCol = col - centerCol;

            if (canPlacePiece(piece, adjustedRow, adjustedCol, grid, isValidCalendarCell, getCellContent)) {
              await hapticFeedback(ImpactStyle.Medium);
              placePiece(piece, adjustedRow, adjustedCol, grid, setGrid, setPlacedPieces, setPieceShapes, setPieces, setMoves, setSelectedPiece, checkForNewDay);
            }
          }
        }
      }
    }

    // Reset touch drag state
    setTouchDragState({
      isDragging: false,
      pieceId: null,
      startPos: null,
      currentPos: null,
      dragElement: null
    });
    setDraggedPiece(null);
    setDragPreview(null);
  };

  const handleBoardClick = async (row: number, col: number) => {
    if (!selectedPiece) return;

    const piece = pieces.find(p => p.id === selectedPiece);
    if (!piece || piece.isPlaced) return;

    // Use the same logic as drag-and-drop: center the piece on the clicked position
    const { centerRow, centerCol } = calculatePieceCenter(piece.shape);
    const adjustedRow = row - centerRow;
    const adjustedCol = col - centerCol;

    const canPlace = canPlacePiece(piece, adjustedRow, adjustedCol, grid, isValidCalendarCell, getCellContent);

    if (canPlace) {
      await hapticFeedback(ImpactStyle.Medium);
      placePiece(piece, adjustedRow, adjustedCol, grid, setGrid, setPlacedPieces, setPieceShapes, setPieces, setMoves, setSelectedPiece, checkForNewDay);
    }
  };

  // Named handler for transform callback (no inline arrow in JSX)
  const handlePieceTransform = (pieceId: string, transform: any) =>
    handleTransform(pieceId, transform, setPieces);

  // ==========================================================================
  // Pre-computed render values (no logic in the return statement)
  // ==========================================================================

  // Theme-driven colors
  const isDarkTheme = theme === THEME_DARK;
  const panelBgColor = isDarkTheme
    ? APP_COLORS.background.dark.panel
    : APP_COLORS.background.light.panel;
  const buttonBgColor = isDarkTheme
    ? APP_COLORS.button.outline.bg
    : APP_COLORS.background.light.panel;

  // Pre-computed style objects
  const panelStyle = { backgroundColor: panelBgColor };
  const resetButtonStyle = { backgroundColor: buttonBgColor, color: APP_COLORS.text.foreground };
  const gridCenterStyle = { minHeight: GRID_CONTAINER_MIN_HEIGHT };

  // Pre-computed display strings
  const movesDisplayText = `${moves} ${MOVES_LABEL}`;

  // Pre-computed conditional flags / sections
  const showWinMessage = gameWon;
  const showResetControls = true; // Always show for testing - was: !gameWon
  const showTouchPreview = Boolean(
    touchDragState.isDragging && touchDragState.pieceId && touchDragState.currentPos
  );

  // Pre-computed touch preview piece (only meaningful when showTouchPreview)
  const touchPreviewPiece = showTouchPreview
    ? pieces.find(p => p.id === touchDragState.pieceId)
    : undefined;
  const touchPreviewPosition = touchDragState.currentPos;

  // Pre-built JSX subsections
  const winMessageNode = showWinMessage ? (
    <div className={WIN_MESSAGE_CLASS}>{WIN_MESSAGE}</div>
  ) : null;

  // Testing only: clears lastPlayedDate so the app behaves as if it's a new day
  const simulateMidnight = () => {
    const stats = getStorageItem(STORAGE_KEYS.GAME_STATS, {} as Record<string, unknown>);
    setStorageItem(STORAGE_KEYS.GAME_STATS, { ...stats, lastPlayedDate: null });
    removeStorageItem(STORAGE_KEYS.GAME_STATE);
    window.location.reload();
  };

  const resetControlsNode = showResetControls ? (
    <div className={RESET_ROW_CLASS}>
      <Button
        variant="outline"
        size="sm"
        style={resetButtonStyle}
        className={RESET_BUTTON_CLASS}
        onClick={resetGame}
      >
        {RESET_BUTTON_LABEL}
      </Button>
      <Button
        variant="outline"
        size="sm"
        className={RESET_BUTTON_CLASS}
        onClick={simulateMidnight}
      >
        {SIMULATE_MIDNIGHT_LABEL}
      </Button>
    </div>
  ) : null;

  const touchPreviewNode = (showTouchPreview && touchPreviewPiece && touchPreviewPosition) ? (
    <TouchDragPreview piece={touchPreviewPiece} position={touchPreviewPosition} />
  ) : null;

  return (
    <div className={ROOT_CLASS}>
      <div className={HEADER_WRAPPER_CLASS}>
        <div className={HEADER_INNER_CLASS}>
          <div style={panelStyle} className={PANEL_CLASS}>
            <h2 className={MOVES_TITLE_CLASS}>{movesDisplayText}</h2>
            {winMessageNode}
          </div>
          {resetControlsNode}
        </div>
      </div>

      <div className={CONTENT_CLASS}>
        <div className={GRID_COL_CLASS}>
          <div className={GRID_CENTER_CLASS} style={gridCenterStyle}>
            <Grid
              grid={grid}
              onCellClick={removePiece}
              onBoardClick={handleBoardClick}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              placedPieces={placedPieces}
              dragPreview={dragPreview}
              pieceShapes={pieceShapes}
              pieceColors={pieceColors}
            />
          </div>
        </div>

        <div className={SHAPES_COL_CLASS}>
          <ShapesContainer
            pieces={pieces}
            selectedPiece={selectedPiece}
            draggedPiece={draggedPiece}
            gameWon={gameWon}
            moves={moves}
            setSelectedPiece={setSelectedPiece}
            handleDragStart={handleDragStart}
            handleDragEnd={handleDragEnd}
            handleTouchStart={handleTouchStart}
            handleTouchMove={handleTouchMove}
            handleTouchEnd={handleTouchEnd}
            onTransform={handlePieceTransform}
          />
        </div>
      </div>

      {touchPreviewNode}

      <CelebrationAnimation isVisible={gameWon} />
    </div>
  );
};

export default PuzzleGame;
