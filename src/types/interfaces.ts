/**
 * Core data structure interfaces for the Calendle puzzle game application
 */

// Game Statistics Interfaces
export interface GameStats {
  gamesPlayed: number;      // Total number of games attempted
  gamesWon: number;         // Total number of games completed successfully
  currentStreak: number;    // Current consecutive wins
  maxStreak: number;        // Longest consecutive win streak
  averageScore: number;     // Average moves to complete games
  bestScore: number;        // Fewest moves to complete a game
  totalScore: number;       // Sum of all game scores
  lastPlayedDate: string | null;  // Date of last game (prevents multiple plays per day)
  winPercentage: number;    // Percentage of games won
  dailyStats: DailyStats[]; // Array of daily performance data
}

export interface DailyStats {
  date: string;             // Date in YYYY-MM-DD format
  score: number;            // Moves taken to complete
  completed: boolean;       // Whether the puzzle was completed
  timeSpent: number;        // Time spent in seconds (future feature)
}

// Game Settings Interface
export interface GameSettings {
  theme: 'light' | 'dark' | 'system';
  pieceColor: { name: string; value: string; dark: string };
}

// Puzzle Game Interfaces
export interface Piece {
  id: string;
  shape: boolean[][]; // 2D array representing the piece's shape
  color: string;
  position: { x: number; y: number };
  isPlaced: boolean;
}

export interface GameState {
  grid: (string | null)[][];
  pieces: Piece[];
  selectedPiece: string | null;
  score: number;
  isComplete: boolean;
}

// Animation Interfaces
export interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  shape: boolean[][];
  scale: number;
  scaleSpeed: number;
  opacity: number;
  angularVelocity: number;
  spiralRadius: number;
  spiralAngle: number;
  cellSize: number;
}

export interface AppContextType {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  selectedPieceColor: { name: string; value: string; dark: string };
  setSelectedPieceColor: (color: { name: string; value: string; dark: string }) => void;
}
}