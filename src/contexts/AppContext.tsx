import React, { createContext, useContext, useState, useEffect } from 'react';
import { getGameSettings, updateGameSettings } from '@/lib/localStorage';
import { PIECE_COLORS } from '@/lib/colors';
import { AppContextType } from '@/types/interfaces';

// Default context values
const defaultAppContext: AppContextType = {
  sidebarOpen: false,
  toggleSidebar: () => {},
  selectedPieceColor: PIECE_COLORS[0], // Default to teal
  setSelectedPieceColor: () => {},
};

// Create the context with default values
const AppContext = createContext<AppContextType>(defaultAppContext);

/**
 * Custom hook to access the app context
 * Provides easy access to global app state
 */
export const useAppContext = () => useContext(AppContext);

/**
 * AppProvider component that manages global application state
 * Currently handles sidebar visibility state and piece color selection
 */
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State for sidebar visibility
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // State for selected piece color
  const [selectedPieceColor, setSelectedPieceColorState] = useState(() => {
    const { pieceColor } = getGameSettings();
    return PIECE_COLORS.find(color => color.value === pieceColor.value) || PIECE_COLORS[0];
  });

  // Toggle sidebar open/closed state
  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  // Update piece color and save to localStorage
  const setSelectedPieceColor = (color: { name: string; value: string; dark: string }) => {
    setSelectedPieceColorState(color);
    updateGameSettings({ pieceColor: color });
  };

  return (
    <AppContext.Provider
      value={{
        sidebarOpen,
        toggleSidebar,
        selectedPieceColor,
        setSelectedPieceColor,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};