'use client';

import { useState, useCallback, useMemo } from 'react';
import type { Card, CardState } from '@/lib/types';
import { shuffleArray, createYearLookup } from '@/lib/quiz-engine';
import {
  confirmOrdering,
  createOrderingState,
  isOrderingComplete,
  isOrderingConfirmed,
  orderingCardState,
  orderingScore,
  orderingSelectionNumber,
  toggleOrderingSelection,
} from '@/lib/modes/ordering';

/** 状態遷移は lib/modes/ordering.ts、ここは React への橋渡しだけ。 */
export function useOrderingMode(cards: Card[], correctOrder: string[]) {
  const [state, setState] = useState(() => createOrderingState(shuffleArray(cards)));

  // 同年のカードを入れ替えても正解として扱うため、年の辞書を判定に渡す
  const yearOf = useMemo(() => createYearLookup(cards), [cards]);

  const toggleSelect = useCallback((cardId: string) => {
    setState((prev) => toggleOrderingSelection(prev, cardId));
  }, []);

  const confirm = useCallback(() => {
    setState((prev) => confirmOrdering(prev, correctOrder, yearOf));
  }, [correctOrder, yearOf]);

  const getCardState = useCallback(
    (cardId: string): CardState => orderingCardState(state, cardId),
    [state],
  );

  const getSelectionNumber = useCallback(
    (cardId: string): number | undefined => orderingSelectionNumber(state, cardId),
    [state],
  );

  return {
    cards: state.cards,
    selectionOrder: state.selectionOrder,
    results: state.results,
    isConfirmed: isOrderingConfirmed(state),
    score: orderingScore(state),
    total: state.cards.length,
    allSelected: isOrderingComplete(state),
    toggleSelect,
    confirm,
    getCardState,
    getSelectionNumber,
  };
}
