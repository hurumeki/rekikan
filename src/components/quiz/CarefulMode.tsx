'use client';

import { useState, useEffect, useRef, useLayoutEffect } from 'react';
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

  // Placeholder state for gap-filling animation
  const [departingId, setDepartingId] = useState<string | null>(null);
  const prevRemainingRef = useRef<CardType[]>([]);
  const placeholderRef = useRef<HTMLDivElement | null>(null);
  const collapseT1 = useRef<ReturnType<typeof setTimeout> | null>(null);
  const collapseT2 = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCardClick = (cardId: string) => {
    if (collapseT1.current) clearTimeout(collapseT1.current);
    if (collapseT2.current) clearTimeout(collapseT2.current);
    const el = remainingCardRefs.current.get(cardId);
    if (el) {
      pendingFlipRef.current = { rect: el.getBoundingClientRect(), cardId };
      prevRemainingRef.current = [...remainingCards];
      setDepartingId(cardId);
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

    // After FLIP completes (400ms), collapse the placeholder
    collapseT1.current = setTimeout(() => {
      const ph = placeholderRef.current;
      if (!ph) {
        setDepartingId(null);
        return;
      }
      const fullHeight = ph.offsetHeight;
      ph.style.height = `${fullHeight}px`;
      ph.style.overflow = 'hidden';
      // Force reflow before starting transition
      ph.getBoundingClientRect();
      ph.style.transition = 'height 0.25s ease, margin-top 0.25s ease';
      ph.style.height = '0px';
      ph.style.marginTop = '-8px'; // cancel flex gap above
      collapseT2.current = setTimeout(() => setDepartingId(null), 250);
    }, 400);
  }, [confirmedCards.length]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (collapseT1.current) clearTimeout(collapseT1.current);
      if (collapseT2.current) clearTimeout(collapseT2.current);
    };
  }, []);

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

  // While animating, show the previous card list (with departing card as placeholder)
  const displayRemaining = departingId ? prevRemainingRef.current : remainingCards;

  return (
    <div className={styles.container}>
      {!isComplete && <div className={styles.prompt}>この中で1番古いのはどれ？</div>}

      {displayRemaining.length > 0 && (
        <div className={styles.remainingArea}>
          {displayRemaining.map((card) => {
            const isDeparting = card.id === departingId;
            return (
              <div
                key={card.id}
                ref={(el) => {
                  if (isDeparting) {
                    placeholderRef.current = el;
                  } else {
                    if (el) remainingCardRefs.current.set(card.id, el);
                    else remainingCardRefs.current.delete(card.id);
                  }
                }}
                style={isDeparting ? { visibility: 'hidden', pointerEvents: 'none' } : undefined}
                className={!isDeparting && wrongCardId === card.id ? styles.shake : undefined}
              >
                {!isDeparting && (
                  <Card
                    card={card}
                    state={wrongCardId === card.id ? 'incorrect' : 'unselected'}
                    eraColor={eraColors[card.era_color_key] ?? '#888'}
                    showHint={hintEnabled}
                    onClick={() => handleCardClick(card.id)}
                  />
                )}
              </div>
            );
          })}
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
