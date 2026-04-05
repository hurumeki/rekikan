'use client';

import { useState, useCallback } from 'react';
import type { Card, CardResult, CardState } from '@/lib/types';
import { shuffleArray, checkAnswers } from '@/lib/quiz-engine';

interface ChallengeModeState {
  cards: Card[];
  selectionOrder: string[]; // card IDs in user-selected order
  lockedCards: Set<string>;
  isConfirmed: boolean;
  results: CardResult[] | null;
  score: number;
  total: number;
}

export function useChallengeMode(cards: Card[], correctOrder: string[]) {
  const [state, setState] = useState<ChallengeModeState>(() => ({
    cards: shuffleArray(cards),
    selectionOrder: [],
    lockedCards: new Set(),
    isConfirmed: false,
    results: null,
    score: 0,
    total: cards.length,
  }));

  const toggleSelect = useCallback((cardId: string) => {
    setState((prev) => {
      if (prev.isConfirmed) return prev;
      if (prev.lockedCards.has(cardId)) return prev;

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

  const toggleLock = useCallback((cardId: string) => {
    setState((prev) => {
      if (prev.isConfirmed) return prev;
      const newLocked = new Set(prev.lockedCards);
      if (newLocked.has(cardId)) {
        newLocked.delete(cardId);
      } else {
        newLocked.add(cardId);
      }
      return { ...prev, lockedCards: newLocked };
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
      if (state.lockedCards.has(cardId)) return 'locked';
      if (state.selectionOrder.includes(cardId)) return 'selected';
      return 'unselected';
    },
    [state.isConfirmed, state.results, state.lockedCards, state.selectionOrder],
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
    toggleLock,
    confirm,
    getCardState,
    getSelectionNumber,
  };
}
