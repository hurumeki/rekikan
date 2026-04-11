'use client';

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
    selectionOrder,
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

  if (isConfirmed && results) {
    return (
      <div className={styles.container}>
        <div className={styles.resultHeader}>
          <div className={styles.resultScore}>{score} / {total} 正解</div>
          <div className={styles.resultSubLabel}>正解の順番と比較</div>
        </div>

        <div className={styles.comparison}>
          {correctOrder.map((cardId, correctIndex) => {
            const card = cards.find((c) => c.id === cardId);
            const result = results.find((r) => r.cardId === cardId);
            const userIndex = selectionOrder.indexOf(cardId);
            if (!card) return null;
            const isCorrect = result?.correct ?? false;
            return (
              <div key={cardId} className={styles.comparisonRow}>
                <div className={styles.positionCol}>
                  <div className={styles.correctPos}>{correctIndex + 1}</div>
                  <div className={`${styles.userPos} ${isCorrect ? styles.posCorrect : styles.posWrong}`}>
                    {userIndex + 1}
                  </div>
                </div>
                <div className={styles.comparisonCard}>
                  <Card
                    card={card}
                    state={isCorrect ? 'correct' : 'incorrect'}
                    eraColor={eraColors[card.era_color_key] ?? '#888'}
                    showYear
                    showDescription={card.type === 'term'}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <button
          className={styles.seeResultButton}
          onClick={() => onComplete(results, score, total)}
        >
          結果を見る
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {!isConfirmed && <div className={styles.instruction}>古い順にカードをタップしてください</div>}

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
