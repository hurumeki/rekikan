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

import { stratumColor, takeNewlyUnlockedNodeIds } from '@/lib/strata';
import { REGIONS } from '@/lib/data-registry';

const japanEras = REGIONS.find((r) => r.id === 'japan')!.era_colors;

test.beforeEach(() => storage.clear());

test.describe('地層の色', () => {
  test('並び順が古い時代から新しい時代へ写像される', () => {
    const colors = Object.values(japanEras).map((e) => e.color);
    expect(stratumColor(0, 5, japanEras)).toBe(colors[0]);
    expect(stratumColor(4, 5, japanEras)).toBe(colors[colors.length - 1]);
  });

  test('兄弟が 1 つだけなら最初の色', () => {
    expect(stratumColor(0, 1, japanEras)).toBe(Object.values(japanEras)[0]!.color);
  });

  test('時代帯が定義されていなければ色なし', () => {
    expect(stratumColor(0, 3, {})).toBeNull();
  });
});

test.describe('新しく解放された層の検出', () => {
  test('初回は演出を出さない', () => {
    expect(takeNewlyUnlockedNodeIds('japan', ['root'])).toEqual([]);
  });

  test('2 回目以降、増えたぶんだけ返す', () => {
    takeNewlyUnlockedNodeIds('japan', ['root']);
    expect(takeNewlyUnlockedNodeIds('japan', ['root', 'a', 'b'])).toEqual(['a', 'b']);
    // 同じ状態で再訪しても出ない
    expect(takeNewlyUnlockedNodeIds('japan', ['root', 'a', 'b'])).toEqual([]);
  });

  test('進捗の読み込み前に空で呼ばれても記録が巻き戻らない', () => {
    takeNewlyUnlockedNodeIds('japan', ['root']);
    takeNewlyUnlockedNodeIds('japan', ['root', 'a']); // 解放を検出
    // ハイドレーション直後の「まだ何も解放されていない」描画
    expect(takeNewlyUnlockedNodeIds('japan', ['root'])).toEqual([]);
    // 進捗が読み込まれた後の描画では、もう新規ではない
    expect(takeNewlyUnlockedNodeIds('japan', ['root', 'a'])).toEqual([]);
  });

  test('地域ごとに独立している', () => {
    takeNewlyUnlockedNodeIds('japan', ['root']);
    expect(takeNewlyUnlockedNodeIds('europe', ['root'])).toEqual([]);
    expect(takeNewlyUnlockedNodeIds('japan', ['root', 'x'])).toEqual(['x']);
  });

  test('保存データが壊れていても落ちない', () => {
    storage.setItem('rekikan_seen_unlocked_nodes', 'not json');
    expect(takeNewlyUnlockedNodeIds('japan', ['root'])).toEqual([]);
  });
});
