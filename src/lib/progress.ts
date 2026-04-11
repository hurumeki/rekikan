import type { QuizProgress, QuizResult } from './types';

/** スコアから星数を計算（1〜3）。total が 0 のときは 0 を返す。 */
export function computeStars(score: number, total: number): number {
  if (total === 0) return 0;
  if (score === total) return 3;
  if (score / total >= 0.7) return 2;
  return 1;
}

/** 過去のベストスコアに基づく星数（クイズ一覧の表示用）。未プレイなら 0。 */
export function getHistoricalStars(
  progress: QuizProgress | null | undefined,
  total: number,
): number {
  if (!progress || progress.attemptCount === 0) return 0;
  // cleared === true なら過去に全問正解が達成済み → 3星確定
  const effectiveScore = progress.cleared ? total : progress.bestScore;
  return computeStars(effectiveScore, total);
}

const STORAGE_KEY = 'rekikan_progress';

function loadAll(): Record<string, QuizProgress> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAll(data: Record<string, QuizProgress>): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getQuizProgress(quizId: string): QuizProgress | null {
  const all = loadAll();
  return all[quizId] ?? null;
}

export function saveQuizResult(result: QuizResult): QuizProgress {
  const all = loadAll();
  const existing = all[result.quizId];
  const cleared = result.score === result.total;

  const progress: QuizProgress = {
    quizId: result.quizId,
    bestScore: Math.max(result.score, existing?.bestScore ?? 0),
    cleared: cleared || (existing?.cleared ?? false),
    attemptCount: (existing?.attemptCount ?? 0) + 1,
  };

  all[result.quizId] = progress;
  saveAll(all);
  return progress;
}

export function isQuizCleared(quizId: string): boolean {
  const progress = getQuizProgress(quizId);
  return progress?.cleared ?? false;
}

export function getAllProgress(): Record<string, QuizProgress> {
  return loadAll();
}
