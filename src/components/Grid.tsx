import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/theme-provider';
import { useIsMobile } from '@/hooks/use-mobile';
import { InitialBoard } from '@/lib/common.js';
import { APP_COLORS } from '@/lib/colors';
import Cell from './Cell';

// Grid dimension constants
const GRID_ROW_COUNT = 8;
const GRID_COL_COUNT = 7;
const DEAD_CELL_MARKER = 'dead';
const EMPTY_CELL_CONTENT = '';

// Grid container styling constants
const GRID_CONTAINER_CLASSNAME = 'inline-block rounded-xl overflow-hidden shadow-sm';
const GRID_INNER_CLASSNAME = 'grid grid-cols-7 gap-0 w-[280px] sm:w-[336px] md:w-[448px] bg-card';

// Props interface for the calendar grid component
interface GridProps {
  grid: (string | null)[][];  // 2D array representing the grid state
  onCellClick?: (pieceId: string) => void;  // Handler for cell clicks - now passes pieceId
  onBoardClick?: (row: number, col: number) => void;  // Handler for board clicks when placing pieces
  onDragOver?: (e: React.DragEvent, row: number, col: number) => void;  // Drag over handler
  onDrop?: (e: React.DragEvent, row: number, col: number) => void;  // Drop handler
  highlightedCells?: { row: number; col: number }[];  // Cells to highlight
  className?: string;  // Additional CSS classes
  placedPieces?: { row: number; col: number }[];  // Positions of placed puzzle pieces
  dragPreview?: { row: number; col: number }[] | null;  // Preview of piece being dragged
  pieceShapes?: Map<string, { row: number; col: number }[]>;  // Map of piece IDs to their shapes
  pieceColors?: Map<string, string>;  // Map of piece IDs to their colors
}

/**
 * Grid - Renders the calendar-based puzzle grid
 *
 * This component creates a calendar layout with months, dates, and days of the week.
 * It handles piece placement, drag/drop interactions, and visual feedback.
 */
const Grid: React.FC<GridProps> = ({
  grid,
  onCellClick,
  onBoardClick,
  onDragOver,
  onDrop,
  highlightedCells = [],
  className,
  placedPieces = [],
  dragPreview = null,
  pieceShapes = new Map(),
  pieceColors = new Map()
}) => {
  // State to track which piece is currently being hovered
  const [hoveredPiece, setHoveredPiece] = useState<string | null>(null);

  /**
   * Determines if a cell should be visible/active
   */
  const isCellVisible = (row: number, col: number) => {
    const isRowInBounds = row >= 0 && row < InitialBoard.length;
    const isColInBounds = col >= 0 && col < InitialBoard[row]?.length;
    if (isRowInBounds && isColInBounds) {
      // Return false for 'dead' cells, true for all others
      return InitialBoard[row][col] !== DEAD_CELL_MARKER;
    }
    return false;
  };

  /**
   * Gets the display content for each cell based on its position
   * Returns month names, dates, or day names depending on the cell location
   */
  const getCellContent = (row: number, col: number) => {
    const isRowInBounds = row >= 0 && row < InitialBoard.length;
    const isColInBounds = col >= 0 && col < InitialBoard[row]?.length;
    if (isRowInBounds && isColInBounds) {
      const content = InitialBoard[row][col];
      const isDead = content === DEAD_CELL_MARKER;
      return isDead ? EMPTY_CELL_CONTENT : content;
    }
    return EMPTY_CELL_CONTENT;
  };

  /**
   * Builds the props for a single cell at the given coordinates.
   * Pre-computes all per-cell logic so the return statement contains no logic.
   */
  const buildCellProps = (row: number, col: number) => {
    const content = getCellContent(row, col);
    const shouldShowContent = isCellVisible(row, col);
    const cellPieceId = grid[row]?.[col] ?? null;
    const isPlacedCell = cellPieceId !== null;
    const isPreviewCell = dragPreview?.some(
      (preview) => preview.row === row && preview.col === col
    ) || false;
    const resolvedPieceColor = cellPieceId
      ? pieceColors.get(cellPieceId) || APP_COLORS.piece.default
      : APP_COLORS.piece.default;

    return {
      key: `${row}-${col}`,
      row,
      col,
      content,
      shouldShowContent,
      isPlacedCell,
      isPreviewCell,
      cellPieceId,
      pieceColor: resolvedPieceColor,
    };
  };

  // Pre-compute the full list of cell prop objects so the JSX has no logic
  const cellPropsList: ReturnType<typeof buildCellProps>[] = [];
  for (let row = 0; row < GRID_ROW_COUNT; row++) {
    for (let col = 0; col < GRID_COL_COUNT; col++) {
      cellPropsList.push(buildCellProps(row, col));
    }
  }

  return (
    <div className={GRID_CONTAINER_CLASSNAME} data-calendar-grid>
      <div className={GRID_INNER_CLASSNAME}>
        {cellPropsList.map((cellProps) => (
          <Cell
            key={cellProps.key}
            row={cellProps.row}
            col={cellProps.col}
            content={cellProps.content}
            shouldShowContent={cellProps.shouldShowContent}
            isPlacedCell={cellProps.isPlacedCell}
            isPreviewCell={cellProps.isPreviewCell}
            cellPieceId={cellProps.cellPieceId}
            pieceColor={cellProps.pieceColor}
            grid={grid}
            onCellClick={onCellClick}
            onBoardClick={onBoardClick}
            onDragOver={onDragOver}
            onDrop={onDrop}
            isCellVisible={isCellVisible}
          />
        ))}
      </div>
    </div>
  );
};

export default Grid;
