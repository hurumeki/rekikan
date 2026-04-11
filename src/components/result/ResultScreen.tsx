'use client';

import type React from 'react';
import type { Card as CardType, CardResult, GameMode } from '@/lib/types';
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
  onRetry: () => void;
  onHome: () => void;
}

export default function ResultScreen({
  cards,
  results,
  correctOrder,
  score,
  total,
  eraColors,
  mode,
  onRetry,
  onHome,
}: ResultScreenProps) {
  const isPerfect = score === total;
  const isChallenge = mode === 'challenge';

  return (
    <div className={styles.container}>
      <div className={styles.scoreSection}>
        <div className={styles.score}>
          {score} / {total} 正解
        </div>
        <div className={styles.scoreLabel}>{isPerfect ? '' : `${total - score}問不正解`}</div>
        {isPerfect && <div className={styles.perfect}>パーフェクト！</div>}
      </div>

      <div className={styles.cardList}>
        {correctOrder.map((cardId, correctIndex) => {
          const card = cards.find((c) => c.id === cardId);
          const result = results.find((r) => r.cardId === cardId);
          if (!card) return null;
          const isCorrect = result?.correct ?? false;
          const userPos = result?.userPosition ?? correctIndex;

          return (
            <div
              key={card.id}
              className={`${styles.cardSlideIn} ${isChallenge ? styles.comparisonRow : ''}`}
              style={{ '--delay': `${correctIndex * 0.06}s` } as React.CSSProperties}
            >
              {isChallenge && (
                <div className={styles.positionCol}>
                  <div className={styles.correctPos}>{correctIndex + 1}</div>
                  <div className={`${styles.userPos} ${isCorrect ? styles.posCorrect : styles.posWrong}`}>
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
