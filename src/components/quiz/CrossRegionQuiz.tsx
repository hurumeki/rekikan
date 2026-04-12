'use client';

import { useEffect, useMemo } from 'react';
import type { Card as CardType, CardResult, Region } from '@/lib/types';
import { useCrossRegionMode } from '@/hooks/useCrossRegionMode';
import Card from '@/components/card/Card';
import styles from './CrossRegionQuiz.module.css';

interface CrossRegionQuizProps {
  cards: CardType[];
  correctOrder: string[];
  eraColors: Record<string, string>;
  hintEnabled: boolean;
  onComplete: (results: CardResult[], score: number, total: number) => void;
  regions: Region[];
}

export default function CrossRegionQuiz({
  cards,
  correctOrder,
  eraColors,
  hintEnabled,
  onComplete,
  regions,
}: CrossRegionQuizProps) {
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
  } = useCrossRegionMode(cards, correctOrder);

  const regionMap = useMemo(() => new Map(regions.map((r) => [r.id, r])), [regions]);

  const cardClickHandlers = useMemo(
    () => new Map(shuffledCards.map((card) => [card.id, () => toggleSelect(card.id)])),
    [shuffledCards, toggleSelect],
  );

  // Show region badge only with hint enabled (before answer) or always after confirmation
  const showRegionBadge = hintEnabled || isConfirmed;

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
          const region = regionMap.get(card.region);
          return (
            <div key={card.id} className={styles.cardWrapper}>
              {region && showRegionBadge && (
                <div className={styles.regionBadge} style={{ borderColor: region.color }}>
                  <span>{region.emoji}</span>
                  <span className={styles.regionLabel}>{region.label}</span>
                </div>
              )}
              <Card
                card={card}
                state={cardState}
                eraColor={eraColors[card.era_color_key] ?? '#888'}
                selectionNumber={getSelectionNumber(card.id)}
                showHint={hintEnabled}
                showYear={isConfirmed}
                showDescription={isConfirmed}
                onClick={cardClickHandlers.get(card.id)}
              />
            </div>
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
