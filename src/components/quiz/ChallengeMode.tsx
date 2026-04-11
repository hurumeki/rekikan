'use client';

import { useEffect } from 'react';
import type { Card as CardType, CardResult } from '@/lib/types';
import { useChallengeMode } from '@/hooks/useChallengeMode';
import Card from '@/components/card/Card';
import styles from './ChallengeMode.module.css';

interface ChallengeModeProps {
  cards: CardType[];
  correctOrder: string[];
  eraColors: Record<string, string>;
  hintEnabled: boolean;
  onComplete: (results: CardResult[], score: number, total: number) => void;
}

export default function ChallengeMode({
  cards,
  correctOrder,
  eraColors,
  hintEnabled,
  onComplete,
}: ChallengeModeProps) {
  const {
    cards: shuffledCards,
    isConfirmed,
    results,
    score,
    total,
    allSelected,
    toggleSelect,
    confirm,
    getCardState,
    getSelectionNumber,
  } = useChallengeMode(cards, correctOrder);

  useEffect(() => {
    if (isConfirmed && results) {
      onComplete(results, score, total);
    }
  }, [isConfirmed, results, score, total, onComplete]);

  return (
    <div className={styles.container}>
      {!isConfirmed && <div className={styles.instruction}>古い順にカードをタップしてください</div>}

      {isConfirmed && results && (
        <div className={styles.resultInfo}>
          {score} / {total} 正解
        </div>
      )}

      <div className={styles.cardList}>
        {shuffledCards.map((card) => {
          const cardState = getCardState(card.id);
          return (
            <Card
              key={card.id}
              card={card}
              state={cardState}
              eraColor={eraColors[card.era_color_key] ?? '#888'}
              selectionNumber={getSelectionNumber(card.id)}
              showHint={hintEnabled}
              showYear={isConfirmed}
              showDescription={isConfirmed}
              onClick={() => toggleSelect(card.id)}
            />
          );
        })}
      </div>

      {!isConfirmed && (
        <button className={styles.confirmButton} disabled={!allSelected} onClick={confirm}>
          この順番で確定する
        </button>
      )}
    </div>
  );
}
