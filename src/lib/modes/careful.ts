import type { Card, CardResult } from '../types';
import { isOldestAmong } from '../quiz-engine';

/**
 * じっくりモードの状態遷移。
 * React に依存しない純粋関数として置き、フックは薄い入れ物にする。
 */
export interface CarefulState {
  remainingCards: Card[];
  confirmedCards: Card[];
  /** 間違えた手数（確定済み枚数 = 手番）。同年カードがあるので ID ではなく手番で持つ */
  mistakeSteps: ReadonlySet<number>;
  /** 直前に選んで外したカード（振動演出に使う） */
  wrongCardId: string | null;
}

export function createCarefulState(cards: Card[]): CarefulState {
  return {
    remainingCards: cards,
    confirmedCards: [],
    mistakeSteps: new Set(),
    wrongCardId: null,
  };
}

export function isCarefulComplete(state: CarefulState): boolean {
  return state.remainingCards.length === 0 && state.confirmedCards.length > 0;
}

/** カードを 1 枚選ぶ。最も古い年と一致すれば確定、違えば手番にミスを記録する。 */
export function selectCarefulCard(state: CarefulState, cardId: string): CarefulState {
  if (isCarefulComplete(state)) return state;

  const selected = state.remainingCards.find((c) => c.id === cardId);
  if (!selected) return state;

  // 残りカードの中で最も古い年。同じ年のカードが複数あれば、
  // どれを選んでも歴史的に正しいので正解として扱う。
  if (isOldestAmong(selected, state.remainingCards)) {
    return {
      ...state,
      confirmedCards: [...state.confirmedCards, selected],
      remainingCards: state.remainingCards.filter((c) => c.id !== cardId),
      wrongCardId: null,
    };
  }

  const mistakeSteps = new Set(state.mistakeSteps);
  mistakeSteps.add(state.confirmedCards.length);
  return { ...state, mistakeSteps, wrongCardId: cardId };
}

export function clearCarefulWrong(state: CarefulState): CarefulState {
  return state.wrongCardId === null ? state : { ...state, wrongCardId: null };
}

/** 1 手もミスしなかった手番の数 = 得点 */
export function carefulScore(state: CarefulState): number {
  return state.confirmedCards.filter((_, step) => !state.mistakeSteps.has(step)).length;
}

export function carefulResults(state: CarefulState, correctOrder: string[]): CardResult[] {
  return state.confirmedCards.map((card, i) => ({
    cardId: card.id,
    correct: !state.mistakeSteps.has(i),
    correctPosition: correctOrder.indexOf(card.id),
    userPosition: i,
  }));
}
