import { test, expect } from '@playwright/test';

class MemoryStorage {
  private map = new Map<string, string>();
  getItem(key: string) {
    return this.map.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.map.set(key, value);
  }
  removeItem(key: string) {
    this.map.delete(key);
  }
  clear() {
    this.map.clear();
  }
}

const storage = new MemoryStorage();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).window = globalThis;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).localStorage = storage;

import {
  recordCardResults,
  getCardStats,
  getWeakCardIds,
  countWeakCards,
  accuracy,
  getWeakCardRegions,
} from '@/lib/card-stats';
import type { CardResult } from '@/lib/types';

function result(cardId: string, correct: boolean): CardResult {
  return { cardId, correct, correctPosition: 0, userPosition: 0 };
}

test.beforeEach(() => storage.clear());

test.describe('カード単位の統計', () => {
  test('解答するたびに挑戦回数と正解数が増える', () => {
    recordCardResults([result('c1', true), result('c2', false)]);
    recordCardResults([result('c1', false)]);

    expect(getCardStats('c1')).toMatchObject({ attempts: 2, correct: 1 });
    expect(getCardStats('c2')).toMatchObject({ attempts: 1, correct: 0 });
    expect(accuracy(getCardStats('c1')!)).toBe(0.5);
  });

  test('一度も間違えていないカードは苦手に入らない', () => {
    recordCardResults([result('always_ok', true), result('sometimes', false)]);
    expect(getWeakCardIds(10)).toEqual(['sometimes']);
    expect(countWeakCards()).toBe(1);
  });

  test('正答率の低い順に並ぶ', () => {
    // c_bad: 0/2, c_mid: 1/2, c_good: 2/3
    recordCardResults([result('c_bad', false), result('c_mid', false), result('c_good', true)]);
    recordCardResults([result('c_bad', false), result('c_mid', true), result('c_good', true)]);
    recordCardResults([result('c_good', false)]);

    expect(getWeakCardIds(3)).toEqual(['c_bad', 'c_mid', 'c_good']);
  });

  test('出題枚数の上限を超えない', () => {
    recordCardResults(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map((id) => result(id, false)));
    expect(getWeakCardIds(7)).toHaveLength(7);
  });

  test('同じ正答率なら最後に出会ってから古い順', () => {
    recordCardResults([result('older', false)], [], '2026-01-01T00:00:00Z');
    recordCardResults([result('newer', false)], [], '2026-06-01T00:00:00Z');
    expect(getWeakCardIds(2)).toEqual(['older', 'newer']);
  });

  test('カードを渡すと地域も記録される', () => {
    recordCardResults([result('card_jp_1', false)], [{ id: 'card_jp_1', region: 'japan' }]);
    expect(getCardStats('card_jp_1')?.region).toBe('japan');
    expect(getWeakCardRegions()).toEqual(['japan']);
  });

  test('保存データが壊れていても落ちない', () => {
    storage.setItem('rekikan_card_stats', 'not json');
    expect(getWeakCardIds(5)).toEqual([]);
    expect(countWeakCards()).toBe(0);
  });
});
