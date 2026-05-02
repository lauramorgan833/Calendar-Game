import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DailyStats } from '@/hooks/useGameStats';

// =============================================================================
// Module-level constants
// =============================================================================

// Chart sizing / scaling
const TIMELINE_WINDOW_DAYS = 30;
const SCALE_MIN_VALUE = 6; // start scale at 6 but don't show labels below 10
const SCALE_FALLBACK_MAX = 10;
const BUCKET_FALLBACK_MAX = 1;
const BAR_HEIGHT_PX = 120;
const TIMELINE_BAR_MIN_HEIGHT_PX = 4;
const BUCKET_BAR_MIN_HEIGHT_PX = 8;
const BAR_TRANSLATE_Y = 'translateY(-16px)';
const LABEL_TRANSLATE_Y = 'translateY(-18px)';

// Bucket thresholds
const BUCKET_THRESHOLD_LOW = 10;
const BUCKET_THRESHOLD_MED = 25;
const BUCKET_THRESHOLD_HIGH = 50;
const BUCKET_THRESHOLD_VERY_HIGH = 100;

// Bucket keys (also display labels)
const BUCKET_KEY_10 = '10';
const BUCKET_KEY_11_25 = '11-25';
const BUCKET_KEY_26_50 = '26-50';
const BUCKET_KEY_51_100 = '51-100';
const BUCKET_KEY_100_PLUS = '100+';

// classNames — theme-aware
const CARD_CLASS = 'p-4';
const HEADER_WRAPPER_CLASS = 'mb-4';
const HEADER_TITLE_CLASS = 'font-semibold mb-3 text-foreground';
const TOGGLE_ROW_CLASS = 'flex gap-2';

const CHART_AREA_CLASS = 'h-40 flex items-end justify-center gap-1 p-2 relative';
const CHART_INNER_BASE_CLASS = 'flex-1 flex items-end relative';
const CHART_INNER_JUSTIFY_BETWEEN = 'justify-between';
const CHART_INNER_JUSTIFY_CENTER = 'justify-center';

const BAR_GROUP_CLASS = 'flex flex-col items-center';
const BAR_GROUP_RELATIVE_CLASS = 'flex flex-col items-center relative';
const BAR_VALUE_LABEL_CLASS = 'text-xs mb-1 font-medium text-foreground';

// Bar color classNames — include dark variants so bars stay readable in both
// themes (slightly lighter shades on dark backgrounds for better contrast)
const TIMELINE_BAR_BASE_CLASS = 'w-4 rounded-t relative';
const BUCKET_BAR_BASE_CLASS = 'w-8 rounded-t mx-auto';
const BAR_COLOR_DEFAULT = 'bg-blue-500 dark:bg-blue-400';
const BAR_COLOR_HIGHLIGHT = 'bg-green-500 dark:bg-green-400';

// Date label classNames
const DATE_LABEL_CLASS =
  'text-xs text-center absolute bottom-0 transform translate-y-1/2 text-muted-foreground';
const BUCKET_LABEL_CLASS =
  'text-xs absolute bottom-0 transform translate-y-1/2 text-muted-foreground';

// Bucket column className
const BUCKET_COL_CLASS = 'flex flex-col items-center flex-1 relative';

// Empty / fallback states
const EMPTY_STATE_CLASS = 'text-sm text-muted-foreground';
const EMPTY_STATE_TEXT = 'No completed games';

// UI strings
const CHART_TITLE = 'Winning Scores';
const TOGGLE_BUCKETS_LABEL = 'Buckets';
const TOGGLE_TIMELINE_LABEL = 'Timeline';
const VIEW_MODE_TIMELINE: 'timeline' = 'timeline';
const VIEW_MODE_BUCKETS: 'buckets' = 'buckets';

// =============================================================================
// Types
// =============================================================================

interface ScoreChartProps {
  dailyStats: DailyStats[];
  timeFilter: number;
  onTimeFilterChange: (days: number) => void;
  viewMode: 'timeline' | 'buckets';
  onViewModeChange: (mode: 'timeline' | 'buckets') => void;
}

// =============================================================================
// Helpers
// =============================================================================

const getTodayString = (): string => new Date().toISOString().split('T')[0];

const getCutoffDateString = (): string => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - TIMELINE_WINDOW_DAYS);
  return cutoffDate.toISOString().split('T')[0];
};

const computeBucketKeyForScore = (score: number): string => {
  if (score <= BUCKET_THRESHOLD_LOW) return BUCKET_KEY_10;
  if (score <= BUCKET_THRESHOLD_MED) return BUCKET_KEY_11_25;
  if (score <= BUCKET_THRESHOLD_HIGH) return BUCKET_KEY_26_50;
  if (score <= BUCKET_THRESHOLD_VERY_HIGH) return BUCKET_KEY_51_100;
  return BUCKET_KEY_100_PLUS;
};

const computeTimelineBarHeightPx = (
  score: number,
  maxValue: number
): number =>
  Math.max(
    ((score - SCALE_MIN_VALUE) / (maxValue - SCALE_MIN_VALUE)) * BAR_HEIGHT_PX,
    TIMELINE_BAR_MIN_HEIGHT_PX
  );

const computeBucketBarHeightPx = (count: number, bucketMax: number): number =>
  Math.max(
    (count / bucketMax) * BAR_HEIGHT_PX,
    count > 0 ? BUCKET_BAR_MIN_HEIGHT_PX : 0
  );

// =============================================================================
// Component
// =============================================================================

const ScoreChart: React.FC<ScoreChartProps> = ({
  dailyStats,
  timeFilter,
  onTimeFilterChange,
  viewMode,
  onViewModeChange,
}) => {
  const today = getTodayString();
  const todayStats = dailyStats?.find((stat) => stat.date === today);
  const hasWonToday = todayStats?.completed || false;
  const todayScore = todayStats?.score || 0;
  const todayBucket =
    hasWonToday && todayScore ? computeBucketKeyForScore(todayScore) : null;

  const filteredData = useMemo(() => {
    if (!dailyStats || !Array.isArray(dailyStats)) return [];
    const cutoffString = getCutoffDateString();
    return dailyStats
      .filter((stat) => stat.date >= cutoffString && stat.completed)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [dailyStats]);

  const bucketData = useMemo(() => {
    const buckets: Record<string, number> = {
      [BUCKET_KEY_10]: 0,
      [BUCKET_KEY_11_25]: 0,
      [BUCKET_KEY_26_50]: 0,
      [BUCKET_KEY_51_100]: 0,
      [BUCKET_KEY_100_PLUS]: 0,
    };
    if (dailyStats && Array.isArray(dailyStats)) {
      dailyStats
        .filter((stat) => stat.completed)
        .forEach((stat) => {
          buckets[computeBucketKeyForScore(stat.score)]++;
        });
    }
    return buckets;
  }, [dailyStats]);

  // Pre-computed scale values
  const maxValue =
    viewMode === VIEW_MODE_TIMELINE
      ? Math.max(...filteredData.map((d) => d.score), SCALE_FALLBACK_MAX)
      : Math.max(...Object.values(bucketData), SCALE_FALLBACK_MAX);
  const bucketMaxValue = Math.max(
    ...Object.values(bucketData),
    BUCKET_FALLBACK_MAX
  );

  // Pre-computed flags / classNames
  const isTimelineView = viewMode === VIEW_MODE_TIMELINE;
  const isBucketsView = viewMode === VIEW_MODE_BUCKETS;
  const hasTimelineData = filteredData.length > 0;
  const isSingleTimelineBar = filteredData.length === 1;
  const justifyClass =
    isTimelineView && filteredData.length > 1
      ? CHART_INNER_JUSTIFY_BETWEEN
      : CHART_INNER_JUSTIFY_CENTER;
  const chartInnerClass = `${CHART_INNER_BASE_CLASS} ${justifyClass}`;

  // Pre-built handlers
  const handleSelectBuckets = () => onViewModeChange(VIEW_MODE_BUCKETS);
  const handleSelectTimeline = () => onViewModeChange(VIEW_MODE_TIMELINE);

  // Pre-built bar nodes
  const renderTimelineBar = (stat: DailyStats) => {
    const isToday = stat.date === today && hasWonToday;
    const barColorClass = isToday ? BAR_COLOR_HIGHLIGHT : BAR_COLOR_DEFAULT;
    const barClass = `${TIMELINE_BAR_BASE_CLASS} ${barColorClass}`;
    const barHeight = computeTimelineBarHeightPx(stat.score, maxValue);
    const barStyle = {
      height: `${barHeight}px`,
      transform: BAR_TRANSLATE_Y,
    };
    const labelStyle = { transform: LABEL_TRANSLATE_Y };
    const dayNumber = new Date(stat.date).getDate();
    const monthShort = new Date(stat.date).toLocaleDateString('en-US', {
      month: 'short',
    });
    const groupClass = isSingleTimelineBar
      ? BAR_GROUP_CLASS
      : BAR_GROUP_RELATIVE_CLASS;
    const showScoreLabel = stat.score > 0;

    return (
      <div key={stat.date} className={groupClass}>
        {showScoreLabel ? (
          <div className={BAR_VALUE_LABEL_CLASS} style={labelStyle}>
            {stat.score}
          </div>
        ) : null}
        <div
          className={barClass}
          style={barStyle}
          title={`${stat.date}: ${stat.score} moves`}
        />
        <div className={DATE_LABEL_CLASS}>
          <div>{dayNumber}</div>
          <div>{monthShort}</div>
        </div>
      </div>
    );
  };

  const renderBucketBar = (bucket: string, count: number) => {
    const isHighlighted = bucket === todayBucket;
    const barColorClass = isHighlighted
      ? BAR_COLOR_HIGHLIGHT
      : BAR_COLOR_DEFAULT;
    const barClass = `${BUCKET_BAR_BASE_CLASS} ${barColorClass}`;
    const barHeight = computeBucketBarHeightPx(count, bucketMaxValue);
    const barStyle = {
      height: `${barHeight}px`,
      transform: BAR_TRANSLATE_Y,
    };
    const labelStyle = { transform: LABEL_TRANSLATE_Y };
    const showCountLabel = count > 0;

    return (
      <div key={bucket} className={BUCKET_COL_CLASS}>
        {showCountLabel ? (
          <div className={BAR_VALUE_LABEL_CLASS} style={labelStyle}>
            {count}
          </div>
        ) : null}
        <div
          className={barClass}
          style={barStyle}
          title={`${bucket} moves: ${count} games`}
        />
        <div className={BUCKET_LABEL_CLASS}>{bucket}</div>
      </div>
    );
  };

  // Pre-built chart body
  let chartBodyNode: React.ReactNode;
  if (isTimelineView) {
    chartBodyNode = hasTimelineData ? (
      filteredData.map(renderTimelineBar)
    ) : (
      <div className={EMPTY_STATE_CLASS}>{EMPTY_STATE_TEXT}</div>
    );
  } else {
    chartBodyNode = Object.entries(bucketData).map(([bucket, count]) =>
      renderBucketBar(bucket, count)
    );
  }

  return (
    <Card className={CARD_CLASS}>
      <div className={HEADER_WRAPPER_CLASS}>
        <h3 className={HEADER_TITLE_CLASS}>{CHART_TITLE}</h3>
        <div className={TOGGLE_ROW_CLASS}>
          <Button
            variant={isBucketsView ? 'default' : 'outline'}
            size="sm"
            onClick={handleSelectBuckets}
          >
            {TOGGLE_BUCKETS_LABEL}
          </Button>
          <Button
            variant={isTimelineView ? 'default' : 'outline'}
            size="sm"
            onClick={handleSelectTimeline}
          >
            {TOGGLE_TIMELINE_LABEL}
          </Button>
        </div>
      </div>

      <div className={CHART_AREA_CLASS}>
        <div className={chartInnerClass}>{chartBodyNode}</div>
      </div>
    </Card>
  );
};

export default ScoreChart;
