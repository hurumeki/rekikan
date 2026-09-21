import type { GameMode, ModeProgress, QuizProgress, QuizResult } from './types';

/**
 * 並べ替えを伴うモード。アンロック判定の「クリア」はこれらで満点を取ることを指す。
 * 時代帯当て・タイムラインは別の能力を鍛えるモードなので、
 * これらだけで先の階層が開かないようにする。
 */
export const ORDERING_MODES: GameMode[] = ['careful', 'challenge', 'cross_region'];

export function isOrderingMode(mode: GameMode): boolean {
  return ORDERING_MODES.includes(mode);
}

/** スコアから星数を計算（1〜3）。total が 0 のときは 0 を返す。 */
export function computeStars(score: number, total: number): number {
  if (total === 0) return 0;
  if (score === total) return 3;
  if (score / total >= 0.7) return 2;
  return 1;
}

/** 過去のベストスコアに基づく星数（クイズ一覧の表示用）。未プレイなら 0。 */
export function getHistoricalStars(
  progress: QuizProgress | ModeProgress | null | undefined,
  total: number,
): number {
  if (!progress || progress.attemptCount === 0) return 0;
  // cleared === true なら過去に全問正解が達成済み → 3星確定
  const effectiveScore = progress.cleared ? total : progress.bestScore;
  return computeStars(effectiveScore, total);
}

const STORAGE_KEY = 'rekikan_progress';
const STORAGE_VERSION = 2;

interface StoredProgress {
  version: number;
  quizzes: Record<string, QuizProgress>;
}

function emptyModeProgress(): ModeProgress {
  return { bestScore: 0, cleared: false, clearedWithHint: false, attemptCount: 0 };
}

function isModeProgress(v: unknown): v is ModeProgress {
  if (!v || typeof v !== 'object') return false;
  const p = v as Record<string, unknown>;
  return (
    typeof p.bestScore === 'number' &&
    typeof p.cleared === 'boolean' &&
    typeof p.attemptCount === 'number'
  );
}

function normalizeQuizProgress(quizId: string, v: unknown): QuizProgress | null {
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

function loadAll(): Record<string, QuizProgress> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};

    // v1 は QuizProgress のマップをそのまま保存していた。
    // version フィールドの有無で判別し、モード別の記録は空のまま引き継ぐ。
    const entries =
      'version' in parsed && typeof (parsed as StoredProgress).version === 'number'
        ? ((parsed as StoredProgress).quizzes ?? {})
        : (parsed as Record<string, unknown>);

    const result: Record<string, QuizProgress> = {};
    for (const [quizId, value] of Object.entries(entries)) {
      const normalized = normalizeQuizProgress(quizId, value);
      if (normalized) result[quizId] = normalized;
    }
    return result;
  } catch {
    return {};
  }
}

/**
 * 保存に失敗しても致命的なエラーにはしない。
 * Safari のプライベートブラウズや容量超過では setItem が例外を投げるため、
 * ここで握らないとリザルト画面への遷移ごと落ちる。
 * @returns 保存できたら true
 */
function saveAll(data: Record<string, QuizProgress>): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const payload: StoredProgress = { version: STORAGE_VERSION, quizzes: data };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}

export function getQuizProgress(quizId: string): QuizProgress | null {
  const all = loadAll();
  return all[quizId] ?? null;
}

/** 指定モードの記録だけを取り出す。未プレイなら null。 */
export function getModeProgress(quizId: string, mode: GameMode): ModeProgress | null {
  return getQuizProgress(quizId)?.modes[mode] ?? null;
}

export function saveQuizResult(result: QuizResult): QuizProgress {
  const all = loadAll();
  const existing = all[result.quizId];
  const isPerfect = result.score === result.total;

  const previousMode = existing?.modes[result.mode] ?? emptyModeProgress();
  const modeProgress: ModeProgress = {
    bestScore: Math.max(result.score, previousMode.bestScore),
    cleared: isPerfect || previousMode.cleared,
    clearedWithHint: (isPerfect && result.hintUsed) || previousMode.clearedWithHint,
    attemptCount: previousMode.attemptCount + 1,
  };

  const modes = { ...(existing?.modes ?? {}), [result.mode]: modeProgress };

  // アンロックに使う cleared は並べ替え系モードでの満点のみを数える
  const clearedByOrdering = ORDERING_MODES.some((m) => modes[m]?.cleared === true);
  const clearedWithHintByOrdering = ORDERING_MODES.some((m) => modes[m]?.clearedWithHint === true);

  const progress: QuizProgress = {
    quizId: result.quizId,
    bestScore: Math.max(result.score, existing?.bestScore ?? 0),
    // 一度 true になったら下がらない。モード別記録を持たない v1 からの
    // 引き継ぎ分も、これでアンロック状態を失わずに済む。
    cleared: clearedByOrdering || existing?.cleared === true,
    clearedWithHint: clearedWithHintByOrdering || existing?.clearedWithHint === true,
    attemptCount: (existing?.attemptCount ?? 0) + 1,
    modes,
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
