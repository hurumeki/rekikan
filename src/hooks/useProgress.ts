'use client';

import { useMemo, useSyncExternalStore } from 'react';
import {
  getProgressSnapshot,
  getServerProgressSnapshot,
  subscribeProgress,
  type ProgressMap,
} from '@/lib/progress';
import type { QuizProgress } from '@/lib/types';

/**
 * 進捗を localStorage から購読する。
 * 静的書き出しされた HTML には進捗が含まれないため、
 * 初回描画は空で、マウント後に実際の値へ切り替わる。
 */
export function useProgress(): ProgressMap {
  return useSyncExternalStore(subscribeProgress, getProgressSnapshot, getServerProgressSnapshot);
}

export function useQuizProgress(quizId: string): QuizProgress | null {
  const progress = useProgress();
  return useMemo(() => progress[quizId] ?? null, [progress, quizId]);
}
