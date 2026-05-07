import { useState, useEffect, useRef } from 'react';
import {
  setStorageItem,
  getStorageItem,
  removeStorageItem,
  getAnonUserId,
  STORAGE_KEYS
} from '@/lib/localStorage';
import { supabase } from '@/lib/supabase';
import { GameStats, DailyStats } from '@/types/interfaces';

// Default statistics for new players
const defaultStats: GameStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  currentStreak: 0,
  maxStreak: 0,
  averageScore: 0,
  totalScore: 0,
  lastPlayedDate: null,
  winPercentage: 0,
  bestScore: 0,
  dailyStats: []
};

/**
 * Ensures a stats object has all required fields with proper defaults.
 * This handles cases where localStorage has stale/incomplete data from older versions.
 */
const sanitizeStats = (raw: any): GameStats => {
  if (!raw || typeof raw !== 'object') return { ...defaultStats };
  return {
    gamesPlayed: typeof raw.gamesPlayed === 'number' ? raw.gamesPlayed : 0,
    gamesWon: typeof raw.gamesWon === 'number' ? raw.gamesWon : 0,
    currentStreak: typeof raw.currentStreak === 'number' ? raw.currentStreak : 0,
    maxStreak: typeof raw.maxStreak === 'number' ? raw.maxStreak : 0,
    averageScore: typeof raw.averageScore === 'number' ? raw.averageScore : 0,
    totalScore: typeof raw.totalScore === 'number' ? raw.totalScore : 0,
    lastPlayedDate: typeof raw.lastPlayedDate === 'string' ? raw.lastPlayedDate : null,
    winPercentage: typeof raw.winPercentage === 'number' ? raw.winPercentage : 0,
    bestScore: typeof raw.bestScore === 'number' ? raw.bestScore : 0,
    dailyStats: Array.isArray(raw.dailyStats) ? raw.dailyStats : [],
  };
};

/**
 * Shape of a row in the Supabase `game_stats` table.
 */
interface CloudStatsRow {
  user_id: string;
  games_played: number;
  games_won: number;
  best_time: number;        // we map this to `bestScore` (lower-is-better)
  current_streak: number;
  longest_streak: number;
  updated_at?: string;
}

/**
 * Maps a local GameStats object to a Supabase row payload.
 * `bestScore` is stored as `best_time` in the cloud (lower-is-better metric).
 */
const toCloudRow = (userId: string, s: GameStats): CloudStatsRow => ({
  user_id: userId,
  games_played: s.gamesPlayed,
  games_won: s.gamesWon,
  best_time: s.bestScore,
  current_streak: s.currentStreak,
  longest_streak: s.maxStreak,
  updated_at: new Date().toISOString(),
});

/**
 * Merges a cloud row into a local GameStats object. The cloud is treated as
 * the authoritative source for the aggregate counters, but local-only fields
 * (dailyStats, lastPlayedDate, derived metrics) are preserved from local
 * storage. For each numeric counter we take the MAX of cloud vs local so
 * progress is never lost if the device played offline.
 */
const mergeCloudIntoLocal = (local: GameStats, cloud: CloudStatsRow): GameStats => {
  const merged: GameStats = {
    ...local,
    gamesPlayed: Math.max(local.gamesPlayed, cloud.games_played ?? 0),
    gamesWon:    Math.max(local.gamesWon,    cloud.games_won ?? 0),
    currentStreak: Math.max(local.currentStreak, cloud.current_streak ?? 0),
    maxStreak:     Math.max(local.maxStreak,     cloud.longest_streak ?? 0),
    bestScore:
      // bestScore is "lower is better"; 0 means "no score yet"
      local.bestScore === 0
        ? (cloud.best_time ?? 0)
        : cloud.best_time && cloud.best_time > 0
          ? Math.min(local.bestScore, cloud.best_time)
          : local.bestScore,
  };

  // Recompute derived metrics from the merged counters
  merged.winPercentage = merged.gamesPlayed > 0
    ? Math.round((merged.gamesWon / merged.gamesPlayed) * 100)
    : 0;
  merged.averageScore = merged.gamesWon > 0
    ? Math.round(merged.totalScore / merged.gamesWon)
    : 0;

  return merged;
};

/**
 * Custom hook for managing game statistics with localStorage persistence
 * AND Supabase cloud sync via the `game_stats` table.
 *
 * On mount:
 *   1. Hydrate from localStorage immediately (synchronous, no flicker)
 *   2. Fetch the cloud row for this browser's anonymous user_id
 *   3. Merge the cloud row into the local stats (taking the max of counters)
 *   4. Persist the merged result back to both localStorage and the cloud
 *
 * On every stats change (updateStats / clearStats):
 *   - Persist to localStorage
 *   - Upsert the new stats to Supabase in the background
 */
export const useGameStats = () => {
  const [stats, setStats] = useState<GameStats>(defaultStats);
  const [isLoading, setIsLoading] = useState(true);
  const userIdRef = useRef<string>('');

  // Initial hydrate (local first, then cloud merge)
  useEffect(() => {
    const userId = getAnonUserId();
    userIdRef.current = userId;

    // 1. Local first — instant, no waiting on the network
    const rawStats = getStorageItem(STORAGE_KEYS.GAME_STATS, defaultStats);
    const localSafe = sanitizeStats(rawStats);
    setStats(localSafe);
    setIsLoading(false);

    // 2. Cloud merge in the background
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('game_stats')
          .select('user_id, games_played, games_won, best_time, current_streak, longest_streak, updated_at')
          .eq('user_id', userId)
          .maybeSingle();

        if (cancelled) return;

        if (error) {
          // Common cases: table doesn't exist yet, RLS blocks, network down.
          // Don't break the app — local stats still work.
          console.warn('[useGameStats] cloud fetch failed:', error.message);
          // Best-effort initial push so the row exists for next time
          void pushToCloud(userId, localSafe);
          return;
        }

        if (data) {
          const merged = mergeCloudIntoLocal(localSafe, data as CloudStatsRow);
          setStats(merged);
          setStorageItem(STORAGE_KEYS.GAME_STATS, merged);
          // Push the merged result back so cloud reflects any local-only progress
          void pushToCloud(userId, merged);
        } else {
          // No row yet for this anon id — create one from local stats
          void pushToCloud(userId, localSafe);
        }
      } catch (err) {
        console.warn('[useGameStats] cloud sync error:', err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Upserts the given stats to the `game_stats` table for the given user_id.
   * Failures are logged but never thrown — local play must always work.
   */
  const pushToCloud = async (userId: string, s: GameStats): Promise<void> => {
    if (!userId) {
      console.error('[useGameStats] pushToCloud aborted: empty userId');
      return;
    }
    const row = toCloudRow(userId, s);
    console.log('[useGameStats] pushing to cloud:', row);
    try {
      const { data, error, status, statusText } = await supabase
        .from('game_stats')
        .upsert(row, { onConflict: 'user_id' })
        .select();
      if (error) {
        console.error(
          '[useGameStats] cloud upsert FAILED',
          { message: error.message, code: error.code, details: error.details, hint: error.hint, status, statusText }
        );
      } else {
        console.log('[useGameStats] cloud upsert OK:', data);
      }
    } catch (err) {
      console.error('[useGameStats] cloud upsert threw:', err);
    }
  };


  /**
   * Records that the player has started today's game (first piece placed).
   * Increments gamesPlayed and currentStreak. Only runs once per day.
   */
  const recordGameStarted = () => {
    const today = new Date().toISOString().split('T')[0];
    const dailyStats = Array.isArray(stats.dailyStats) ? stats.dailyStats : [];

    const alreadyStartedToday = dailyStats.some(d => d.date === today);
    if (alreadyStartedToday) return;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];
    const playedYesterday = dailyStats.some(d => d.date === yesterdayString);

    const newCurrentStreak = playedYesterday ? stats.currentStreak + 1 : 1;

    const dailyEntry: DailyStats = {
      date: today,
      score: 0,
      completed: false,
      timeSpent: 0
    };

    const newStats: GameStats = {
      ...stats,
      gamesPlayed: stats.gamesPlayed + 1,
      currentStreak: newCurrentStreak,
      maxStreak: Math.max(stats.maxStreak, newCurrentStreak),
      lastPlayedDate: today,
      dailyStats: [...dailyStats, dailyEntry]
    };

    newStats.winPercentage = newStats.gamesPlayed > 0
      ? Math.round((newStats.gamesWon / newStats.gamesPlayed) * 100)
      : 0;

    setStats(newStats);
    setStorageItem(STORAGE_KEYS.GAME_STATS, newStats);
    void pushToCloud(userIdRef.current, newStats);
  };

  /**
   * Updates statistics after a game is completed (won).
   * Records the final score in today's dailyStats entry.
   *
   * @param won - Whether the player won the game
   * @param score - Number of moves taken (lower is better)
   */
  const updateStats = (won: boolean, score: number) => {
    const today = new Date().toISOString().split('T')[0];
    const dailyStats = Array.isArray(stats.dailyStats) ? stats.dailyStats : [];

    const todayEntry = dailyStats.find(d => d.date === today);
    if (todayEntry?.completed) return;

    const updatedDailyStats = todayEntry
      ? dailyStats.map(d => d.date === today
          ? { ...d, score, completed: won }
          : d)
      : [...dailyStats, { date: today, score, completed: won, timeSpent: 0 }];

    const newStats: GameStats = {
      ...stats,
      gamesWon: won ? stats.gamesWon + 1 : stats.gamesWon,
      totalScore: won ? stats.totalScore + score : stats.totalScore,
      lastPlayedDate: today,
      bestScore: won ? (stats.bestScore === 0 ? score : Math.min(stats.bestScore, score)) : stats.bestScore,
      dailyStats: updatedDailyStats
    };

    newStats.averageScore = newStats.gamesWon > 0
      ? Math.round(newStats.totalScore / newStats.gamesWon)
      : 0;

    newStats.winPercentage = newStats.gamesPlayed > 0
      ? Math.round((newStats.gamesWon / newStats.gamesPlayed) * 100)
      : 0;

    setStats(newStats);
    setStorageItem(STORAGE_KEYS.GAME_STATS, newStats);
    void pushToCloud(userIdRef.current, newStats);
  };

  /**
   * Resets all statistics to default values both locally and in the cloud.
   */
  const clearStats = () => {
    const fresh = { ...defaultStats };
    setStats(fresh);
    removeStorageItem(STORAGE_KEYS.GAME_STATS);
    void pushToCloud(userIdRef.current, fresh);
  };

  /**
   * Gets statistics for a specific date range
   * @param days - Number of days to look back (default: 7)
   * @returns Array of daily stats for the specified period
   */
  const getRecentStats = (days: number = 7): DailyStats[] => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffString = cutoffDate.toISOString().split('T')[0];

    const dailyStats = Array.isArray(stats.dailyStats) ? stats.dailyStats : [];
    return dailyStats.filter(daily => daily.date >= cutoffString);
  };

  const refreshStats = () => {
    const rawStats = getStorageItem(STORAGE_KEYS.GAME_STATS, defaultStats);
    setStats(sanitizeStats(rawStats));
  };

  return {
    stats,
    isLoading,
    updateStats,
    recordGameStarted,
    refreshStats,
    clearStats,
    getRecentStats
  };
};
