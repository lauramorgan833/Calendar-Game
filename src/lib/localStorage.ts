/**
 * LocalStorage utility functions for game statistics persistence
 * Provides type-safe storage and retrieval of game data
 */

import { APP_COLORS } from './colors';
import { GameSettings } from '@/types/interfaces';

const STORAGE_KEYS = {
  GAME_STATS: 'calendle-stats',
  GAME_STATE: 'calendle-game-state',
  GAME_SETTINGS: 'calendle-game-settings',
  ANON_USER_ID: 'calendle-anon-user-id'
} as const;

/**
 * Returns a stable anonymous user id for this browser, generating and
 * persisting one in localStorage on first call. Used as the cloud-sync
 * key for the `game_stats` table in Supabase.
 */
export const getAnonUserId = (): string => {
  try {
    const existing = localStorage.getItem(STORAGE_KEYS.ANON_USER_ID);
    if (existing && existing.length > 0) return existing;
    // Prefer crypto.randomUUID when available, fall back to a Math.random uuid
    const uuid =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : 'anon-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(STORAGE_KEYS.ANON_USER_ID, uuid);
    return uuid;
  } catch {
    // localStorage unavailable — return an ephemeral id
    return 'anon-ephemeral-' + Math.random().toString(36).slice(2);
  }
};

/**
 * Safely stores data in localStorage with error handling
 * @param key - Storage key
 * @param data - Data to store (will be JSON stringified)
 */
export const setStorageItem = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Failed to save to localStorage (${key}):`, error);
  }
};

/**
 * Safely retrieves data from localStorage with error handling
 * @param key - Storage key
 * @param defaultValue - Default value if key doesn't exist or parsing fails
 * @returns Parsed data or default value
 */
export const getStorageItem = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Failed to load from localStorage (${key}):`, error);
    return defaultValue;
  }
};

/**
 * Removes an item from localStorage
 * @param key - Storage key to remove
 */
export const removeStorageItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to remove from localStorage (${key}):`, error);
  }
};

/**
 * Checks if localStorage is available
 * @returns true if localStorage is supported and available
 */
export const isStorageAvailable = (): boolean => {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

/**
 * Checks if it's a new day and resets game state if needed
 * Uses GameStats.lastPlayedDate to determine if it's a new day
 * @returns object with reset status
 */
export const checkAndResetForNewDay = (): { wasReset: boolean } => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  const gameStats = getStorageItem(STORAGE_KEYS.GAME_STATS, { lastPlayedDate: null });
  
  if (gameStats.lastPlayedDate !== today) {
    // It's a new day, reset game state but keep stats
    removeStorageItem(STORAGE_KEYS.GAME_STATE);
    return { wasReset: true };
  }
  
  return { wasReset: false };
};

/**
 * Gets game settings with defaults
 */
export const getGameSettings = (): GameSettings => {
  return getStorageItem(STORAGE_KEYS.GAME_SETTINGS, {
    theme: 'light',
    pieceColor: { name: 'Default', value: APP_COLORS.piece.default, dark: APP_COLORS.piece.default }
  });
};

/**
 * Updates game settings
 */
export const updateGameSettings = (settings: Partial<GameSettings>): void => {
  const currentSettings = getGameSettings();
  const newSettings = { ...currentSettings, ...settings };
  setStorageItem(STORAGE_KEYS.GAME_SETTINGS, newSettings);
};

export { STORAGE_KEYS };