'use client';

import { useState, useCallback } from 'react';
import type { Card, CardResult, CardState } from '@/lib/types';
import { shuffleArray, checkAnswers } from '@/lib/quiz-engine';

interface CrossRegionModeState {
  cards: Card[];
  selectionOrder: string[];
  isConfirmed: boolean;
  results: CardResult[] | null;
  score: number;
  total: number;
}

export function useCrossRegionMode(cards: Card[], correctOrder: string[]) {
  const [state, setState] = useState<CrossRegionModeState>(() => ({
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
        return { ...prev, selectionOrder: prev.selectionOrder.filter((id) => id !== cardId) };
      }
      return { ...prev, selectionOrder: [...prev.selectionOrder, cardId] };
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

  const getCardState = useCallback(
    (cardId: string): CardState => {
      if (state.isConfirmed && state.results) {
        const result = state.results.find((r) => r.cardId === cardId);
        return result?.correct ? 'correct' : 'incorrect';
      }
      if (state.selectionOrder.includes(cardId)) return 'selected';
      return 'unselected';
    },
    [state.isConfirmed, state.results, state.selectionOrder],
  );

  const getSelectionNumber = useCallback(
    (cardId: string): number | undefined => {
      const idx = state.selectionOrder.indexOf(cardId);
      return idx >= 0 ? idx + 1 : undefined;
    },
    [state.selectionOrder],
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
