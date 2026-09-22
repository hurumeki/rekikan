import type { Card, CardResult, CardState } from '../types';
import { checkAnswers, type YearLookup } from '../quiz-engine';

/** 全部並べてから一括判定するモード（チャレンジ／同時代）の状態遷移。 */
export interface OrderingState {
  cards: Card[];
  /** ユーザーが選んだ順のカード ID */
  selectionOrder: string[];
  results: CardResult[] | null;
}

export function createOrderingState(cards: Card[]): OrderingState {
  return { cards, selectionOrder: [], results: null };
}

export function isOrderingConfirmed(state: OrderingState): boolean {
  return state.results !== null;
}

export function isOrderingComplete(state: OrderingState): boolean {
  return state.selectionOrder.length === state.cards.length;
}

/** 未選択なら末尾に追加、選択済みなら取り消す（以降の番号は繰り上がる）。 */
export function toggleOrderingSelection(state: OrderingState, cardId: string): OrderingState {
  if (isOrderingConfirmed(state)) return state;
  if (!state.cards.some((c) => c.id === cardId)) return state;

  const selected = state.selectionOrder.includes(cardId);
  return {
    ...state,
    selectionOrder: selected
      ? state.selectionOrder.filter((id) => id !== cardId)
      : [...state.selectionOrder, cardId],
  };
}

/** 全カードを選び終えていれば判定する。 */
export function confirmOrdering(
  state: OrderingState,
  correctOrder: string[],
  yearOf?: YearLookup,
): OrderingState {
  if (isOrderingConfirmed(state) || !isOrderingComplete(state)) return state;
  return { ...state, results: checkAnswers(state.selectionOrder, correctOrder, yearOf) };
}

export function orderingScore(state: OrderingState): number {
  return state.results?.filter((r) => r.correct).length ?? 0;
}

export function orderingCardState(state: OrderingState, cardId: string): CardState {
  if (state.results) {
    return state.results.find((r) => r.cardId === cardId)?.correct ? 'correct' : 'incorrect';
  }
  return state.selectionOrder.includes(cardId) ? 'selected' : 'unselected';
}

/** 1 始まりの選択番号。未選択なら undefined。 */
export function orderingSelectionNumber(state: OrderingState, cardId: string): number | undefined {
  const index = state.selectionOrder.indexOf(cardId);
  return index === -1 ? undefined : index + 1;
}
