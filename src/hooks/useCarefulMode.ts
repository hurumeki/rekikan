'use client';

import { useState, useCallback } from 'react';
import type { Card, CardResult } from '@/lib/types';
import { shuffleArray } from '@/lib/quiz-engine';

interface CarefulModeState {
  remainingCards: Card[];
  confirmedCards: { card: Card; correct: boolean }[];
  currentCorrectCard: Card | null;
  feedback: { type: 'correct' | 'incorrect'; correctCard: Card } | null;
  isComplete: boolean;
  score: number;
  total: number;
  results: CardResult[];
}

export function useCarefulMode(cards: Card[], correctOrder: string[]) {
  // Initialize: shuffle the cards
  const [state, setState] = useState<CarefulModeState>(() => ({
    remainingCards: shuffleArray(cards),
    confirmedCards: [],
    currentCorrectCard: null,
    feedback: null,
    isComplete: false,
    score: 0,
    total: cards.length,
    results: [],
  }));

  const selectCard = useCallback(
    (cardId: string) => {
      setState((prev) => {
        if (prev.feedback || prev.isComplete) return prev;

        const selectedCard = prev.remainingCards.find((c) => c.id === cardId);
        if (!selectedCard) return prev;

        const isCorrect = cardId === correctOrder[prev.confirmedCards.length];
        const correctCard = prev.remainingCards.find(
          (c) => c.id === correctOrder[prev.confirmedCards.length],
        )!;

        const newResult: CardResult = {
          cardId,
          correct: isCorrect,
          correctPosition: prev.confirmedCards.length,
          userPosition: prev.confirmedCards.length,
        };

        if (isCorrect) {
          const newConfirmed = [...prev.confirmedCards, { card: selectedCard, correct: true }];
          const newRemaining = prev.remainingCards.filter((c) => c.id !== cardId);
          const newResults = [...prev.results, newResult];
          return {
            ...prev,
            confirmedCards: newConfirmed,
            remainingCards: newRemaining,
            feedback: { type: 'correct' as const, correctCard: selectedCard },
            isComplete: newRemaining.length === 0,
            score: prev.score + 1,
            results: newResults,
          };
        } else {
          return {
            ...prev,
            feedback: { type: 'incorrect' as const, correctCard },
            results: [...prev.results, newResult],
          };
        }
      });
    },
    [correctOrder],
  );

  const dismissFeedback = useCallback(() => {
    setState((prev) => {
      if (!prev.feedback) return prev;
      // If incorrect, move the correct card to confirmed and remove from remaining
      if (prev.feedback.type === 'incorrect') {
        const correctCard = prev.feedback.correctCard;
        return {
          ...prev,
          confirmedCards: [...prev.confirmedCards, { card: correctCard, correct: false }],
          remainingCards: prev.remainingCards.filter((c) => c.id !== correctCard.id),
          feedback: null,
          isComplete: prev.remainingCards.filter((c) => c.id !== correctCard.id).length === 0,
        };
      }
      return { ...prev, feedback: null };
    });
  }, []);

  return { ...state, selectCard, dismissFeedback };
}
