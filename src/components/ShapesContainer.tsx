import React from 'react';
import Piece from './Piece';
import PuzzleGameTransforms from './Transform';
import { Button } from '@/components/ui/button';
import { Share2, RotateCcw } from 'lucide-react';

// Props interface for the shapes container component
interface ShapesContainerProps {
  pieces: any[];  // Array of puzzle pieces with their properties
  selectedPiece: string | null;  // ID of currently selected piece
  draggedPiece: string | null;  // ID of piece being dragged
  gameWon: boolean;  // Whether the puzzle has been completed
  moves: number;  // Number of moves made by the player
  setSelectedPiece: (id: string | null) => void;  // Handler to select/deselect pieces
  handleDragStart: (id: string) => void;  // Handler for starting drag operation
  handleDragEnd: () => void;  // Handler for ending drag operation
  handleTouchStart?: (e: React.TouchEvent, pieceId: string) => void;  // Touch start handler
  handleTouchMove?: (e: React.TouchEvent) => void;  // Touch move handler
  handleTouchEnd?: (e: React.TouchEvent) => void;  // Touch end handler
  onTransform?: (pieceId: string, transform: (shape: boolean[][]) => boolean[][]) => void;  // Optional transform handler
}

/**
 * ShapesContainer - Renders the container with unused puzzle pieces
 * 
 * This component displays:
 * - Transform controls for rotating/flipping selected pieces
 * - Flex container of available puzzle pieces that wrap to new rows
 * - Victory screen when the puzzle is completed
 * 
 * The container serves as the "inventory" of pieces that haven't been placed yet.
 */
const ShapesContainer: React.FC<ShapesContainerProps> = ({
  pieces,
  selectedPiece,
  draggedPiece,
  gameWon,
  moves,
  setSelectedPiece,
  handleDragStart,
  handleDragEnd,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
  onTransform
}) => {
  return (
    <div className="h-full flex flex-col max-h-full">
      {/* Transform buttons - mobile optimized */}
      {onTransform && !gameWon && (
        <div className="flex-shrink-0 flex justify-center mb-2 md:mb-4">
          <PuzzleGameTransforms 
            selectedPiece={selectedPiece}
            onTransform={onTransform}
          />
        </div>
      )}
      
      {/* Pieces container - improved mobile constraints */}
      <div className="flex-1 min-h-0 max-h-full">
        <div className="flex flex-wrap gap-1 md:gap-2 justify-center p-1 md:p-2 pb-4 md:pb-2">
          {pieces.filter(piece => !piece.isPlaced).map(piece => (
            <div key={piece.id} className="flex-shrink-0">
              <Piece
                id={piece.id}
                shape={piece.shape}
                color={piece.color}
                position={piece.position}
                isSelected={selectedPiece === piece.id}
                isDragging={draggedPiece === piece.id}
                isPlaced={piece.isPlaced}
                onClick={() => setSelectedPiece(selectedPiece === piece.id ? null : piece.id)}
                onDragStart={() => handleDragStart(piece.id)}
                onDragEnd={handleDragEnd}
                onTouchStart={(e) => handleTouchStart?.(e, piece.id)}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShapesContainer;