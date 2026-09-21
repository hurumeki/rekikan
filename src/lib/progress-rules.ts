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

export function emptyModeProgress(): ModeProgress {
  return { bestScore: 0, cleared: false, clearedWithHint: false, attemptCount: 0 };
}

/**
 * 1 回の結果を既存の進捗に反映した新しい進捗を返す（保存はしない）。
 *
 * - モード別の記録をそれぞれ更新する
 * - アンロックに使う cleared は並べ替え系モードの満点のみで立てる
 * - cleared / clearedWithHint は一度 true になったら下がらない。
 *   モード別記録を持たない v1 からの引き継ぎ分も、これで状態を失わない
 */
export function applyQuizResult(
  existing: QuizProgress | undefined,
  result: QuizResult,
): QuizProgress {
  const isPerfect = result.score === result.total;
  const previousMode = existing?.modes[result.mode] ?? emptyModeProgress();

  const modeProgress: ModeProgress = {
    bestScore: Math.max(result.score, previousMode.bestScore),
    cleared: isPerfect || previousMode.cleared,
    clearedWithHint: (isPerfect && result.hintUsed) || previousMode.clearedWithHint,
    attemptCount: previousMode.attemptCount + 1,
  };

  const modes = { ...(existing?.modes ?? {}), [result.mode]: modeProgress };
  const clearedByOrdering = ORDERING_MODES.some((m) => modes[m]?.cleared === true);
  const clearedWithHintByOrdering = ORDERING_MODES.some((m) => modes[m]?.clearedWithHint === true);

  return {
    quizId: result.quizId,
    bestScore: Math.max(result.score, existing?.bestScore ?? 0),
    cleared: clearedByOrdering || existing?.cleared === true,
    clearedWithHint: clearedWithHintByOrdering || existing?.clearedWithHint === true,
    attemptCount: (existing?.attemptCount ?? 0) + 1,
    modes,
  };
}
