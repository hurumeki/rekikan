'use client';

import type React from 'react';
import { useMemo } from 'react';
import type { Card as CardType, CardResult, GameMode, Region } from '@/lib/types';
import { computeStars } from '@/lib/progress';
import Card from '@/components/card/Card';
import styles from './ResultScreen.module.css';

interface ResultScreenProps {
  cards: CardType[];
  results: CardResult[];
  correctOrder: string[];
  score: number;
  total: number;
  eraColors: Record<string, string>;
  mode: GameMode;
  previousBest: number | null;
  onRetry: () => void;
  onHome: () => void;
  regions?: Region[];
}

export default function ResultScreen({
  cards,
  results,
  correctOrder,
  score,
  total,
  eraColors,
  mode,
  previousBest,
  onRetry,
  onHome,
  regions,
}: ResultScreenProps) {
  const isPerfect = score === total;
  const isChallenge = mode === 'challenge' || mode === 'cross_region';
  const isCrossRegion = mode === 'cross_region';
  const stars = computeStars(score, total);
  const isNewBest = previousBest !== null && score > previousBest;
  const isFirstAttempt = previousBest === null;

  const cardMap = useMemo(() => new Map(cards.map((c) => [c.id, c])), [cards]);
  const resultMap = useMemo(() => new Map(results.map((r) => [r.cardId, r])), [results]);
  const regionMap = useMemo(
    () => (regions ? new Map(regions.map((r) => [r.id, r])) : null),
    [regions],
  );

  return (
    <div className={styles.container}>
      <div className={styles.scoreSection}>
        <div className={styles.score}>
          {score} / {total} 正解
        </div>

        <div className={styles.starsRow}>
          {[1, 2, 3].map((i) => (
            <span
              key={i}
              className={i <= stars ? styles.starFilled : styles.starEmpty}
              style={{ '--star-delay': `${(i - 1) * 0.12}s` } as React.CSSProperties}
            >
              ★
            </span>
          ))}
        </div>

        {isPerfect && <div className={styles.perfect}>パーフェクト！</div>}

        {(isNewBest || isFirstAttempt) && (
          <div className={styles.newBestBadge}>
            {isPerfect && isFirstAttempt ? '初クリア！🎉' : isNewBest ? `自己ベスト更新！🎉` : null}
          </div>
        )}
      </div>

      <div className={styles.cardList}>
        {correctOrder.map((cardId, correctIndex) => {
          const card = cardMap.get(cardId);
          const result = resultMap.get(cardId);
          if (!card) return null;
          const isCorrect = result?.correct ?? false;
          const userPos = result?.userPosition ?? correctIndex;
          const region = isCrossRegion && regionMap ? regionMap.get(card.region) : null;

          return (
            <div
              key={card.id}
              className={styles.cardSlideIn}
              style={{ '--delay': `${correctIndex * 0.06}s` } as React.CSSProperties}
            >
              {region && (
                <div className={styles.regionBadge} style={{ borderColor: region.color }}>
                  <span>{region.emoji}</span>
                  <span className={styles.regionLabel}>{region.label}</span>
                </div>
              )}
              <div className={isChallenge ? styles.comparisonRow : undefined}>
                {isChallenge && (
                  <div className={styles.positionCol}>
                    <div className={styles.correctPos}>{correctIndex + 1}</div>
                    <div
                      className={`${styles.userPos} ${isCorrect ? styles.posCorrect : styles.posWrong}`}
                    >
                      {userPos + 1}
                    </div>
                  </div>
                )}
                <div className={isChallenge ? styles.comparisonCard : undefined}>
                  <Card
                    card={card}
                    state={isCorrect ? 'correct' : 'incorrect'}
                    eraColor={eraColors[card.era_color_key] || '#888'}
                    showYear={true}
                    showDescription={card.type === 'term'}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.buttons}>
        <button className={styles.retryButton} onClick={onRetry}>
          もう一度
        </button>
        <button className={styles.homeButton} onClick={onHome}>
          クイズ一覧に戻る
        </button>
      </div>
    </div>
  );
}
