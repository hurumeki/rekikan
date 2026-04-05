import type { QuizProgress, QuizResult } from './types';

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
