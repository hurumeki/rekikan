'use client';

import { useState, useCallback } from 'react';
import type { Card, CardResult } from '@/lib/types';
import { shuffleArray } from '@/lib/quiz-engine';
import { isWithinTolerance, type TimelineScale } from '@/lib/timeline-scale';

interface TimelineModeState {
  cards: Card[];
  currentIndex: number;
  selectedYear: number | null;
  answeredYear: number | null; // confirmed answer
  results: CardResult[];
  isComplete: boolean;
}

export function useTimelineMode(cards: Card[], scale: TimelineScale) {
  const { start: rangeStart, end: rangeEnd } = scale.range;

  const [state, setState] = useState<TimelineModeState>(() => ({
    cards: shuffleArray(cards),
    currentIndex: 0,
    selectedYear: null,
    answeredYear: null,
    results: [],
    isComplete: false,
  }));

  /** User taps/drags on the timeline to select a year (0–1 of the width) */
  const selectPosition = useCallback(
    (pct: number) => {
      setState((prev) => {
        if (prev.answeredYear !== null) return prev; // already confirmed
        return { ...prev, selectedYear: scale.percentToYear(pct * 100) };
      });
    },
    [scale],
  );

  /**
   * 画面上の距離で位置を動かす。時代帯ごとに等幅なので、
   * 近代では数年単位、先史では数百年単位の移動になる。
   */
  const adjustPercent = useCallback(
    (deltaPct: number) => {
      setState((prev) => {
        if (prev.answeredYear !== null) return prev;
        const basePct = prev.selectedYear === null ? 50 : scale.yearToPercent(prev.selectedYear);
        return { ...prev, selectedYear: scale.percentToYear(basePct + deltaPct) };
      });
    },
    [scale],
  );

  /** Move selected year by delta years (positive = forward, negative = backward) */
  const adjustYear = useCallback(
    (delta: number) => {
      setState((prev) => {
        if (prev.answeredYear !== null) return prev;
        const base = prev.selectedYear ?? scale.percentToYear(50);
        const newYear = Math.max(rangeStart, Math.min(rangeEnd, base + delta));
        return { ...prev, selectedYear: newYear };
      });
    },
    [rangeStart, rangeEnd, scale],
  );

  /** User confirms their selected position */
  const confirmAnswer = useCallback(() => {
    setState((prev) => {
      if (prev.selectedYear === null || prev.answeredYear !== null) return prev;

      const currentCard = prev.cards[prev.currentIndex];
      if (!currentCard) return prev;

      // 年数ではなく画面上の距離で判定する（timeline-scale.ts 参照）
      const isCorrect = isWithinTolerance(prev.selectedYear, currentCard.year, scale);

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
  }, [scale]);

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

  return {
    currentCard,
    currentIndex: state.currentIndex,
    total,
    score,
    selectedYear: state.selectedYear,
    answeredYear: state.answeredYear,
    results: state.results,
    isComplete: state.isComplete,
    selectPosition,
    adjustYear,
    adjustPercent,
    confirmAnswer,
    advance,
    yearToPercent: scale.yearToPercent,
  };
}
