'use client';

import { useState, useCallback } from 'react';
import type { Card, CardResult } from '@/lib/types';
import { shuffleArray } from '@/lib/quiz-engine';

interface TimelineModeState {
  cards: Card[];
  currentIndex: number;
  selectedYear: number | null;
  answeredYear: number | null; // confirmed answer
  results: CardResult[];
  isComplete: boolean;
}

/**
 * Calculates the threshold for "correct" answer.
 * Returns half-width of each era band in years, so clicking within
 * the correct era counts as correct.
 */
function calcThreshold(cards: Card[], rangeStart: number, rangeEnd: number): number {
  const span = rangeEnd - rangeStart;
  // Allow roughly 1/6 of the total range as the acceptable margin
  return Math.round(span / 6);
}

export function useTimelineMode(cards: Card[], rangeStart: number, rangeEnd: number) {
  const threshold = calcThreshold(cards, rangeStart, rangeEnd);

  const [state, setState] = useState<TimelineModeState>(() => ({
    cards: shuffleArray(cards),
    currentIndex: 0,
    selectedYear: null,
    answeredYear: null,
    results: [],
    isComplete: false,
  }));

  /** User taps/drags on the timeline to select a year (0–100 percentage) */
  const selectPosition = useCallback(
    (pct: number) => {
      setState((prev) => {
        if (prev.answeredYear !== null) return prev; // already confirmed
        const year = Math.round(rangeStart + (rangeEnd - rangeStart) * pct);
        return { ...prev, selectedYear: year };
      });
    },
    [rangeStart, rangeEnd],
  );

  /** Move selected year by delta years (positive = forward, negative = backward) */
  const adjustYear = useCallback(
    (delta: number) => {
      setState((prev) => {
        if (prev.answeredYear !== null) return prev;
        const base = prev.selectedYear ?? Math.round((rangeStart + rangeEnd) / 2);
        const newYear = Math.max(rangeStart, Math.min(rangeEnd, base + delta));
        return { ...prev, selectedYear: newYear };
      });
    },
    [rangeStart, rangeEnd],
  );

  /** User confirms their selected position */
  const confirmAnswer = useCallback(() => {
    setState((prev) => {
      if (prev.selectedYear === null || prev.answeredYear !== null) return prev;

      const currentCard = prev.cards[prev.currentIndex];
      if (!currentCard) return prev;

      const diff = Math.abs(prev.selectedYear - currentCard.year);
      const isCorrect = diff <= threshold;

      // correctPosition/userPosition: store as year values using the range [0..cards.length-1] index
      // We repurpose the CardResult fields to store year values for display purposes.
      const newResult: CardResult = {
        cardId: currentCard.id,
        correct: isCorrect,
        correctPosition: currentCard.year,
        userPosition: prev.selectedYear,
      };

      return {
        ...prev,
        answeredYear: prev.selectedYear,
        results: [...prev.results, newResult],
      };
    });
  }, [threshold]);

  const advance = useCallback(() => {
    setState((prev) => {
      if (prev.answeredYear === null) return prev;

      const nextIndex = prev.currentIndex + 1;
      const isComplete = nextIndex >= prev.cards.length;

      return {
        ...prev,
        currentIndex: nextIndex,
        selectedYear: null,
        answeredYear: null,
        isComplete,
      };
    });
  }, []);

  const currentCard = state.cards[state.currentIndex] ?? null;
  const score = state.results.filter((r) => r.correct).length;
  const total = state.cards.length;

  /** Convert a year to 0–100 percentage for timeline rendering */
  const yearToPercent = useCallback(
    (year: number) => ((year - rangeStart) / (rangeEnd - rangeStart)) * 100,
    [rangeStart, rangeEnd],
  );

  return {
    currentCard,
    currentIndex: state.currentIndex,
    total,
    score,
    selectedYear: state.selectedYear,
    answeredYear: state.answeredYear,
    results: state.results,
    isComplete: state.isComplete,
    threshold,
    selectPosition,
    adjustYear,
    confirmAnswer,
    advance,
    yearToPercent,
  };
}
