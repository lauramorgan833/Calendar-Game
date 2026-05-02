import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { GameStats } from '@/hooks/useGameStats';
import { TrendingUp } from 'lucide-react';
import ScoreChart from './ScoreChart';

// =============================================================================
// Module-level constants — no inline strings/numbers in JSX
// =============================================================================

// Sheet / layout classNames
const SHEET_CONTENT_CLASS =
  'w-full sm:w-[400px] max-w-[90vw] p-0 !transition-none bg-background text-foreground';
const SHEET_HEADER_CLASS = 'p-4 sm:p-6 pb-0';
const SHEET_TITLE_CLASS = 'flex items-center gap-2';
const SHEET_TITLE_ICON_CLASS = 'h-5 w-5';
const SCROLL_AREA_CLASS =
  'h-[calc(100vh-80px)] px-4 sm:px-6 overflow-y-auto';
const STATS_WRAPPER_CLASS =
  'space-y-4 max-h-[calc(100vh-80px)] overflow-y-auto pr-2';
const STATS_GRID_CLASS = 'grid grid-cols-2 gap-4';

// Stat card classNames (theme-aware: uses Card's bg-card token, with explicit
// dark variant for the colored numeric value so it's readable in dark mode)
const STAT_CARD_CLASS = 'p-4 text-center';
const STAT_VALUE_CLASS =
  'text-xl font-bold text-[#3d7f92] dark:text-[#5d9caa]';
const STAT_LABEL_CLASS = 'text-xs text-muted-foreground';

// Footer / "playing since" classNames
const FOOTER_WRAPPER_CLASS = 'text-center pt-4 border-t border-border';
const FOOTER_TEXT_CLASS = 'text-xs text-muted-foreground';

// UI strings
const PANEL_TITLE = 'Your Statistics';
const LABEL_GAMES_PLAYED = 'Games Played';
const LABEL_WIN_RATE = 'Win Rate';
const LABEL_CURRENT_STREAK = 'Current Streak';
const LABEL_MAX_STREAK = 'Max Streak';
const LABEL_AVERAGE_SCORE = 'Average Score';
const LABEL_BEST_SCORE = 'Best Score';
const EMPTY_VALUE_DASH = '-';

// Defaults
const DEFAULT_TIME_FILTER_DAYS = 30;
const DEFAULT_VIEW_MODE: 'timeline' | 'buckets' = 'buckets';

// =============================================================================
// Types
// =============================================================================

interface StatsPanelProps {
  stats: GameStats;
  isOpen: boolean;
  onClose: () => void;
}

// =============================================================================
// Component
// =============================================================================

const StatsPanel: React.FC<StatsPanelProps> = ({ stats, isOpen, onClose }) => {
  const [timeFilter, setTimeFilter] = useState(DEFAULT_TIME_FILTER_DAYS);
  const [viewMode, setViewMode] = useState<'timeline' | 'buckets'>(
    DEFAULT_VIEW_MODE
  );

  // Pre-computed conditional flags (no logic in return)
  const completedDailyStats = (stats.dailyStats || []).filter((d) => d.completed);
  const hasChartData = completedDailyStats.length > 0;
  const hasAnyDailyStats = (stats.dailyStats || []).length > 0;
  const playingSinceText = hasAnyDailyStats
    ? `Playing since ${new Date(stats.dailyStats[0].date).toLocaleDateString()} • ${stats.dailyStats.length} days tracked`
    : '';

  // Pre-computed display values
  const winPercentageText = `${stats.winPercentage}%`;
  const bestScoreText = stats.bestScore || EMPTY_VALUE_DASH;

  // Pre-built JSX subsections
  const chartNode = hasChartData ? (
    <ScoreChart
      dailyStats={stats.dailyStats}
      timeFilter={timeFilter}
      onTimeFilterChange={setTimeFilter}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
    />
  ) : null;

  const footerNode = hasAnyDailyStats ? (
    <div className={FOOTER_WRAPPER_CLASS}>
      <div className={FOOTER_TEXT_CLASS}>{playingSinceText}</div>
    </div>
  ) : null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className={SHEET_CONTENT_CLASS}>
        <SheetHeader className={SHEET_HEADER_CLASS}>
          <SheetTitle className={SHEET_TITLE_CLASS}>
            <TrendingUp className={SHEET_TITLE_ICON_CLASS} />
            {PANEL_TITLE}
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className={SCROLL_AREA_CLASS}>
          <div className={STATS_WRAPPER_CLASS}>
            {/* Main stats grid - 2x2 */}
            <div className={STATS_GRID_CLASS}>
              <Card className={STAT_CARD_CLASS}>
                <div className={STAT_VALUE_CLASS}>{stats.gamesPlayed}</div>
                <div className={STAT_LABEL_CLASS}>{LABEL_GAMES_PLAYED}</div>
              </Card>

              <Card className={STAT_CARD_CLASS}>
                <div className={STAT_VALUE_CLASS}>{winPercentageText}</div>
                <div className={STAT_LABEL_CLASS}>{LABEL_WIN_RATE}</div>
              </Card>

              <Card className={STAT_CARD_CLASS}>
                <div className={STAT_VALUE_CLASS}>{stats.currentStreak}</div>
                <div className={STAT_LABEL_CLASS}>{LABEL_CURRENT_STREAK}</div>
              </Card>

              <Card className={STAT_CARD_CLASS}>
                <div className={STAT_VALUE_CLASS}>{stats.maxStreak}</div>
                <div className={STAT_LABEL_CLASS}>{LABEL_MAX_STREAK}</div>
              </Card>
            </div>

            {/* Performance metrics */}
            <div className={STATS_GRID_CLASS}>
              <Card className={STAT_CARD_CLASS}>
                <div className={STAT_VALUE_CLASS}>{stats.averageScore}</div>
                <div className={STAT_LABEL_CLASS}>{LABEL_AVERAGE_SCORE}</div>
              </Card>

              <Card className={STAT_CARD_CLASS}>
                <div className={STAT_VALUE_CLASS}>{bestScoreText}</div>
                <div className={STAT_LABEL_CLASS}>{LABEL_BEST_SCORE}</div>
              </Card>
            </div>

            {chartNode}
            {footerNode}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default StatsPanel;
