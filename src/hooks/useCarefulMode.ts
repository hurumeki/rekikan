'use client';

import { useState, useCallback, useRef } from 'react';
import type { Card, CardResult } from '@/lib/types';
import { shuffleArray, isOldestAmong } from '@/lib/quiz-engine';

interface CarefulModeState {
  remainingCards: Card[];
  confirmedCards: Card[];
  /** 間違えた手数（確定済み枚数 = 手番）。同年カードがあるので ID ではなく手番で持つ。 */
  mistakeSteps: Set<number>;
  wrongCardId: string | null; // currently shaking card
  isComplete: boolean;
  score: number;
  total: number;
}

export function useCarefulMode(cards: Card[], correctOrder: string[]) {
  const cooldownUntil = useRef(0);

  const [state, setState] = useState<CarefulModeState>(() => ({
    remainingCards: shuffleArray(cards),
    confirmedCards: [],
    mistakeSteps: new Set(),
    wrongCardId: null,
    isComplete: false,
    score: 0,
    total: cards.length,
  }));

  const selectCard = useCallback((cardId: string) => {
    if (Date.now() < cooldownUntil.current) return;

    setState((prev) => {
      if (prev.isComplete) return prev;

      const selectedCard = prev.remainingCards.find((c) => c.id === cardId);
      if (!selectedCard) return prev;

      // 残りカードの中で最も古い年。同じ年のカードが複数あれば、
      // どれを選んでも歴史的に正しいので正解として扱う。
      const isCorrect = isOldestAmong(selectedCard, prev.remainingCards);
      const step = prev.confirmedCards.length;

      if (isCorrect) {
        cooldownUntil.current = Date.now() + 300;
        const newRemaining = prev.remainingCards.filter((c) => c.id !== cardId);
        return {
          ...prev,
          confirmedCards: [...prev.confirmedCards, selectedCard],
          remainingCards: newRemaining,
          wrongCardId: null,
          isComplete: newRemaining.length === 0,
          score: prev.mistakeSteps.has(step) ? prev.score : prev.score + 1,
        };
      }

      const newMistakes = new Set(prev.mistakeSteps);
      newMistakes.add(step);
      return {
        ...prev,
        wrongCardId: cardId,
        mistakeSteps: newMistakes,
      };
    });
  }, []);

  const clearWrong = useCallback(() => {
    setState((prev) => ({ ...prev, wrongCardId: null }));
  }, []);

  const results: CardResult[] = state.confirmedCards.map((card, i) => ({
    cardId: card.id,
    correct: !state.mistakeSteps.has(i),
    correctPosition: correctOrder.indexOf(card.id),
    userPosition: i,
  }));

  return {
    remainingCards: state.remainingCards,
    confirmedCards: state.confirmedCards,
    wrongCardId: state.wrongCardId,
    isComplete: state.isComplete,
    score: state.score,
    total: state.total,
    results,
    selectCard,
    clearWrong,
  };
}
