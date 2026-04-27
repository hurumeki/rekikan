'use client';

import { useState, useCallback, useMemo } from 'react';
import type { Card, CardResult, CardState } from '@/lib/types';
import { shuffleArray, checkAnswers } from '@/lib/quiz-engine';

interface ChallengeModeState {
  cards: Card[];
  selectionOrder: string[]; // card IDs in user-selected order
  isConfirmed: boolean;
  results: CardResult[] | null;
  score: number;
  total: number;
}

export function useChallengeMode(cards: Card[], correctOrder: string[]) {
  const [state, setState] = useState<ChallengeModeState>(() => ({
    cards: shuffleArray(cards),
    selectionOrder: [],
    isConfirmed: false,
    results: null,
    score: 0,
    total: cards.length,
  }));

  const toggleSelect = useCallback((cardId: string) => {
    setState((prev) => {
      if (prev.isConfirmed) return prev;

      const idx = prev.selectionOrder.indexOf(cardId);
      if (idx >= 0) {
        // Deselect: remove and renumber
        const newOrder = prev.selectionOrder.filter((id) => id !== cardId);
        return { ...prev, selectionOrder: newOrder };
      } else {
        return { ...prev, selectionOrder: [...prev.selectionOrder, cardId] };
      }
    });
  }, []);

  const confirm = useCallback(() => {
    setState((prev) => {
      if (prev.selectionOrder.length !== prev.cards.length) return prev;
      const results = checkAnswers(prev.selectionOrder, correctOrder);
      const score = results.filter((r) => r.correct).length;
      return { ...prev, isConfirmed: true, results, score };
    });
  }, [correctOrder]);

  const resultMap = useMemo(
    () => (state.results ? new Map(state.results.map((r) => [r.cardId, r])) : null),
    [state.results],
  );
  const selectionIndex = useMemo(() => {
    const m = new Map<string, number>();
    state.selectionOrder.forEach((id, i) => m.set(id, i));
    return m;
  }, [state.selectionOrder]);

  const getCardState = useCallback(
    (cardId: string): CardState => {
      if (state.isConfirmed && resultMap) {
        return resultMap.get(cardId)?.correct ? 'correct' : 'incorrect';
      }
      if (selectionIndex.has(cardId)) return 'selected';
      return 'unselected';
    },
    [state.isConfirmed, resultMap, selectionIndex],
  );

  const getSelectionNumber = useCallback(
    (cardId: string): number | undefined => {
      const idx = selectionIndex.get(cardId);
      return idx === undefined ? undefined : idx + 1;
    },
    [selectionIndex],
  );

  const allSelected = state.selectionOrder.length === state.cards.length;

  return {
    ...state,
    allSelected,
    toggleSelect,
    confirm,
    getCardState,
    getSelectionNumber,
  };
}
