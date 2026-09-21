import type { Page } from '@playwright/test';
import type { CardStats, GameMode, QuizProgress } from '@/lib/types';
import { PROGRESS_STORAGE_KEY } from '@/lib/progress';
import { CARD_STATS_STORAGE_KEY } from '@/lib/card-stats';

/**
 * localStorage の中身をテストから触るための唯一の窓口。
 *
 * 保存形式を知っているのはこのファイルだけにする。
 * 各テストが JSON を手書きすると、保存形式を変えるたびに
 * 実装 1 箇所に対してテストを何箇所も直すことになる。
 */

/** 保存時の封筒（local-store.ts と対応） */
function envelope(version: number, data: unknown) {
  return JSON.stringify({ version, data });
}

export function clearedProgress(quizId: string, mode: GameMode = 'challenge'): QuizProgress {
  const modeProgress = {
    bestScore: 99,
    cleared: true,
    clearedWithHint: false,
    attemptCount: 1,
  };
  return {
    quizId,
    bestScore: 99,
    cleared: true,
    clearedWithHint: false,
    attemptCount: 1,
    modes: { [mode]: modeProgress },
  };
}

export function weakCardStats(cardId: string): CardStats {
  return {
    cardId,
    attempts: 2,
    correct: 0,
    lastSeen: new Date().toISOString(),
  };
}

/** 指定クイズをクリア済みにする。ページは事前に開いておくこと。 */
export async function seedProgress(page: Page, quizIds: string[]): Promise<void> {
  const quizzes: Record<string, QuizProgress> = {};
  for (const id of quizIds) quizzes[id] = clearedProgress(id);
  await page.evaluate(([key, raw]) => localStorage.setItem(key!, raw!), [
    PROGRESS_STORAGE_KEY,
    envelope(2, quizzes),
  ] as const);
}

/** 指定カードを「苦手」として記録する。 */
export async function seedWeakCards(page: Page, cardIds: string[]): Promise<void> {
  const cards: Record<string, CardStats> = {};
  for (const id of cardIds) cards[id] = weakCardStats(id);
  await page.evaluate(([key, raw]) => localStorage.setItem(key!, raw!), [
    CARD_STATS_STORAGE_KEY,
    envelope(1, cards),
  ] as const);
}

/** 保存されているカード統計を読み出す。未保存なら null。 */
export async function readCardStats(page: Page): Promise<Record<string, CardStats> | null> {
  const raw = await page.evaluate((key) => localStorage.getItem(key), CARD_STATS_STORAGE_KEY);
  if (!raw) return null;
  const parsed = JSON.parse(raw) as { data?: Record<string, CardStats> };
  return parsed.data ?? null;
}
