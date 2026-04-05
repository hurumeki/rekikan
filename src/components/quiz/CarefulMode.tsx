'use client';

import { useEffect } from 'react';
import type { Card as CardType, CardResult } from '@/lib/types';
import { useCarefulMode } from '@/hooks/useCarefulMode';
import Card from '@/components/card/Card';
import { formatYearRange } from '@/lib/quiz-engine';
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
    feedback,
    isComplete,
    score,
    total,
    results,
    selectCard,
    dismissFeedback,
  } = useCarefulMode(cards, correctOrder);

  useEffect(() => {
    if (isComplete && !feedback) {
      onComplete(results, score, total);
    }
  }, [isComplete, feedback, results, score, total, onComplete]);

  return (
    <div className={styles.container}>
      {confirmedCards.length > 0 && (
        <div className={styles.confirmedArea}>
          <div className={styles.confirmedLabel}>確定エリア</div>
          {confirmedCards.map(({ card, correct }) => (
            <Card
              key={card.id}
              card={card}
              state={correct ? 'correct' : 'incorrect'}
              eraColor={eraColors[card.era_color_key] ?? '#888'}
              showYear
              showDescription
            />
          ))}
        </div>
      )}

      {!isComplete && <div className={styles.prompt}>残りの中で1番古いのはどれ？</div>}

      {remainingCards.length > 0 && (
        <div className={styles.remainingArea}>
          {remainingCards.map((card) => (
            <Card
              key={card.id}
              card={card}
              state="unselected"
              eraColor={eraColors[card.era_color_key] ?? '#888'}
              showHint={hintEnabled}
              onClick={() => selectCard(card.id)}
            />
          ))}
        </div>
      )}

      {feedback && (
        <div className={styles.feedbackOverlay}>
          <div className={styles.feedbackCard}>
            <div
              className={
                feedback.type === 'correct' ? styles.feedbackCorrect : styles.feedbackIncorrect
              }
            >
              {feedback.type === 'correct' ? '正解！' : '不正解'}
            </div>
            <div>
              {feedback.correctCard.name && <strong>{feedback.correctCard.name}</strong>}
              <div>{feedback.correctCard.description}</div>
              <div>{formatYearRange(feedback.correctCard.year, feedback.correctCard.year_end)}</div>
            </div>
            <button className={styles.feedbackButton} onClick={dismissFeedback}>
              次へ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
