import { PuzzleGameState, Piece } from '../types/interfaces';
import { Months, DaysOfWeek } from '../lib/common.js';

/**
 * Determines if a cell should be highlighted as current date
 * Checks against current date, month, and day of week
 */
export const isHighlightedCurrentDate = (value: string): boolean => {
  const today = new Date();
  const currentMonth = today.getMonth(); // 0-11
  const currentDate = today.getDate(); // 1-31
  const currentDayOfWeek = today.getDay(); // 0-6 (Sunday-Saturday)

  // Check if the cell value matches current date, month, or day of week
  const isCurrentDateCell = value === currentDate.toString() || 
                           value === Months[currentMonth] || 
                           value === DaysOfWeek[currentDayOfWeek];

  return isCurrentDateCell;
};

/**
 * Validates if a piece can be placed at the specified position
 * Checks boundaries, calendar validity, current date conflicts, and existing pieces
 */
export const canPlacePiece = (
  piece: Piece, 
  startRow: number, 
  startCol: number, 
  grid: (string | null)[][],
  isValidCalendarCell: (row: number, col: number) => boolean,
  getCellContent: (row: number, col: number) => string
): boolean => {
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (piece.shape[r][c]) {
        const gridRow = startRow + r;
        const gridCol = startCol + c;
        
        // Check grid boundaries
        if (gridRow < 0 || gridRow >= 8 || gridCol < 0 || gridCol >= 7) {
          return false;
        }
        
        // Check if position is valid calendar cell
        if (!isValidCalendarCell(gridRow, gridCol)) {
          return false;
        }
        
        // Prevent placing on current date cells
        const cellValue = getCellContent(gridRow, gridCol);
        if (isHighlightedCurrentDate(cellValue)) {
          return false;
        }
        
        // Check if cell is already occupied
        if (grid[gridRow][gridCol] !== null) {
          return false;
        }
      }
    }
  }
  return true;
};

/**
 * Calculates the geometric center of a puzzle piece
 */
export const calculatePieceCenter = (shape: boolean[][]) => {
  let totalRows = 0, totalCols = 0, count = 0;
  
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) {
        totalRows += r;
        totalCols += c;
        count++;
      }
    }
  }
  
  if (count === 0) {
    return { centerRow: 0, centerCol: 0 };
  }
  
  return {
    centerRow: Math.round(totalRows / count),
    centerCol: Math.round(totalCols / count)
  };
};

/**
 * Places a puzzle piece on the game grid at the specified position
 * Updates grid state, placed pieces, and piece status
 * Includes new day detection to prevent moves during date transitions
 */
export const placePiece = (
  piece: Piece,
  startRow: number,
  startCol: number,
  grid: (string | null)[][],
  setGrid: React.Dispatch<React.SetStateAction<(string | null)[][]>>,
  setPlacedPieces: React.Dispatch<React.SetStateAction<{ row: number; col: number }[]>>,
  setPieceShapes: React.Dispatch<React.SetStateAction<Map<string, { row: number; col: number }[]>>>,
  setPieces: React.Dispatch<React.SetStateAction<Piece[]>>,
  setMoves: React.Dispatch<React.SetStateAction<number>>,
  setSelectedPiece: React.Dispatch<React.SetStateAction<string | null>>,
  checkForNewDay?: () => boolean
) => {
  // Abort placement if new day detected during move
  if (checkForNewDay && checkForNewDay()) {
    return;
  }
  
  // Create updated grid with piece placed
  const newGrid = grid.map(row => [...row]);
  const newPlacedCells: { row: number; col: number }[] = [];
  
  // Place each cell of the piece shape
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (piece.shape[r][c]) {
        const gridRow = startRow + r;
        const gridCol = startCol + c;
        newGrid[gridRow][gridCol] = piece.id;
        newPlacedCells.push({ row: gridRow, col: gridCol });
      }
    }
  }
  
  // Update all relevant state
  setGrid(newGrid);
  setPlacedPieces(prev => [...prev, ...newPlacedCells]);
  setPieceShapes(prev => new Map(prev.set(piece.id, newPlacedCells)));
  setPieces(prev => prev.map(p => p.id === piece.id ? { ...p, isPlaced: true } : p));
  setMoves(prev => prev + 1);
  setSelectedPiece(null);
};