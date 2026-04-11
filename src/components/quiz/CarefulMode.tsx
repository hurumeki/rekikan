'use client';

import { useEffect, useRef, useLayoutEffect } from 'react';
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
  const pendingFlipRef = useRef<{ rect: DOMRect; cardId: string } | null>(null);

  const handleCardClick = (cardId: string) => {
    const el = remainingCardRefs.current.get(cardId);
    if (el) {
      pendingFlipRef.current = { rect: el.getBoundingClientRect(), cardId };
    }
    selectCard(cardId);
  };

  useLayoutEffect(() => {
    const flip = pendingFlipRef.current;
    if (!flip) return;

    const destEl = confirmedCardRefs.current.get(flip.cardId);
    if (!destEl) return;

    const endRect = destEl.getBoundingClientRect();
    const deltaY = flip.rect.top - endRect.top;
    const deltaX = flip.rect.left - endRect.left;

    // Invert: move element to its original visual position
    destEl.style.transition = 'none';
    destEl.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

    // Force reflow
    destEl.getBoundingClientRect();

    // Play: animate to final position
    destEl.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    destEl.style.transform = '';

    pendingFlipRef.current = null;
  }, [confirmedCards.length]);

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
                onClick={() => handleCardClick(card.id)}
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
