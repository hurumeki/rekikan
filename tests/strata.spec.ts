import { test, expect } from '@playwright/test';
import { installMemoryStorage } from './helpers/memory-storage';

const storage = installMemoryStorage();

import { recordPendingReveals, stratumColor, takePendingReveals } from '@/lib/strata';
import { ALL_NODES, REGIONS } from '@/lib/data-registry';
import { getRootNode } from '@/lib/data-loader';
import { diffUnlockedNodes } from '@/lib/unlock';
import type { ProgressMap } from '@/lib/progress';

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

test.describe('演出待ちノードの受け渡し', () => {
  test('積んだノードを取り出すと記録から消える', () => {
    recordPendingReveals({ japan: ['a', 'b'] });
    expect(takePendingReveals('japan')).toEqual(['a', 'b']);
    // 2 回目は空（演出は 1 度だけ）
    expect(takePendingReveals('japan')).toEqual([]);
  });

  test('複数回の解放は取り出すまで積み上がる', () => {
    recordPendingReveals({ japan: ['a'] });
    recordPendingReveals({ japan: ['b'] });
    expect(takePendingReveals('japan').sort()).toEqual(['a', 'b']);
  });

  test('同じノードを二重に積まない', () => {
    recordPendingReveals({ japan: ['a'] });
    recordPendingReveals({ japan: ['a'] });
    expect(takePendingReveals('japan')).toEqual(['a']);
  });

  test('地域ごとに独立して取り出せる', () => {
    recordPendingReveals({ japan: ['a'], world: ['w'] });
    expect(takePendingReveals('japan')).toEqual(['a']);
    expect(takePendingReveals('world')).toEqual(['w']);
  });

  test('空の指定では何も積まない', () => {
    recordPendingReveals({ japan: [] });
    expect(takePendingReveals('japan')).toEqual([]);
  });

  test('保存データが壊れていても落ちない', () => {
    storage.setItem('rekikan_pending_reveals', 'not json');
    expect(takePendingReveals('japan')).toEqual([]);
  });
});

test.describe('解放されたノードの差分', () => {
  test('クリアによって解放されたノードだけを地域ごとに返す', () => {
    const japanRoot = getRootNode('japan')!;
    const before: ProgressMap = {};
    const after: ProgressMap = {
      quiz_japan_era_intro_desc: {
        quizId: 'quiz_japan_era_intro_desc',
        bestScore: 6,
        cleared: true,
        clearedWithHint: false,
        attemptCount: 1,
        modes: {},
      },
    };

    const diff = diffUnlockedNodes(ALL_NODES, before, after);
    expect(diff.japan).toContain('node_japan_prehistoric');
    // ルートは常時解放なので差分に含まない
    expect(diff.japan).not.toContain(japanRoot.id);
    // 2 地域必要なテーマ史はまだ開かない
    expect(diff.world ?? []).toEqual([]);
  });

  test('進捗が変わらなければ差分は空', () => {
    expect(diffUnlockedNodes(ALL_NODES, {}, {})).toEqual({});
  });
});
