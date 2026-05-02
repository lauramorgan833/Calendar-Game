import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { GameStats } from '@/hooks/useGameStats';
import { TrendingUp } from 'lucide-react';
import ScoreChart from './ScoreChart';
import { APP_COLORS } from '@/lib/colors';

// =============================================================================
// Module-level constants
// =============================================================================

// Dialog / layout classNames
const DIALOG_CONTENT_CLASS =
  'w-full sm:max-w-[480px] max-h-[85vh] p-0 bg-background text-foreground overflow-hidden';
const DIALOG_HEADER_CLASS = 'p-4 sm:p-8 pb-2';
const DIALOG_TITLE_CLASS = 'flex items-center gap-2';
const DIALOG_TITLE_ICON_CLASS = 'h-5 w-5';
const SCROLL_AREA_CLASS =
  'max-h-[calc(85vh-80px)] px-6 sm:px-10 overflow-y-auto';
const STATS_WRAPPER_CLASS = 'space-y-5 pb-6';

// Brand title at top
const BRAND_WRAPPER_CLASS = 'text-center pt-2 pb-4';
const BRAND_TITLE_CLASS = 'text-4xl font-bold tracking-tight';

// Current score (hero section)
const CURRENT_SCORE_WRAPPER_CLASS = 'text-center py-4';
const CURRENT_SCORE_VALUE_CLASS = 'text-5xl font-bold text-foreground';
const CURRENT_SCORE_LABEL_CLASS = 'text-sm text-muted-foreground mt-1';
const CURRENT_SCORE_NONE_CLASS = 'text-3xl font-bold text-muted-foreground';

// Best/Average row
const SCORE_ROW_CLASS = 'grid grid-cols-2 gap-3';
const SCORE_CARD_CLASS = 'p-4 text-center';
const SCORE_VALUE_CLASS = 'text-xl font-bold text-foreground';
const SCORE_LABEL_CLASS = 'text-xs text-muted-foreground';

// Wordle-style stats row
const STATS_ROW_CLASS = 'flex justify-between px-2';
const STAT_ITEM_CLASS = 'text-center flex-1';
const STAT_VALUE_CLASS = 'text-2xl font-bold text-foreground';
const STAT_LABEL_CLASS = 'text-xs text-muted-foreground leading-tight whitespace-pre-line';

// Footer
const FOOTER_WRAPPER_CLASS = 'text-center pt-4 border-t border-border';
const FOOTER_TEXT_CLASS = 'text-xs text-muted-foreground';

// UI strings
const PANEL_TITLE = 'Statistics';
const LABEL_TODAYS_SCORE = "Today's Score";
const LABEL_NOT_PLAYED = 'Not played yet';
const LABEL_BEST = 'Best Score';
const LABEL_AVERAGE = 'Average Score';
const LABEL_PLAYED = 'Played';
const LABEL_WIN_PCT = 'Win %';
const LABEL_CURRENT_STREAK = 'Current\nStreak';
const LABEL_MAX_STREAK = 'Max\nStreak';
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

  // Get today's score from dailyStats
  const today = new Date().toISOString().split('T')[0];
  const todayStats = (stats.dailyStats || []).find((d) => d.date === today);
  const hasPlayedToday = todayStats?.completed || false;
  const todaysScore = hasPlayedToday ? todayStats?.score : null;

  // Pre-computed conditional flags
  const completedDailyStats = (stats.dailyStats || []).filter((d) => d.completed);
  const hasChartData = completedDailyStats.length > 0;
  const hasAnyDailyStats = (stats.dailyStats || []).length > 0;
  const playingSinceText = hasAnyDailyStats
    ? `Playing since ${new Date(stats.dailyStats[0].date).toLocaleDateString()}`
    : '';

  // Pre-computed display values
  const bestScoreText = stats.bestScore || EMPTY_VALUE_DASH;
  const averageScoreText = stats.averageScore || EMPTY_VALUE_DASH;

  // Brand title
  const brandTitleNode = (
    <div className={BRAND_WRAPPER_CLASS}>
      <h2 className={BRAND_TITLE_CLASS} style={{ fontFamily: "'Outfit', sans-serif" }}>
        <span style={{ color: APP_COLORS.primary.main }}>Calen</span>
        <span style={{ color: APP_COLORS.cell.highlight }}>dle</span>
      </h2>
    </div>
  );

  // Current score section (hero)
  const currentScoreNode = (
    <div className={CURRENT_SCORE_WRAPPER_CLASS}>
      {hasPlayedToday ? (
        <>
          <div className={CURRENT_SCORE_VALUE_CLASS}>{todaysScore}</div>
          <div className={CURRENT_SCORE_LABEL_CLASS}>{LABEL_TODAYS_SCORE}</div>
        </>
      ) : (
        <>
          <div className={CURRENT_SCORE_NONE_CLASS}>{EMPTY_VALUE_DASH}</div>
          <div className={CURRENT_SCORE_LABEL_CLASS}>{LABEL_NOT_PLAYED}</div>
        </>
      )}
    </div>
  );

  // Best & Average row
  const scoreRowNode = (
    <div className={SCORE_ROW_CLASS}>
      <Card className={SCORE_CARD_CLASS}>
        <div className={SCORE_VALUE_CLASS}>{bestScoreText}</div>
        <div className={SCORE_LABEL_CLASS}>{LABEL_BEST}</div>
      </Card>
      <Card className={SCORE_CARD_CLASS}>
        <div className={SCORE_VALUE_CLASS}>{averageScoreText}</div>
        <div className={SCORE_LABEL_CLASS}>{LABEL_AVERAGE}</div>
      </Card>
    </div>
  );

  // Wordle-style stats row (Played, Win%, Current Streak, Max Streak)
  const statsRowNode = (
    <div className={STATS_ROW_CLASS}>
      <div className={STAT_ITEM_CLASS}>
        <div className={STAT_VALUE_CLASS}>{stats.gamesPlayed}</div>
        <div className={STAT_LABEL_CLASS}>{LABEL_PLAYED}</div>
      </div>
      <div className={STAT_ITEM_CLASS}>
        <div className={STAT_VALUE_CLASS}>{stats.winPercentage}</div>
        <div className={STAT_LABEL_CLASS}>{LABEL_WIN_PCT}</div>
      </div>
      <div className={STAT_ITEM_CLASS}>
        <div className={STAT_VALUE_CLASS}>{stats.currentStreak}</div>
        <div className={STAT_LABEL_CLASS}>{LABEL_CURRENT_STREAK}</div>
      </div>
      <div className={STAT_ITEM_CLASS}>
        <div className={STAT_VALUE_CLASS}>{stats.maxStreak}</div>
        <div className={STAT_LABEL_CLASS}>{LABEL_MAX_STREAK}</div>
      </div>
    </div>
  );

  // Chart section
  const chartNode = hasChartData ? (
    <ScoreChart
      dailyStats={stats.dailyStats}
      timeFilter={timeFilter}
      onTimeFilterChange={setTimeFilter}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
    />
  ) : null;

  // Footer
  const footerNode = hasAnyDailyStats ? (
    <div className={FOOTER_WRAPPER_CLASS}>
      <div className={FOOTER_TEXT_CLASS}>{playingSinceText}</div>
    </div>
  ) : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={DIALOG_CONTENT_CLASS}>
        <DialogHeader className={DIALOG_HEADER_CLASS}>
          <DialogTitle className={DIALOG_TITLE_CLASS}>
            <TrendingUp className={DIALOG_TITLE_ICON_CLASS} />
            {PANEL_TITLE}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className={SCROLL_AREA_CLASS}>
          <div className={STATS_WRAPPER_CLASS}>
            {brandTitleNode}
            {currentScoreNode}
            {scoreRowNode}
            {statsRowNode}
            {chartNode}
            {footerNode}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default StatsPanel;
