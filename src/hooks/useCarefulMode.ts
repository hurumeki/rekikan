'use client';

import { useState, useCallback } from 'react';
import type { Card, CardResult } from '@/lib/types';
import { shuffleArray } from '@/lib/quiz-engine';

interface CarefulModeState {
  remainingCards: Card[];
  confirmedCards: Card[];
  mistakeCardIds: Set<string>; // cards where user made at least one mistake
  wrongCardId: string | null; // currently shaking card
  isComplete: boolean;
  score: number;
  total: number;
}

export function useCarefulMode(cards: Card[], correctOrder: string[]) {
  const [state, setState] = useState<CarefulModeState>(() => ({
    remainingCards: shuffleArray(cards),
    confirmedCards: [],
    mistakeCardIds: new Set(),
    wrongCardId: null,
    isComplete: false,
    score: 0,
    total: cards.length,
  }));

  const selectCard = useCallback(
    (cardId: string) => {
      setState((prev) => {
        if (prev.isComplete) return prev;

        const selectedCard = prev.remainingCards.find((c) => c.id === cardId);
        if (!selectedCard) return prev;

        const expectedId = correctOrder[prev.confirmedCards.length];
        if (!expectedId) return prev;

        const isCorrect = cardId === expectedId;

        if (isCorrect) {
          const newConfirmed = [...prev.confirmedCards, selectedCard];
          const newRemaining = prev.remainingCards.filter((c) => c.id !== cardId);
          return {
            ...prev,
            confirmedCards: newConfirmed,
            remainingCards: newRemaining,
            wrongCardId: null,
            isComplete: newRemaining.length === 0,
            score: prev.mistakeCardIds.has(expectedId) ? prev.score : prev.score + 1,
          };
        } else {
          const newMistakes = new Set(prev.mistakeCardIds);
          newMistakes.add(expectedId);
          return {
            ...prev,
            wrongCardId: cardId,
            mistakeCardIds: newMistakes,
          };
        }
      });
    },
    [correctOrder],
  );

  const clearWrong = useCallback(() => {
    setState((prev) => ({ ...prev, wrongCardId: null }));
  }, []);

  const results: CardResult[] = state.confirmedCards.map((card, i) => ({
    cardId: card.id,
    correct: !state.mistakeCardIds.has(card.id),
    correctPosition: i,
    userPosition: i,
  }));

  return {
    remainingCards: state.remainingCards,
    confirmedCards: state.confirmedCards,
    mistakeCardIds: state.mistakeCardIds,
    wrongCardId: state.wrongCardId,
    isComplete: state.isComplete,
    score: state.score,
    total: state.total,
    results,
    selectCard,
    clearWrong,
  };
}
