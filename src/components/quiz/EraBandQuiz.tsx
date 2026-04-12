'use client';

import { useEffect } from 'react';
import type { Card as CardType, CardResult, EraColor } from '@/lib/types';
import { useEraBandMode } from '@/hooks/useEraBandMode';
import Card from '@/components/card/Card';
import { formatYearRange } from '@/lib/quiz-engine';
import styles from './EraBandQuiz.module.css';

interface EraBandQuizProps {
  cards: CardType[];
  correctOrder: string[];
  eraColors: Record<string, string>;
  hintEnabled: boolean;
  onComplete: (results: CardResult[], score: number, total: number) => void;
  eraConfig: Record<string, EraColor>;
}

export default function EraBandQuiz({
  cards,
  eraColors,
  hintEnabled,
  onComplete,
  eraConfig,
}: EraBandQuizProps) {
  const {
    currentCard,
    currentIndex,
    total,
    score,
    answeredEraKey,
    wrongEraKey,
    results,
    isComplete,
    selectEra,
    advance,
  } = useEraBandMode(cards, eraConfig);

  useEffect(() => {
    if (isComplete) {
      onComplete(results, score, total);
    }
  }, [isComplete, results, score, total, onComplete]);

  if (!currentCard) return null;

  const eraKeys = Object.keys(eraConfig);
  const isCorrect = answeredEraKey !== null && wrongEraKey === null;

  return (
    <div className={styles.container}>
      <div className={styles.progress}>
        {currentIndex + 1} / {total}
      </div>

      <div className={styles.prompt}>この出来事はどの時代？</div>

      <Card
        card={currentCard}
        state="unselected"
        eraColor={eraColors[currentCard.era_color_key] ?? '#888'}
        showHint={hintEnabled}
        showYear={false}
        showDescription={answeredEraKey !== null}
        hideEraBadge={true}
      />

      <div className={styles.eraButtons}>
        {eraKeys.map((key) => {
          const era = eraConfig[key];
          const isCorrectAnswer = key === answeredEraKey;
          const isWrongAnswer = key === wrongEraKey;
          const isAnswered = answeredEraKey !== null;

          let buttonClass = styles.eraButton;
          if (isCorrectAnswer) buttonClass += ` ${styles.correct}`;
          else if (isWrongAnswer) buttonClass += ` ${styles.incorrect}`;
          else if (isAnswered) buttonClass += ` ${styles.dimmed}`;

          return (
            <button
              key={key}
              className={buttonClass}
              style={
                {
                  '--era-color': era.color,
                } as React.CSSProperties
              }
              onClick={() => selectEra(key)}
              disabled={isAnswered}
            >
              <span className={styles.eraColorDot} style={{ background: era.color }} />
              {era.label}
            </button>
          );
        })}
      </div>

      {answeredEraKey !== null && (
        <div
          className={`${styles.feedback} ${isCorrect ? styles.feedbackCorrect : styles.feedbackWrong}`}
        >
          {isCorrect
            ? `正解！ ${formatYearRange(currentCard.year, currentCard.year_end)}`
            : `不正解 — 正解は「${eraConfig[answeredEraKey]?.label}」（${formatYearRange(currentCard.year, currentCard.year_end)}）`}
        </div>
      )}

      {answeredEraKey !== null && !isComplete && (
        <button className={styles.nextButton} onClick={advance}>
          次へ
        </button>
      )}
    </div>
  );
}
