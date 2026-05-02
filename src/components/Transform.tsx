import React from 'react';
import { Button } from '@/components/ui/button';
import { RotateCw, RotateCcw, ArrowUp, ArrowRight } from 'lucide-react';

// Props interface for the transform controls component
interface PuzzleGameTransformsProps {
  selectedPiece: string | null;  // ID of currently selected piece
  onTransform: (pieceId: string, transform: (shape: boolean[][]) => boolean[][]) => void;  // Transform handler
}

/**
 * Rotates a piece shape 90 degrees clockwise
 * Transforms the 2D boolean array by swapping and flipping coordinates
 * NOTE: This creates a new transformed shape without modifying the original permanent shape
 */
const rotateShapeClockwise = (shape: boolean[][]): boolean[][] => {
  const rows = shape.length;
  const cols = shape[0].length;
  // Create new array with swapped dimensions (cols become rows)
  const rotated = Array(cols).fill(null).map(() => Array(rows).fill(false));
  
  // Map each cell to its new rotated position
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // Clockwise rotation: (r,c) -> (c, rows-1-r)
      rotated[c][rows - 1 - r] = shape[r][c];
    }
  }
  return rotated;
};

/**
 * Rotates a piece shape 90 degrees counterclockwise
 * Transforms the 2D boolean array by swapping and flipping coordinates
 * NOTE: This creates a new transformed shape without modifying the original permanent shape
 */
const rotateShapeCounterclockwise = (shape: boolean[][]): boolean[][] => {
  const rows = shape.length;
  const cols = shape[0].length;
  // Create new array with swapped dimensions
  const rotated = Array(cols).fill(null).map(() => Array(rows).fill(false));
  
  // Map each cell to its new rotated position
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // Counterclockwise rotation: (r,c) -> (cols-1-c, r)
      rotated[cols - 1 - c][r] = shape[r][c];
    }
  }
  return rotated;
};

/**
 * Flips a piece shape horizontally (left-right mirror)
 * Reverses the order of columns in each row
 * NOTE: This creates a new transformed shape without modifying the original permanent shape
 */
const flipShapeHorizontal = (shape: boolean[][]): boolean[][] => {
  return shape.map(row => [...row].reverse());
};

/**
 * Flips a piece shape vertically (top-bottom mirror)
 * Reverses the order of rows
 * NOTE: This creates a new transformed shape without modifying the original permanent shape
 */
const flipShapeVertical = (shape: boolean[][]): boolean[][] => {
  return [...shape].reverse();
};

/**
 * PuzzleGameTransforms - Renders transformation controls for puzzle pieces
 * 
 * This component provides buttons to rotate and flip the selected puzzle piece.
 * All buttons are disabled when no piece is selected, providing clear visual feedback.
 * 
 * IMPORTANT: These transformations only affect the current working copy of the piece shape.
 * The original permanent shapes defined in PuzzleGameMain remain unchanged.
 * 
 * Available transformations:
 * - Counterclockwise rotation (90°)
 * - Vertical flip (mirror top-bottom)
 * - Horizontal flip (mirror left-right)
 * - Clockwise rotation (90°)
 */
const PuzzleGameTransforms: React.FC<PuzzleGameTransformsProps> = ({ selectedPiece, onTransform }) => {
  // Check if a piece is currently selected
  const hasSelectedPiece = !!selectedPiece;
  
  // Transform button configurations
  const transformButtons = [
    { 
      transform: rotateShapeCounterclockwise, 
      icon: RotateCcw, 
      label: 'Rotate counterclockwise' 
    },
    { 
      transform: flipShapeVertical, 
      icon: ArrowUp, 
      label: 'Flip vertically' 
    },
    { 
      transform: flipShapeHorizontal, 
      icon: ArrowRight, 
      label: 'Flip horizontally' 
    },
    { 
      transform: rotateShapeClockwise, 
      icon: RotateCw, 
      label: 'Rotate clockwise' 
    }
  ];
  
  return (
    <div className="flex gap-2 justify-center">
      {transformButtons.map(({ transform, icon: Icon, label }, index) => (
        <Button 
          key={index}
          size="sm" 
          variant={hasSelectedPiece ? "default" : "ghost"}
          className={hasSelectedPiece 
            ? "bg-gray-700 hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500" 
            : "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400"
          }
          disabled={!hasSelectedPiece}
          onClick={() => hasSelectedPiece && onTransform(selectedPiece, transform)}
          title={label}
        >
          <Icon className="w-4 h-4" />
        </Button>
      ))}
    </div>
  );
};


/**
 * Applies a transformation to a puzzle piece
 */
export const handleTransform = (
  pieceId: string,
  transform: (shape: boolean[][]) => boolean[][],
  setPieces: React.Dispatch<React.SetStateAction<any[]>>
) => {
  setPieces(prev => prev.map(piece => 
    piece.id === pieceId && !piece.isPlaced
      ? { ...piece, shape: transform(piece.shape) }
      : piece
  ));
};

export default PuzzleGameTransforms;