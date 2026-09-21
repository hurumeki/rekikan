import { test, expect } from '@playwright/test';
import { getRootNode, getChildNodes, getQuiz } from '@/lib/data-loader';
import { isNodeUnlockedDeep, findNextQuiz, remainingLabel, describeCondition } from '@/lib/unlock';
import type { ProgressMap } from '@/lib/unlock';
import type { QuizProgress } from '@/lib/types';

function cleared(...quizIds: string[]): ProgressMap {
  const map: ProgressMap = {};
  for (const id of quizIds) {
    const quiz = getQuiz(id);
    const progress: QuizProgress = {
      quizId: id,
      bestScore: quiz?.card_ids.length ?? 0,
      cleared: true,
      clearedWithHint: false,
      attemptCount: 1,
      modes: {
        challenge: {
          bestScore: quiz?.card_ids.length ?? 0,
          cleared: true,
          clearedWithHint: false,
          attemptCount: 1,
        },
      },
    };
    map[id] = progress;
  }
  return map;
}

test.describe('テーマ史・同時代史の解放条件', () => {
  const worldRoot = getRootNode('world')!;
  const eraNode = getChildNodes(worldRoot.id).find((n) => n.id === 'node_world_ancient')!;
  const themeNode = getChildNodes(worldRoot.id).find((n) => n.id === 'node_world_theme_economy')!;

  test('最初はどのノードもロックされている', () => {
    expect(isNodeUnlockedDeep(eraNode, {})).toBe(false);
    expect(isNodeUnlockedDeep(themeNode, {})).toBe(false);
  });

  test('1 地域だけではまだ解放されない', () => {
    const progress = cleared('quiz_japan_era_intro_desc');
    expect(isNodeUnlockedDeep(eraNode, progress)).toBe(false);
  });

  test('2 地域の入門クリアで同時代ノードが解放される', () => {
    const progress = cleared('quiz_japan_era_intro_desc', 'quiz_europe_intro_desc');
    expect(isNodeUnlockedDeep(eraNode, progress)).toBe(true);
    // テーマ史は 3 地域必要なのでまだロック
    expect(isNodeUnlockedDeep(themeNode, progress)).toBe(false);
  });

  test('3 地域の入門クリアでテーマ史ノードも解放される', () => {
    const progress = cleared(
      'quiz_japan_era_intro_desc',
      'quiz_europe_intro_desc',
      'quiz_china_intro_desc',
    );
    expect(isNodeUnlockedDeep(themeNode, progress)).toBe(true);
  });

  test('残り必要数が表示できる', () => {
    expect(remainingLabel(eraNode, {})).toBe('あと2問でひらく');
    expect(remainingLabel(eraNode, cleared('quiz_japan_era_intro_desc'))).toBe('あと1問でひらく');
  });

  test('条件を日本語で説明できる', () => {
    const condition = Array.isArray(eraNode.unlock_condition)
      ? eraNode.unlock_condition[0]!
      : eraNode.unlock_condition!;
    expect(describeCondition(condition)).toContain('2つ以上の地域');
  });

  test('次に遊ぶクイズは未クリアの地域入門になる', () => {
    const japanRoot = getRootNode('japan')!;
    expect(findNextQuiz(japanRoot, {})).toBe('quiz_japan_era_intro_desc');
    expect(findNextQuiz(worldRoot, {})).toBeNull();
  });
});
