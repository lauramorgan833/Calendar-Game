import React from 'react';
import { useAppContext } from '@/contexts/AppContext';

interface TouchDragPreviewProps {
  piece: {
    id: string;
    shape: boolean[][];
    color: string;
  };
  position: { x: number; y: number };
}

const TouchDragPreview: React.FC<TouchDragPreviewProps> = ({ piece, position }) => {
  const { selectedPieceColor } = useAppContext();
  
  const width = piece.shape[0]?.length || 1;
  const height = piece.shape.length;
  const cellSize = 20; // Fixed size for drag preview
  
  const createShapePath = () => {
    let path = '';
    
    piece.shape.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell) {
          const x = colIndex;
          const y = rowIndex;
          
          const hasTop = rowIndex > 0 && piece.shape[rowIndex - 1]?.[colIndex];
          const hasBottom = rowIndex < piece.shape.length - 1 && piece.shape[rowIndex + 1]?.[colIndex];
          const hasLeft = colIndex > 0 && piece.shape[rowIndex]?.[colIndex - 1];
          const hasRight = colIndex < row.length - 1 && piece.shape[rowIndex]?.[colIndex + 1];
          
          if (!hasTop) path += ` M ${x} ${y} L ${x + 1} ${y}`;
          if (!hasRight) path += ` M ${x + 1} ${y} L ${x + 1} ${y + 1}`;
          if (!hasBottom) path += ` M ${x + 1} ${y + 1} L ${x} ${y + 1}`;
          if (!hasLeft) path += ` M ${x} ${y + 1} L ${x} ${y}`;
        }
      });
    });
    
    return path;
  };

  return (
    <div
      className="fixed pointer-events-none z-50 opacity-80"
      style={{
        left: position.x - (width * cellSize) / 2,
        top: position.y - (height * cellSize) / 2,
        transform: 'translate(-50%, -50%)'
      }}
    >
      <svg 
        width={`${width * cellSize}px`}
        height={`${height * cellSize}px`}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
      >
        <defs>
          <filter id={`drag-preview-shadow-${piece.id}`} x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0.1" dy="0.1" stdDeviation="0.05" floodOpacity="0.5"/>
          </filter>
        </defs>
        
        <g filter={`url(#drag-preview-shadow-${piece.id})`}>
          {piece.shape.map((row, rowIndex) =>
            row.map((cell, colIndex) => 
              cell ? (
                <rect
                  key={`${rowIndex}-${colIndex}`}
                  x={colIndex}
                  y={rowIndex}
                  width={1}
                  height={1}
                  fill={selectedPieceColor.value}
                />
              ) : null
            )
          )}
        </g>
        
        <path
          d={createShapePath()}
          fill="none"
          stroke={selectedPieceColor.dark}
          strokeWidth="0.1"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
};

export default TouchDragPreview;