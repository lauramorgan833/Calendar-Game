import React from 'react';
import { cn } from '@/lib/utils';
import { useAppContext } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/theme-provider';

// Props interface for individual puzzle piece component
interface PieceProps {
  id: string;
  shape: boolean[][];
  color: string;
  position: { x: number; y: number };
  isSelected: boolean;
  isDragging: boolean;
  isPlaced: boolean;
  onClick: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onTouchStart?: (e: React.TouchEvent) => void;
  onTouchMove?: (e: React.TouchEvent) => void;
  onTouchEnd?: (e: React.TouchEvent) => void;
}

/**
 * Piece - Renders an individual puzzle piece with user-selected color
 */
const Piece: React.FC<PieceProps> = ({
  id,
  shape,
  color,
  position,
  isSelected,
  isDragging,
  isPlaced,
  onClick,
  onDragStart,
  onDragEnd,
  onTouchStart,
  onTouchMove,
  onTouchEnd
}) => {
  const { selectedPieceColor } = useAppContext();
  const { theme } = useTheme();
  
  // Don't render pieces that have been placed on the board
  if (isPlaced) return null;

  /**
   * Creates an SVG path for the piece outline
   */
  const createShapePath = () => {
    let path = '';
    
    shape.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell) {
          const x = colIndex;
          const y = rowIndex;
          
          const hasTop = rowIndex > 0 && shape[rowIndex - 1]?.[colIndex];
          const hasBottom = rowIndex < shape.length - 1 && shape[rowIndex + 1]?.[colIndex];
          const hasLeft = colIndex > 0 && shape[rowIndex]?.[colIndex - 1];
          const hasRight = colIndex < row.length - 1 && shape[rowIndex]?.[colIndex + 1];
          
          if (!hasTop) path += ` M ${x} ${y} L ${x + 1} ${y}`;
          if (!hasRight) path += ` M ${x + 1} ${y} L ${x + 1} ${y + 1}`;
          if (!hasBottom) path += ` M ${x + 1} ${y + 1} L ${x} ${y + 1}`;
          if (!hasLeft) path += ` M ${x} ${y + 1} L ${x} ${y}`;
        }
      });
    });
    
    return path;
  };
  
  const width = shape[0]?.length || 1;
  const height = shape.length;
  
  // Get responsive cell size - adjusted for better mobile/web balance
  const getCellSize = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth >= 1024) return 26; // lg and up - smaller for web
      if (window.innerWidth >= 768) return 24; // md - slightly smaller
      if (window.innerWidth >= 640) return 20; // sm - keep same
      return 14; // mobile - bigger for mobile
    }
    return 14; // fallback
  };
  
  const cellSize = getCellSize();
  
  // Force re-render on window resize to update cell size
  const [, forceUpdate] = React.useReducer(x => x + 1, 0);
  
  React.useEffect(() => {
    const handleResize = () => forceUpdate();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Further improved dark mode color contrast - brighter unselected pieces
  const isDarkMode = theme === 'dark';
  const fillColor = isSelected 
    ? (isDarkMode ? selectedPieceColor.value : selectedPieceColor.dark)
    : (isDarkMode ? selectedPieceColor.dark + 'D0' : selectedPieceColor.value + '90');
  const strokeColor = selectedPieceColor.dark;
  
  const shadowId = `shadow-${id}`;
  const dragShadowId = `drag-shadow-${id}`;
  
  return (
    <div
      className={cn(
        "cursor-pointer transition-opacity duration-200 select-none inline-block p-1 m-1",
        isDragging && "opacity-30"
      )}
      draggable
      onClick={onClick}
      onDragStart={(e) => {
        console.log('Drag start for piece:', id);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', id);
        console.log('Set dataTransfer data:', id);
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="relative inline-block">
        <svg 
          width={`${width * cellSize}px`}
          height={`${height * cellSize}px`}
          viewBox={`0 0 ${width} ${height}`}
          className="overflow-visible"
        >
          <defs>
            <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0.05" dy="0.05" stdDeviation="0.02" floodOpacity="0.3"/>
            </filter>
            <filter id={dragShadowId} x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0.08" dy="0.08" stdDeviation="0.04" floodOpacity="0.4"/>
            </filter>
          </defs>
          
          <g filter={`url(#${isDragging ? dragShadowId : shadowId})`}>
            {shape.map((row, rowIndex) =>
              row.map((cell, colIndex) => 
                cell ? (
                  <rect
                    key={`${rowIndex}-${colIndex}`}
                    x={colIndex}
                    y={rowIndex}
                    width={1}
                    height={1}
                    fill={fillColor}
                  />
                ) : null
              )
            )}
          </g>
          
          <path
            d={createShapePath()}
            fill="none"
            stroke={strokeColor}
            strokeWidth="0.1"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    </div>
  );
};

export default Piece;