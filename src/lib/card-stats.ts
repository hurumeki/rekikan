import type { Card, CardResult, CardStats } from './types';
import { createLocalStore } from './local-store';

export type CardStatsMap = Record<string, CardStats>;

export const CARD_STATS_STORAGE_KEY = 'rekikan_card_stats';

function parseCardStats(cardId: string, v: unknown): CardStats | null {
  if (!v || typeof v !== 'object') return null;
  const s = v as Record<string, unknown>;
  if (typeof s.attempts !== 'number' || typeof s.correct !== 'number') return null;
  return {
    cardId,
    attempts: s.attempts,
    correct: s.correct,
    lastSeen: typeof s.lastSeen === 'string' ? s.lastSeen : '',
    region: typeof s.region === 'string' ? s.region : undefined,
  };
}

const cardStatsStore = createLocalStore<CardStatsMap>({
  key: CARD_STATS_STORAGE_KEY,
  version: 1,
  empty: {},
  parse: (data) => {
    if (!data || typeof data !== 'object') return {};
    const record = data as Record<string, unknown>;
    const entries = (record.cards ?? record) as Record<string, unknown>;
    if (!entries || typeof entries !== 'object') return {};

    const result: CardStatsMap = {};
    for (const [cardId, value] of Object.entries(entries)) {
      const parsed = parseCardStats(cardId, value);
      if (parsed) result[cardId] = parsed;
    }
    return result;
  },
});

export function getAllCardStats(): CardStatsMap {
  return cardStatsStore.read();
}

export function getCardStats(cardId: string): CardStats | null {
  return cardStatsStore.read()[cardId] ?? null;
}

/**
 * 1 回の解答結果をカード単位の統計に反映する。
 * cards を渡すと地域も記録し、復習時に必要な地域だけを読み込めるようになる。
 */
export function recordCardResults(
  results: CardResult[],
  cards: Pick<Card, 'id' | 'region'>[] = [],
  now: string = new Date().toISOString(),
): CardStatsMap {
  const regionById = new Map(cards.map((c) => [c.id, c.region]));
  return cardStatsStore.update((current) => {
    const next: CardStatsMap = { ...current };
    for (const result of results) {
      const existing = next[result.cardId];
      next[result.cardId] = {
        cardId: result.cardId,
        attempts: (existing?.attempts ?? 0) + 1,
        correct: (existing?.correct ?? 0) + (result.correct ? 1 : 0),
        lastSeen: now,
        region: regionById.get(result.cardId) ?? existing?.region,
      };
    }
    return next;
  });
}

export function accuracy(stats: CardStats): number {
  return stats.attempts === 0 ? 1 : stats.correct / stats.attempts;
}

/** 一度でも間違えたカードを「苦手」とみなす */
function isWeak(stats: CardStats): boolean {
  return stats.attempts > 0 && stats.correct < stats.attempts;
}

/**
 * 苦手なカードを弱い順に返す。
 * 正答率が低い順 → 最後に出会ってからの時間が長い順。
 * 一度も間違えていないカードは対象外。
 */
export function getWeakCardIds(limit: number, stats = getAllCardStats()): string[] {
  return Object.values(stats)
    .filter(isWeak)
    .sort((a, b) => {
      const diff = accuracy(a) - accuracy(b);
      if (diff !== 0) return diff;
      return (a.lastSeen ?? '').localeCompare(b.lastSeen ?? '');
    })
    .slice(0, limit)
    .map((s) => s.cardId);
}

/** 苦手カードの総数（復習の入口を出すかどうかの判定に使う）。 */
export function countWeakCards(stats = getAllCardStats()): number {
  return Object.values(stats).filter(isWeak).length;
}

/** 苦手カードが属する地域（記録があるもののみ）。 */
export function getWeakCardRegions(stats = getAllCardStats()): string[] {
  return [
    ...new Set(
      Object.values(stats)
        .filter(isWeak)
        .map((s) => s.region)
        .filter((r): r is string => !!r),
    ),
  ];
}

/* useSyncExternalStore 用 */
export const subscribeCardStats = cardStatsStore.subscribe;
export const getCardStatsSnapshot = cardStatsStore.getSnapshot;
export const getServerCardStatsSnapshot = cardStatsStore.getServerSnapshot;
