'use client';

import { useMemo, useSyncExternalStore } from 'react';
import {
  countWeakCards,
  getCardStatsSnapshot,
  getServerCardStatsSnapshot,
  subscribeCardStats,
  type CardStatsMap,
} from '@/lib/card-stats';

/** カード統計を localStorage から購読する。 */
export function useCardStats(): CardStatsMap {
  return useSyncExternalStore(subscribeCardStats, getCardStatsSnapshot, getServerCardStatsSnapshot);
}

/** 苦手カードの枚数。復習の入口を出すかどうかの判定に使う。 */
export function useWeakCardCount(): number {
  const stats = useCardStats();
  return useMemo(() => countWeakCards(stats), [stats]);
}
