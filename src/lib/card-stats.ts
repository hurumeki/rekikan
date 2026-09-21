import type { CardResult, CardStats } from './types';

const STORAGE_KEY = 'rekikan_card_stats';
const STORAGE_VERSION = 1;

interface StoredCardStats {
  version: number;
  cards: Record<string, CardStats>;
}

function isCardStats(v: unknown): v is CardStats {
  if (!v || typeof v !== 'object') return false;
  const s = v as Record<string, unknown>;
  return (
    typeof s.cardId === 'string' && typeof s.attempts === 'number' && typeof s.correct === 'number'
  );
}

export function getAllCardStats(): Record<string, CardStats> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    const entries = (parsed as StoredCardStats).cards ?? {};
    const result: Record<string, CardStats> = {};
    for (const [cardId, value] of Object.entries(entries)) {
      if (isCardStats(value)) result[cardId] = { ...value, cardId };
    }
    return result;
  } catch {
    return {};
  }
}

function saveAll(stats: Record<string, CardStats>): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const payload: StoredCardStats = { version: STORAGE_VERSION, cards: stats };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}

/** 1 回の解答結果をカード単位の統計に反映する。 */
export function recordCardResults(
  results: CardResult[],
  now: string = new Date().toISOString(),
): Record<string, CardStats> {
  const all = getAllCardStats();
  for (const result of results) {
    const existing = all[result.cardId] ?? {
      cardId: result.cardId,
      attempts: 0,
      correct: 0,
      lastSeen: now,
    };
    all[result.cardId] = {
      cardId: result.cardId,
      attempts: existing.attempts + 1,
      correct: existing.correct + (result.correct ? 1 : 0),
      lastSeen: now,
    };
  }
  saveAll(all);
  return all;
}

export function getCardStats(cardId: string): CardStats | null {
  return getAllCardStats()[cardId] ?? null;
}

export function accuracy(stats: CardStats): number {
  return stats.attempts === 0 ? 1 : stats.correct / stats.attempts;
}

/**
 * 苦手なカードを弱い順に返す。
 * 正答率が低い順 → 最後に出会ってからの時間が長い順。
 * 一度も間違えていないカードは対象外。
 */
export function getWeakCardIds(limit: number, stats = getAllCardStats()): string[] {
  return Object.values(stats)
    .filter((s) => s.attempts > 0 && s.correct < s.attempts)
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
  return Object.values(stats).filter((s) => s.attempts > 0 && s.correct < s.attempts).length;
}

/* useSyncExternalStore 用。詳細は progress.ts の同名関数を参照 */

export function getWeakCardCountSnapshot(): number {
  if (typeof window === 'undefined') return 0;
  return countWeakCards();
}

export function getServerWeakCardCountSnapshot(): number {
  return 0;
}

export function subscribeCardStats(onChange: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', onChange);
  return () => window.removeEventListener('storage', onChange);
}
