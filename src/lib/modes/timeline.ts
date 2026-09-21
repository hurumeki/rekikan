import type { Card, CardResult } from '../types';
import { isWithinTolerance, type TimelineScale } from '../timeline-scale';

/** タイムラインモードの状態遷移。1 枚ずつ、年表上の位置で答える。 */
export interface TimelineState {
  cards: Card[];
  currentIndex: number;
  /** 置こうとしている年。未選択なら null */
  selectedYear: number | null;
  /** 確定した年。null = 未回答 */
  answeredYear: number | null;
  results: CardResult[];
}

export function createTimelineState(cards: Card[]): TimelineState {
  return { cards, currentIndex: 0, selectedYear: null, answeredYear: null, results: [] };
}

export function timelineCurrentCard(state: TimelineState): Card | null {
  return state.cards[state.currentIndex] ?? null;
}

export function isTimelineComplete(state: TimelineState): boolean {
  return state.currentIndex >= state.cards.length;
}

/** タイムライン上の割合（0〜100）で置く位置を決める。 */
export function selectTimelinePercent(
  state: TimelineState,
  percent: number,
  scale: TimelineScale,
): TimelineState {
  if (state.answeredYear !== null) return state;
  return { ...state, selectedYear: scale.percentToYear(percent) };
}

/**
 * 画面上の距離で位置を動かす。時代帯ごとに等幅なので、
 * 近代では数年単位、先史では数百年単位の移動になる。
 */
export function nudgeTimelinePercent(
  state: TimelineState,
  deltaPercent: number,
  scale: TimelineScale,
): TimelineState {
  if (state.answeredYear !== null) return state;
  const basePercent = state.selectedYear === null ? 50 : scale.yearToPercent(state.selectedYear);
  return { ...state, selectedYear: scale.percentToYear(basePercent + deltaPercent) };
}

/** 年を直接ずらす（時代帯ジャンプ用）。範囲外には出ない。 */
export function nudgeTimelineYear(
  state: TimelineState,
  deltaYears: number,
  scale: TimelineScale,
): TimelineState {
  if (state.answeredYear !== null) return state;
  const base = state.selectedYear ?? scale.percentToYear(50);
  const year = Math.max(scale.range.start, Math.min(scale.range.end, base + deltaYears));
  return { ...state, selectedYear: year };
}

/** 置いた位置を確定して採点する。 */
export function confirmTimeline(state: TimelineState, scale: TimelineScale): TimelineState {
  if (state.selectedYear === null || state.answeredYear !== null) return state;

  const currentCard = timelineCurrentCard(state);
  if (!currentCard) return state;

  // correctPosition / userPosition には年を入れる（結果画面の表示用）
  const result: CardResult = {
    cardId: currentCard.id,
    correct: isWithinTolerance(state.selectedYear, currentCard.year, scale),
    correctPosition: currentCard.year,
    userPosition: state.selectedYear,
  };

  return { ...state, answeredYear: state.selectedYear, results: [...state.results, result] };
}

/** 次のカードへ。確定するまでは進めない。 */
export function advanceTimeline(state: TimelineState): TimelineState {
  if (state.answeredYear === null) return state;
  return {
    ...state,
    currentIndex: state.currentIndex + 1,
    selectedYear: null,
    answeredYear: null,
  };
}

export function timelineScore(state: TimelineState): number {
  return state.results.filter((r) => r.correct).length;
}
