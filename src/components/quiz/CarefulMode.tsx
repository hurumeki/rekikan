'use client';

import { useCallback, useEffect, useMemo, useRef, useLayoutEffect } from 'react';
import type { Card as CardType, CardResult } from '@/lib/types';
import { useCarefulMode } from '@/hooks/useCarefulMode';
import Card from '@/components/card/Card';
import styles from './CarefulMode.module.css';

interface CarefulModeProps {
  cards: CardType[];
  correctOrder: string[];
  eraColors: Record<string, string>;
  hintEnabled: boolean;
  onComplete: (results: CardResult[], score: number, total: number) => void;
}

export default function CarefulMode({
  cards,
  correctOrder,
  eraColors,
  hintEnabled,
  onComplete,
}: CarefulModeProps) {
  const {
    remainingCards,
    confirmedCards,
    wrongCardId,
    isComplete,
    score,
    total,
    results,
    selectCard,
    clearWrong,
  } = useCarefulMode(cards, correctOrder);

  // FLIP animation refs
  const remainingCardRefs = useRef<Map<string, HTMLElement>>(new Map());
  const confirmedCardRefs = useRef<Map<string, HTMLElement>>(new Map());
  const pendingFlipRef = useRef<{ cardId: string } | null>(null);
  const prevRectsRef = useRef<Map<string, DOMRect>>(new Map());

  const handleCardClick = useCallback(
    (cardId: string) => {
      // Record current positions of all visible cards before state update
      const rects = new Map<string, DOMRect>();
      for (const [id, el] of remainingCardRefs.current) {
        rects.set(id, el.getBoundingClientRect());
      }
      for (const [id, el] of confirmedCardRefs.current) {
        rects.set(id, el.getBoundingClientRect());
      }
      prevRectsRef.current = rects;
      pendingFlipRef.current = { cardId };
      selectCard(cardId);
    },
    [selectCard],
  );

  useLayoutEffect(() => {
    const flip = pendingFlipRef.current;
    if (!flip) return;

    const prevRects = prevRectsRef.current;
    type AnimStep = { el: HTMLElement; deltaX: number; deltaY: number };

    // Phase 1 (Read): collect new positions and compute deltas — no DOM writes, no forced reflows
    const toAnimate: AnimStep[] = [];

    const destEl = confirmedCardRefs.current.get(flip.cardId);
    if (destEl) {
      const prevRect = prevRects.get(flip.cardId);
      if (prevRect) {
        const newRect = destEl.getBoundingClientRect();
        toAnimate.push({
          el: destEl,
          deltaX: prevRect.left - newRect.left,
          deltaY: prevRect.top - newRect.top,
        });
      }
    }

    for (const [cardId, el] of remainingCardRefs.current) {
      const prevRect = prevRects.get(cardId);
      if (!prevRect) continue;
      const newRect = el.getBoundingClientRect();
      const deltaY = prevRect.top - newRect.top;
      const deltaX = prevRect.left - newRect.left;
      if (Math.abs(deltaY) > 0.5 || Math.abs(deltaX) > 0.5) {
        toAnimate.push({ el, deltaX, deltaY });
      }
    }

    if (toAnimate.length === 0) {
      pendingFlipRef.current = null;
      return;
    }

    // Phase 2 (Write): apply inverted transforms from local array in one batch (single reflow trigger below)
    const animatedEls = toAnimate.map(({ el, deltaX, deltaY }) => {
      el.style.transition = 'none';
      el.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
      return el;
    });

    // Force reflow to ensure inverted transforms are applied before animation
    animatedEls[0].getBoundingClientRect();

    // Play: animate all elements to their final positions simultaneously
    for (const el of animatedEls) {
      el.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      el.style.transform = '';
    }

    pendingFlipRef.current = null;
  }, [confirmedCards.length]);

  const cardClickHandlers = useMemo(
    () => new Map(remainingCards.map((card) => [card.id, () => handleCardClick(card.id)])),
    [remainingCards, handleCardClick],
  );

  useEffect(() => {
    if (isComplete) {
      onComplete(results, score, total);
    }
  }, [isComplete, results, score, total, onComplete]);

  // Auto-clear shake animation after 500ms
  useEffect(() => {
    if (wrongCardId) {
      const timer = setTimeout(clearWrong, 500);
      return () => clearTimeout(timer);
    }
  }, [wrongCardId, clearWrong]);

  return (
    <div className={styles.container}>
      {!isComplete && <div className={styles.prompt}>残りの中で1番古いのはどれ？</div>}

      {remainingCards.length > 0 && (
        <div className={styles.remainingArea}>
          {remainingCards.map((card) => (
            <div
              key={card.id}
              ref={(el) => {
                if (el) remainingCardRefs.current.set(card.id, el);
                else remainingCardRefs.current.delete(card.id);
              }}
              className={wrongCardId === card.id ? styles.shake : undefined}
            >
              <Card
                card={card}
                state={wrongCardId === card.id ? 'incorrect' : 'unselected'}
                eraColor={eraColors[card.era_color_key] ?? '#888'}
                showHint={hintEnabled}
                onClick={cardClickHandlers.get(card.id)}
              />
            </div>
          ))}
        </div>
      )}

      {confirmedCards.length > 0 && (
        <div className={styles.confirmedArea}>
          {confirmedCards.map((card) => (
            <div
              key={card.id}
              ref={(el) => {
                if (el) confirmedCardRefs.current.set(card.id, el);
                else confirmedCardRefs.current.delete(card.id);
              }}
            >
              <Card
                card={card}
                state="correct"
                eraColor={eraColors[card.era_color_key] ?? '#888'}
                showYear
                showDescription
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
