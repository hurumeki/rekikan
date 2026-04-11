'use client';

import { useState, useCallback } from 'react';
import type { Card, CardResult, EraColor } from '@/lib/types';
import { shuffleArray } from '@/lib/quiz-engine';

interface EraBandModeState {
  cards: Card[];
  currentIndex: number;
  answeredEraKey: string | null; // null = not answered yet
  wrongEraKey: string | null; // the key user incorrectly selected
  results: CardResult[];
  isComplete: boolean;
}

export function useEraBandMode(cards: Card[], eraColors: Record<string, EraColor>) {
  const eraKeys = Object.keys(eraColors);

  const [state, setState] = useState<EraBandModeState>(() => ({
    cards: shuffleArray(cards),
    currentIndex: 0,
    answeredEraKey: null,
    wrongEraKey: null,
    results: [],
    isComplete: false,
  }));

  const selectEra = useCallback(
    (eraKey: string) => {
      setState((prev) => {
        if (prev.isComplete) return prev;
        if (prev.answeredEraKey !== null) return prev; // already answered

        const currentCard = prev.cards[prev.currentIndex];
        if (!currentCard) return prev;

        const isCorrect = eraKey === currentCard.era_color_key;
        const correctPosition = eraKeys.indexOf(currentCard.era_color_key);
        const userPosition = eraKeys.indexOf(eraKey);

        const newResult: CardResult = {
          cardId: currentCard.id,
          correct: isCorrect,
          correctPosition,
          userPosition,
        };

        return {
          ...prev,
          answeredEraKey: currentCard.era_color_key, // always reveal correct
          wrongEraKey: isCorrect ? null : eraKey,
          results: [...prev.results, newResult],
        };
      });
    },
    [eraKeys],
  );

  const advance = useCallback(() => {
    setState((prev) => {
      if (prev.answeredEraKey === null) return prev; // must answer first

      const nextIndex = prev.currentIndex + 1;
      const isComplete = nextIndex >= prev.cards.length;

      return {
        ...prev,
        currentIndex: nextIndex,
        answeredEraKey: null,
        wrongEraKey: null,
        isComplete,
      };
    });
  }, []);

  const currentCard = state.cards[state.currentIndex] ?? null;
  const score = state.results.filter((r) => r.correct).length;
  const total = state.cards.length;

  return {
    currentCard,
    currentIndex: state.currentIndex,
    total,
    score,
    answeredEraKey: state.answeredEraKey,
    wrongEraKey: state.wrongEraKey,
    results: state.results,
    isComplete: state.isComplete,
    selectEra,
    advance,
  };
}
