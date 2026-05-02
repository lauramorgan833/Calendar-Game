import { Piece } from '../types/interfaces';
import { isHighlightedCurrentDate } from './PuzzleGameLogic';
import { InitialBoard } from '@/lib/common.js';

/**
 * Determines if the win condition has been met for the puzzle game
 * Win conditions:
 * 1. All pieces must be placed on the board
 * 2. All valid calendar cells (excluding current date) must be filled
 * 3. Current date cells must remain uncovered (empty)
 */
export const checkWinCondition = (
  pieces: Piece[],
  grid: (string | null)[][],
  isValidCalendarCell: (row: number, col: number) => boolean
): boolean => {
  // Condition 1: All pieces must be placed
  const allPiecesPlaced = pieces.every(piece => piece.isPlaced);
  if (!allPiecesPlaced) return false;

  // Find all valid calendar cells and current date cells using actual InitialBoard
  const validCells: { row: number; col: number }[] = [];
  const currentDateCells: { row: number; col: number }[] = [];

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 7; col++) {
      if (isValidCalendarCell(row, col)) {
        validCells.push({ row, col });
        
        // Get actual cell content from InitialBoard
        const cellContent = InitialBoard[row] && InitialBoard[row][col] ? InitialBoard[row][col] : '';
        if (cellContent && cellContent !== 'dead' && isHighlightedCurrentDate(cellContent)) {
          currentDateCells.push({ row, col });
        }
      }
    }
  }

  // Condition 2: Current date cells must be uncovered (empty)
  const currentDateUncovered = currentDateCells.every(
    cell => grid[cell.row][cell.col] === null
  );
  if (!currentDateUncovered) {
    return false;
  }

  // Condition 3: All available cells (excluding current date) must be filled
  const availableCells = validCells.filter(
    cell => !currentDateCells.some(
      dateCell => dateCell.row === cell.row && dateCell.col === cell.col
    )
  );
  
  const allAvailableCellsFilled = availableCells.every(
    cell => grid[cell.row][cell.col] !== null
  );
  
  return allAvailableCellsFilled;
};

/**
 * Calculates the total number of available cells (excluding current date)
 */
export const getTotalAvailableCells = (
  isValidCalendarCell: (row: number, col: number) => boolean
): number => {
  let count = 0;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 7; col++) {
      // Get cell value from InitialBoard to check if it's current date
      const cellValue = InitialBoard[row] && InitialBoard[row][col] ? InitialBoard[row][col] : '';
      if (isValidCalendarCell(row, col) && !(cellValue && cellValue !== 'dead' && isHighlightedCurrentDate(cellValue))) {
        count++;
      }
    }
  }
  return count;
};

/**
 * Calculates the number of filled cells (excluding current date)
 */
export const getFilledCells = (
  grid: (string | null)[][],
  isValidCalendarCell: (row: number, col: number) => boolean
): number => {
  let count = 0;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 7; col++) {
      // Get cell value from InitialBoard to check if it's current date
      const cellValue = InitialBoard[row] && InitialBoard[row][col] ? InitialBoard[row][col] : '';
      if (isValidCalendarCell(row, col) && 
          !(cellValue && cellValue !== 'dead' && isHighlightedCurrentDate(cellValue)) &&
          grid[row][col] !== null) {
        count++;
      }
    }
  }
  return count;
};