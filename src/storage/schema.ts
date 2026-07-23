import type { AppData, Settings } from '../domain/types';
import { emptyStreak } from '../domain/streak';

export const DATA_VERSION = 1;

export const DEFAULT_SETTINGS: Settings = {
  theme: 'light',
  accent: '#3b6cff',
  order: 'sequential',
  sessionSize: 0,        // 制限なし
  masterThreshold: 2,
  soundEnabled: false,
  hapticEnabled: true,
};

export function defaultAppData(): AppData {
  return {
    version: DATA_VERSION,
    progress: {},
    chapterRounds: {},
    streak: emptyStreak(),
    settings: { ...DEFAULT_SETTINGS },
  };
}
