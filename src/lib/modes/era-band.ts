import type { Card, CardResult } from '../types';

/** 時代帯当てモードの状態遷移。1 枚ずつ出題し、答えると正解を明かす。 */
export interface EraBandState {
  cards: Card[];
  currentIndex: number;
  /** 答えたあとに明かす正解の時代帯キー。null = 未回答 */
  answeredEraKey: string | null;
  /** 間違って選んだキー。正解なら null */
  wrongEraKey: string | null;
  results: CardResult[];
}

export function createEraBandState(cards: Card[]): EraBandState {
  return { cards, currentIndex: 0, answeredEraKey: null, wrongEraKey: null, results: [] };
}

export function eraBandCurrentCard(state: EraBandState): Card | null {
  return state.cards[state.currentIndex] ?? null;
}

export function isEraBandComplete(state: EraBandState): boolean {
  return state.currentIndex >= state.cards.length;
}

/** 時代帯を 1 つ選ぶ。未回答のときだけ受け付ける。 */
export function selectEraBand(
  state: EraBandState,
  eraKey: string,
  eraKeys: string[],
): EraBandState {
  if (isEraBandComplete(state) || state.answeredEraKey !== null) return state;

  const currentCard = eraBandCurrentCard(state);
  if (!currentCard) return state;

  const isCorrect = eraKey === currentCard.era_color_key;
  const result: CardResult = {
    cardId: currentCard.id,
    correct: isCorrect,
    correctPosition: eraKeys.indexOf(currentCard.era_color_key),
    userPosition: eraKeys.indexOf(eraKey),
  };

  return {
    ...state,
    answeredEraKey: currentCard.era_color_key, // 正解は必ず明かす
    wrongEraKey: isCorrect ? null : eraKey,
    results: [...state.results, result],
  };
}

/** 次のカードへ。答えるまでは進めない。 */
export function advanceEraBand(state: EraBandState): EraBandState {
  if (state.answeredEraKey === null) return state;
  return {
    ...state,
    currentIndex: state.currentIndex + 1,
    answeredEraKey: null,
    wrongEraKey: null,
  };
}

export function eraBandScore(state: EraBandState): number {
  return state.results.filter((r) => r.correct).length;
}
