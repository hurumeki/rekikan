'use client';

import type { Card as CardType, CardResult } from '@/lib/types';
import Card from '@/components/card/Card';
import styles from './ResultScreen.module.css';

interface ResultScreenProps {
  cards: CardType[];
  results: CardResult[];
  correctOrder: string[];
  score: number;
  total: number;
  eraColors: Record<string, string>;
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
  onRetry,
  onHome,
}: ResultScreenProps) {
  const isPerfect = score === total;

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
        {correctOrder.map((cardId) => {
          const card = cards.find((c) => c.id === cardId);
          const result = results.find((r) => r.cardId === cardId);
          if (!card) return null;
          return (
            <Card
              key={card.id}
              card={card}
              state={result?.correct ? 'correct' : 'incorrect'}
              eraColor={eraColors[card.era_color_key] || '#888'}
              showYear={true}
              showDescription={card.type === 'term'}
            />
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
