import React from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/theme-provider';
import { useIsMobile } from '@/hooks/use-mobile';
import { APP_COLORS } from '@/lib/colors';
import { Months, DaysOfWeek } from '@/lib/common.js';

// Border width constants
const BORDER_WIDTH_MOBILE = '0.75px';
const BORDER_WIDTH_DESKTOP = '1px';
const BORDER_WIDTH_PERIMETER = '1.5px';
const BORDER_WIDTH_HIDDEN = '0px';

// Grid dimension constants
const GRID_LAST_ROW_INDEX = 7;
const GRID_LAST_COL_INDEX = 6;
const GRID_BOTTOM_EDGE_START_COL = 4;
const GRID_FIRST_ROW_INDEX = 0;
const GRID_FIRST_COL_INDEX = 0;

// Style constants
const CELL_ASPECT_RATIO = '1';
const BORDER_STYLE_SOLID = 'solid';
const BACKGROUND_TRANSPARENT = 'transparent';

interface CellProps {
  row: number;
  col: number;
  content: string;
  shouldShowContent: boolean;
  isPlacedCell: boolean;
  isPreviewCell: boolean;
  cellPieceId: string | null;
  pieceColor: string;
  grid: (string | null)[][];
  onCellClick?: (pieceId: string) => void;
  onBoardClick?: (row: number, col: number) => void;
  onDragOver?: (e: React.DragEvent, row: number, col: number) => void;
  onDrop?: (e: React.DragEvent, row: number, col: number) => void;
  isCellVisible: (row: number, col: number) => boolean;
}

const Cell: React.FC<CellProps> = ({
  row, col, content, shouldShowContent, isPlacedCell, isPreviewCell,
  cellPieceId, pieceColor, grid, onCellClick, onBoardClick, onDragOver, onDrop,
  isCellVisible
}) => {
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  const isLightMode = theme === 'light' || (theme === 'system' && !window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Standard border width depends on device type — used in many places
  const standardBorderWidth = isMobile ? BORDER_WIDTH_MOBILE : BORDER_WIDTH_DESKTOP;
  const borderColor = isLightMode ? APP_COLORS.border.light : APP_COLORS.border.dark;

  const isHighlighted = () => {
    if (!content) return false;
    const date = new Date();
    const currentDate = date.getDate().toString();
    const currentMonth = Months[date.getMonth()];
    const currentDayOfWeek = DaysOfWeek[date.getDay()];
    return content === currentDate || content === currentMonth || content === currentDayOfWeek;
  };

  const getPieceBorderOverrides = (pieceId: string) => {
    const topSame = row > GRID_FIRST_ROW_INDEX && grid[row - 1]?.[col] === pieceId;
    const bottomSame = row < grid.length - 1 && grid[row + 1]?.[col] === pieceId;
    const leftSame = col > GRID_FIRST_COL_INDEX && grid[row]?.[col - 1] === pieceId;
    const rightSame = col < grid[row].length - 1 && grid[row]?.[col + 1] === pieceId;

    const isTopEdge = row === GRID_FIRST_ROW_INDEX;
    const isBottomEdge = row === GRID_LAST_ROW_INDEX && col >= GRID_BOTTOM_EDGE_START_COL;
    const isLeftEdge = col === GRID_FIRST_COL_INDEX;
    const isRightEdge = col === GRID_LAST_COL_INDEX;

    const borderTopWidth = topSame
      ? BORDER_WIDTH_HIDDEN
      : isTopEdge ? BORDER_WIDTH_PERIMETER : standardBorderWidth;
    const borderBottomWidth = bottomSame
      ? BORDER_WIDTH_HIDDEN
      : isBottomEdge ? BORDER_WIDTH_PERIMETER : standardBorderWidth;
    const borderLeftWidth = leftSame
      ? BORDER_WIDTH_HIDDEN
      : isLeftEdge ? BORDER_WIDTH_PERIMETER : standardBorderWidth;
    const borderRightWidth = rightSame
      ? BORDER_WIDTH_HIDDEN
      : isRightEdge ? BORDER_WIDTH_PERIMETER : standardBorderWidth;

    return {
      borderStyle: BORDER_STYLE_SOLID,
      borderTopColor: borderColor,
      borderBottomColor: borderColor,
      borderLeftColor: borderColor,
      borderRightColor: borderColor,
      borderTopWidth,
      borderBottomWidth,
      borderLeftWidth,
      borderRightWidth,
    };
  };

  const createInactiveCellStyle = () => {
    const needsRightBorder = col < GRID_LAST_COL_INDEX && isCellVisible(row, col + 1);
    const needsLeftBorder = col > GRID_FIRST_COL_INDEX && isCellVisible(row, col - 1);
    const needsTopBorder = row > GRID_FIRST_ROW_INDEX && isCellVisible(row - 1, col);
    const needsBottomBorder = row < GRID_LAST_ROW_INDEX && isCellVisible(row + 1, col);

    const borderTopWidth = needsTopBorder ? standardBorderWidth : BORDER_WIDTH_HIDDEN;
    const borderBottomWidth = needsBottomBorder ? standardBorderWidth : BORDER_WIDTH_HIDDEN;
    const borderLeftWidth = needsLeftBorder ? standardBorderWidth : BORDER_WIDTH_HIDDEN;
    const borderRightWidth = needsRightBorder ? standardBorderWidth : BORDER_WIDTH_HIDDEN;

    const textColor = isLightMode ? APP_COLORS.cell.text.light : APP_COLORS.cell.text.dark;

    return {
      aspectRatio: CELL_ASPECT_RATIO,
      backgroundColor: BACKGROUND_TRANSPARENT,
      borderStyle: BORDER_STYLE_SOLID,
      borderTopWidth,
      borderBottomWidth,
      borderLeftWidth,
      borderRightWidth,
      borderTopColor: borderColor,
      borderBottomColor: borderColor,
      borderLeftColor: borderColor,
      borderRightColor: borderColor,
      color: textColor,
    };
  };

  const createActiveCellStyle = () => {
    const defaultBackgroundColor = isLightMode ? APP_COLORS.background.light.grid : APP_COLORS.background.dark.grid;
    const highlighted = isHighlighted();

    // Determine background color
    let cellBackgroundColor;
    if (isPreviewCell) {
      cellBackgroundColor = APP_COLORS.cell.preview;
    } else if (isPlacedCell) {
      cellBackgroundColor = pieceColor;
    } else if (highlighted) {
      cellBackgroundColor = APP_COLORS.cell.highlight;
    } else {
      cellBackgroundColor = defaultBackgroundColor;
    }

    // Determine text color
    let textColor;
    if (isPlacedCell || highlighted) {
      textColor = APP_COLORS.cell.text.light;
    } else if (isLightMode) {
      textColor = APP_COLORS.cell.text.light;
    } else {
      textColor = APP_COLORS.cell.text.dark;
    }

    // Determine border widths based on perimeter position
    const isTopEdge = row === GRID_FIRST_ROW_INDEX;
    const isBottomEdge = row === GRID_LAST_ROW_INDEX && col >= GRID_BOTTOM_EDGE_START_COL;
    const isLeftEdge = col === GRID_FIRST_COL_INDEX;
    const isRightEdge = col === GRID_LAST_COL_INDEX;

    const borderTopWidth = isTopEdge ? BORDER_WIDTH_PERIMETER : standardBorderWidth;
    const borderBottomWidth = isBottomEdge ? BORDER_WIDTH_PERIMETER : standardBorderWidth;
    const borderLeftWidth = isLeftEdge ? BORDER_WIDTH_PERIMETER : standardBorderWidth;
    const borderRightWidth = isRightEdge ? BORDER_WIDTH_PERIMETER : standardBorderWidth;

    const baseStyle = {
      aspectRatio: CELL_ASPECT_RATIO,
      backgroundColor: cellBackgroundColor,
      color: textColor,
      borderStyle: BORDER_STYLE_SOLID,
      borderTopWidth,
      borderBottomWidth,
      borderLeftWidth,
      borderRightWidth,
      borderTopColor: borderColor,
      borderBottomColor: borderColor,
      borderLeftColor: borderColor,
      borderRightColor: borderColor,
    };

    // Add piece border overrides if placed cell
    if (isPlacedCell && cellPieceId) {
      Object.assign(baseStyle, getPieceBorderOverrides(cellPieceId));
    }

    // Add border adjustments for non-placed cells
    if (!isPlacedCell) {
      const adjustments: Record<string, string> = {};
      const rightHasPiece = col < GRID_LAST_COL_INDEX && grid[row]?.[col + 1] !== null;
      const leftHasPiece = col > GRID_FIRST_COL_INDEX && grid[row]?.[col - 1] !== null;
      const topHasPiece = row > GRID_FIRST_ROW_INDEX && grid[row - 1]?.[col] !== null;
      const bottomHasPiece = row < GRID_LAST_ROW_INDEX && grid[row + 1]?.[col] !== null;

      if (rightHasPiece && col !== GRID_LAST_COL_INDEX) adjustments.borderRightWidth = standardBorderWidth;
      if (leftHasPiece && col !== GRID_FIRST_COL_INDEX) adjustments.borderLeftWidth = standardBorderWidth;
      if (topHasPiece && row !== GRID_FIRST_ROW_INDEX) adjustments.borderTopWidth = standardBorderWidth;
      if (bottomHasPiece && row !== GRID_LAST_ROW_INDEX) adjustments.borderBottomWidth = standardBorderWidth;

      Object.assign(baseStyle, adjustments);
    }

    return baseStyle;
  };


  // Pre-compute all values used in the return statement — no logic in JSX
  const cellKey = `${row}-${col}`;
  const inactiveCellStyle = createInactiveCellStyle();
  const activeCellStyle = createActiveCellStyle();

  const inactiveClassName = "flex items-center justify-center relative min-w-0";
  const activeBaseClassName = "flex items-center justify-center text-xs md:text-sm font-medium relative min-w-0";
  const activeInteractiveClassName = "cursor-pointer !transition-none";
  const activeClassName = cn(
    activeBaseClassName,
    shouldShowContent && activeInteractiveClassName
  );

  const shouldRenderContent = !isPlacedCell;
  const cellContent = shouldRenderContent ? content : null;

  const handleClick = () => {
    if (cellPieceId) {
      onCellClick?.(cellPieceId);
    } else {
      onBoardClick?.(row, col);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDragOver?.(e, row, col);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDrop?.(e, row, col);
  };

  // For inactive cells
  if (!shouldShowContent) {
    return (
      <div
        key={cellKey}
        className={inactiveClassName}
        style={inactiveCellStyle}
      />
    );
  }

  return (
    <div
      key={cellKey}
      className={activeClassName}
      style={activeCellStyle}
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {cellContent}
    </div>
  );
};

export default Cell;
