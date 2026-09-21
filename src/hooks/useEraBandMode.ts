'use client';

import { useState, useCallback, useMemo } from 'react';
import type { Card, EraColor } from '@/lib/types';
import { shuffleArray } from '@/lib/quiz-engine';
import {
  advanceEraBand,
  createEraBandState,
  eraBandCurrentCard,
  eraBandScore,
  isEraBandComplete,
  selectEraBand,
} from '@/lib/modes/era-band';

/** 状態遷移は lib/modes/era-band.ts、ここは React への橋渡しだけ。 */
export function useEraBandMode(cards: Card[], eraColors: Record<string, EraColor>) {
  const eraKeys = useMemo(() => Object.keys(eraColors), [eraColors]);
  const [state, setState] = useState(() => createEraBandState(shuffleArray(cards)));

  const selectEra = useCallback(
    (eraKey: string) => setState((prev) => selectEraBand(prev, eraKey, eraKeys)),
    [eraKeys],
  );

  const advance = useCallback(() => setState(advanceEraBand), []);

  return {
    currentCard: eraBandCurrentCard(state),
    currentIndex: state.currentIndex,
    total: state.cards.length,
    score: eraBandScore(state),
    answeredEraKey: state.answeredEraKey,
    wrongEraKey: state.wrongEraKey,
    results: state.results,
    isComplete: isEraBandComplete(state),
    selectEra,
    advance,
  };
}
