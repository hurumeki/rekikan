import { test, expect } from '@playwright/test';
import { installMemoryStorage } from './helpers/memory-storage';

const storage = installMemoryStorage();

import { getQuizProgress, saveQuizResult, getAllProgress } from '@/lib/progress';
import type { GameMode, QuizResult } from '@/lib/types';

function play(quizId: string, mode: GameMode, score: number, total: number, hintUsed = false) {
  const result: QuizResult = {
    quizId,
    mode,
    score,
    total,
    hintUsed,
    cardResults: [],
    timestamp: new Date().toISOString(),
  };
  return saveQuizResult(result);
}

test.beforeEach(() => storage.clear());

test.describe('モード別の進捗', () => {
  test('モードごとにベストスコアと挑戦回数を持つ', () => {
    play('q1', 'careful', 3, 5);
    play('q1', 'challenge', 5, 5);
    play('q1', 'careful', 4, 5);

    const progress = getQuizProgress('q1')!;
    expect(progress.modes.careful).toMatchObject({ bestScore: 4, cleared: false, attemptCount: 2 });
    expect(progress.modes.challenge).toMatchObject({
      bestScore: 5,
      cleared: true,
      attemptCount: 1,
    });
    expect(progress.attemptCount).toBe(3);
  });

  test('時代帯当てモードの満点ではクリア扱いにしない', () => {
    play('q2', 'era_band', 5, 5);
    const progress = getQuizProgress('q2')!;
    expect(progress.modes.era_band?.cleared).toBe(true);
    // 並べ替えをしていないので次の階層は開かない
    expect(progress.cleared).toBe(false);
  });

  test('並べ替え系モードの満点でクリアになる', () => {
    play('q3', 'timeline', 5, 5);
    expect(getQuizProgress('q3')!.cleared).toBe(false);
    play('q3', 'careful', 5, 5);
    expect(getQuizProgress('q3')!.cleared).toBe(true);
  });

  test('一度クリアしたら以降の失敗で取り消されない', () => {
    play('q4', 'challenge', 5, 5);
    play('q4', 'challenge', 1, 5);
    expect(getQuizProgress('q4')!.cleared).toBe(true);
  });

  test('ヒントありの満点は clearedWithHint に記録される', () => {
    play('q5', 'challenge', 5, 5, true);
    const progress = getQuizProgress('q5')!;
    expect(progress.clearedWithHint).toBe(true);
    expect(progress.modes.challenge?.clearedWithHint).toBe(true);
  });
});

test.describe('v1 形式からの移行', () => {
  test('モード別記録のない旧データでもクリア状態を失わない', () => {
    storage.setItem(
      'rekikan_progress',
      JSON.stringify({
        old_quiz: { quizId: 'old_quiz', bestScore: 5, cleared: true, attemptCount: 4 },
      }),
    );

    const migrated = getQuizProgress('old_quiz')!;
    expect(migrated.cleared).toBe(true);
    expect(migrated.bestScore).toBe(5);
    expect(migrated.modes).toEqual({});
    expect(migrated.clearedWithHint).toBe(false);

    // 新しくプレイしてもクリア状態は維持される
    play('old_quiz', 'careful', 2, 5);
    expect(getQuizProgress('old_quiz')!.cleared).toBe(true);
  });

  test('壊れたデータは無視して空の進捗になる', () => {
    storage.setItem('rekikan_progress', '{ not json');
    expect(getAllProgress()).toEqual({});
  });
});
