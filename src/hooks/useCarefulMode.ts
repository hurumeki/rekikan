'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import type { Card } from '@/lib/types';
import { shuffleArray } from '@/lib/quiz-engine';
import {
  carefulResults,
  carefulScore,
  clearCarefulWrong,
  createCarefulState,
  isCarefulComplete,
  selectCarefulCard,
} from '@/lib/modes/careful';

/** 状態遷移は lib/modes/careful.ts、ここは React への橋渡しだけ。 */
export function useCarefulMode(cards: Card[], correctOrder: string[]) {
  // 正解直後の連打で 2 枚目が飛ばないようにするための冷却期間
  const cooldownUntil = useRef(0);
  const [state, setState] = useState(() => createCarefulState(shuffleArray(cards)));

  const selectCard = useCallback((cardId: string) => {
    if (Date.now() < cooldownUntil.current) return;
    setState((prev) => {
      const next = selectCarefulCard(prev, cardId);
      // 確定した（＝正解した）ときだけ冷却する
      if (next.confirmedCards.length > prev.confirmedCards.length) {
        cooldownUntil.current = Date.now() + 300;
      }
      return next;
    });
  }, []);

  const clearWrong = useCallback(() => setState(clearCarefulWrong), []);

  const results = useMemo(() => carefulResults(state, correctOrder), [state, correctOrder]);

  return {
    remainingCards: state.remainingCards,
    confirmedCards: state.confirmedCards,
    wrongCardId: state.wrongCardId,
    isComplete: isCarefulComplete(state),
    score: carefulScore(state),
    total: state.confirmedCards.length + state.remainingCards.length,
    results,
    selectCard,
    clearWrong,
  };
}
