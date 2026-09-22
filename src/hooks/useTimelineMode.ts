'use client';

import { useState, useCallback } from 'react';
import type { Card } from '@/lib/types';
import { shuffleArray } from '@/lib/quiz-engine';
import type { TimelineScale } from '@/lib/timeline-scale';
import {
  advanceTimeline,
  confirmTimeline,
  createTimelineState,
  isTimelineComplete,
  nudgeTimelinePercent,
  nudgeTimelineYear,
  selectTimelinePercent,
  timelineCurrentCard,
  timelineScore,
} from '@/lib/modes/timeline';

/** 状態遷移は lib/modes/timeline.ts、ここは React への橋渡しだけ。 */
export function useTimelineMode(cards: Card[], scale: TimelineScale) {
  const [state, setState] = useState(() => createTimelineState(shuffleArray(cards)));

  /** タイムラインをタップして位置を決める（0〜1 の割合） */
  const selectPosition = useCallback(
    (ratio: number) => setState((prev) => selectTimelinePercent(prev, ratio * 100, scale)),
    [scale],
  );

  const adjustPercent = useCallback(
    (deltaPercent: number) => setState((prev) => nudgeTimelinePercent(prev, deltaPercent, scale)),
    [scale],
  );

  const adjustYear = useCallback(
    (deltaYears: number) => setState((prev) => nudgeTimelineYear(prev, deltaYears, scale)),
    [scale],
  );

  const confirmAnswer = useCallback(
    () => setState((prev) => confirmTimeline(prev, scale)),
    [scale],
  );

  const advance = useCallback(() => setState(advanceTimeline), []);

  return {
    currentCard: timelineCurrentCard(state),
    currentIndex: state.currentIndex,
    total: state.cards.length,
    score: timelineScore(state),
    selectedYear: state.selectedYear,
    answeredYear: state.answeredYear,
    results: state.results,
    isComplete: isTimelineComplete(state),
    selectPosition,
    adjustYear,
    adjustPercent,
    confirmAnswer,
    advance,
    yearToPercent: scale.yearToPercent,
  };
}
