import type { GameMode, ModeProgress, QuizProgress, QuizResult } from './types';
import { createLocalStore } from './local-store';
import { applyQuizResult } from './progress-rules';
import { isSyntheticQuizId } from './constants';

export type ProgressMap = Record<string, QuizProgress>;

export const PROGRESS_STORAGE_KEY = 'rekikan_progress';

function isModeProgress(v: unknown): v is ModeProgress {
  if (!v || typeof v !== 'object') return false;
  const p = v as Record<string, unknown>;
  return (
    typeof p.bestScore === 'number' &&
    typeof p.cleared === 'boolean' &&
    typeof p.attemptCount === 'number'
  );
}

function parseQuizProgress(quizId: string, v: unknown): QuizProgress | null {
  if (!v || typeof v !== 'object') return null;
  const p = v as Record<string, unknown>;
  if (
    typeof p.bestScore !== 'number' ||
    typeof p.cleared !== 'boolean' ||
    typeof p.attemptCount !== 'number'
  ) {
    return null;
  }

  const modes: Partial<Record<GameMode, ModeProgress>> = {};
  if (p.modes && typeof p.modes === 'object') {
    for (const [mode, value] of Object.entries(p.modes)) {
      if (isModeProgress(value)) {
        modes[mode as GameMode] = {
          ...value,
          clearedWithHint:
            typeof value.clearedWithHint === 'boolean' ? value.clearedWithHint : false,
        };
      }
    }
  }

  return {
    quizId,
    bestScore: p.bestScore,
    cleared: p.cleared,
    clearedWithHint: typeof p.clearedWithHint === 'boolean' ? p.clearedWithHint : false,
    attemptCount: p.attemptCount,
    modes,
  };
}

/**
 * v1（バージョン封筒なし）はクイズ ID をキーにしたマップをそのまま保存していた。
 * v2 以降は `{ quizzes: { ... } }`。どちらもモード別記録は空のまま引き継ぐ。
 */
const progressStore = createLocalStore<ProgressMap>({
  key: PROGRESS_STORAGE_KEY,
  version: 2,
  empty: {},
  parse: (data) => {
    if (!data || typeof data !== 'object') return {};
    const record = data as Record<string, unknown>;
    const entries = (record.quizzes ?? record) as Record<string, unknown>;
    if (!entries || typeof entries !== 'object') return {};

    const result: ProgressMap = {};
    for (const [quizId, value] of Object.entries(entries)) {
      const parsed = parseQuizProgress(quizId, value);
      if (parsed) result[quizId] = parsed;
    }
    return result;
  },
});

export function getAllProgress(): ProgressMap {
  return progressStore.read();
}

export function getQuizProgress(quizId: string): QuizProgress | null {
  return progressStore.read()[quizId] ?? null;
}

/** 指定モードの記録だけを取り出す。未プレイなら null。 */
export function getModeProgress(quizId: string, mode: GameMode): ModeProgress | null {
  return getQuizProgress(quizId)?.modes[mode] ?? null;
}

export function saveQuizResult(result: QuizResult): QuizProgress {
  // 実行時に組み立てたクイズ（復習など）は同梱データに存在しないので、
  // 進捗に混ぜない。アンロック判定が架空の ID に依存してしまうため。
  if (isSyntheticQuizId(result.quizId)) {
    return applyQuizResult(undefined, result);
  }

  let saved: QuizProgress | null = null;
  progressStore.update((current) => {
    saved = applyQuizResult(current[result.quizId], result);
    return { ...current, [result.quizId]: saved };
  });
  return saved!;
}

export function isQuizCleared(quizId: string): boolean {
  return getQuizProgress(quizId)?.cleared ?? false;
}

/* useSyncExternalStore 用 */
export const subscribeProgress = progressStore.subscribe;
export const getProgressSnapshot = progressStore.getSnapshot;
export const getServerProgressSnapshot = progressStore.getServerSnapshot;
