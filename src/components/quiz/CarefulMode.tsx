'use client';

import { useEffect } from 'react';
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
      {confirmedCards.length > 0 && (
        <div className={styles.confirmedArea}>
          <div className={styles.confirmedLabel}>確定エリア</div>
          {confirmedCards.map((card) => (
            <div key={card.id} className={styles.cardSlideIn}>
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

      {!isComplete && <div className={styles.prompt}>残りの中で1番古いのはどれ？</div>}

      {remainingCards.length > 0 && (
        <div className={styles.remainingArea}>
          {remainingCards.map((card) => (
            <div key={card.id} className={wrongCardId === card.id ? styles.shake : undefined}>
              <Card
                card={card}
                state={wrongCardId === card.id ? 'incorrect' : 'unselected'}
                eraColor={eraColors[card.era_color_key] ?? '#888'}
                showHint={hintEnabled}
                onClick={() => selectCard(card.id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
