import React, { useState } from 'react';
import { useGameStats } from '@/hooks/useGameStats';
import PuzzleGameMain from './PuzzleGameMain';
import StatsPanel from './Header/StatsPanel';
import SettingsPanel from './Header/SettingsPanel';
import HelpPanel from './Header/HelpPanel';
import Header from './Header/Header';
import { toast } from '@/components/ui/use-toast';
import { useTheme } from '@/contexts/theme-provider';
import { APP_COLORS } from '@/lib/colors';

// Theme constants
const THEME_DARK = 'dark';

// Timing constants
const STATS_PANEL_OPEN_DELAY_MS = 2000;

// Toast message constants
const CLEAR_DATA_TOAST_TITLE = 'Data Cleared';
const CLEAR_DATA_TOAST_DESCRIPTION = 'All game statistics have been reset.';

// ClassName constants
const LOADING_CONTAINER_CLASSNAME = 'h-dvh flex items-center justify-center bg-background';
const LOADING_TEXT_CLASSNAME = 'text-lg text-foreground';
const APP_CONTAINER_CLASSNAME = 'h-dvh flex flex-col';
const MAIN_CLASSNAME = 'flex-1 container mx-auto px-2 md:px-4 py-1 md:py-2 overflow-hidden min-h-0 max-w-full mb-safe bg-background';

// Loading message constant
const LOADING_MESSAGE = 'Loading...';

// Game outcome constant
const GAME_WON = true;

/**
 * Main application layout component that orchestrates the entire app structure
 * Manages modal states, game statistics, and handles game completion events
 */
const AppLayout: React.FC = () => {
  // Theme hook for light/dark mode switching
  const { theme } = useTheme();

  // Game statistics hook for tracking user progress with localStorage
  const { stats, updateStats, clearStats, isLoading } = useGameStats();

  // Modal visibility states
  const [showStats, setShowStats] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  /**
   * Handles game completion events
   * Updates statistics with localStorage persistence and shows toast notification
   */
  const handleGameComplete = (score: number) => {
    updateStats(GAME_WON, score);

    // Set timer to open stats panel after a delay
    setTimeout(() => {
      setShowStats(true);
    }, STATS_PANEL_OPEN_DELAY_MS);
  };

  /**
   * Clears all user data from localStorage and shows confirmation toast
   */
  const handleClearData = () => {
    clearStats();
    toast({ title: CLEAR_DATA_TOAST_TITLE, description: CLEAR_DATA_TOAST_DESCRIPTION });
    setShowSettings(false);
  };

  // Pre-defined handlers — no inline arrow logic in the return statement
  const handleOpenStats = () => setShowStats(true);
  const handleCloseStats = () => setShowStats(false);
  const handleOpenSettings = () => setShowSettings(true);
  const handleCloseSettings = () => setShowSettings(false);
  const handleOpenHelp = () => setShowHelp(true);
  const handleCloseHelp = () => setShowHelp(false);
  const handleMenuClick = () => { };

  // Show loading state while stats are being loaded from localStorage
  if (isLoading) {
    return (
      <div className={LOADING_CONTAINER_CLASSNAME}>
        <div className={LOADING_TEXT_CLASSNAME}>{LOADING_MESSAGE}</div>
      </div>
    );
  }

  // Determine background color based on theme — pre-computed before return
  const isDarkTheme = theme === THEME_DARK;
  const backgroundColor = isDarkTheme
    ? APP_COLORS.background.dark.section
    : APP_COLORS.background.light.section;
  const containerStyle = { backgroundColor };

  return (
    <div className={APP_CONTAINER_CLASSNAME} style={containerStyle}>
      {/* App header with navigation buttons */}
      <Header
        onStatsClick={handleOpenStats}
        onSettingsClick={handleOpenSettings}
        onHelpClick={handleOpenHelp}
        onMenuClick={handleMenuClick}
      />

      {/* Main game content area - uses remaining viewport height with safe area padding */}
      <main className={MAIN_CLASSNAME}>
        <PuzzleGameMain onGameComplete={handleGameComplete} />
      </main>

      {/* Modal panels for stats, settings, and help */}
      <StatsPanel stats={stats} isOpen={showStats} onClose={handleCloseStats} />
      <SettingsPanel isOpen={showSettings} onClose={handleCloseSettings} onClearData={handleClearData} />
      <HelpPanel isOpen={showHelp} onClose={handleCloseHelp} />
    </div>
  );
};

export default AppLayout;
