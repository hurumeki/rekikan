'use client';

import type React from 'react';
import { useMemo } from 'react';
import type { Card as CardType, CardResult, GameMode, Region } from '@/lib/types';
import { computeStars } from '@/lib/progress-rules';
import Card from '@/components/card/Card';
import StarRating from '@/components/ui/StarRating';
import ActionButton from '@/components/ui/ActionButton';
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
  onChangeMode: () => void;
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
  onChangeMode,
  onHome,
  regions,
}: ResultScreenProps) {
  const isPerfect = score === total;
  const isChallenge = mode === 'challenge' || mode === 'cross_region';
  const isCrossRegion = mode === 'cross_region';
  const stars = computeStars(score, total);
  const isNewBest = previousBest !== null && score > previousBest;
  const isFirstAttempt = previousBest === null;
  // 初回かつ満点でないときは称える内容がないので、バッジ自体を出さない
  // （中身だけ null にすると空の色つきピルが残ってしまう）。
  const badgeLabel =
    isPerfect && isFirstAttempt ? '初クリア！🎉' : isNewBest ? '自己ベスト更新！🎉' : null;

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
          <StarRating stars={stars} size="lg" animated />
        </div>

        {isPerfect && <div className={styles.perfect}>パーフェクト！</div>}

        {badgeLabel && <div className={styles.newBestBadge}>{badgeLabel}</div>}
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
        <ActionButton variant="secondary" onClick={onRetry}>
          もう一度
        </ActionButton>
        <ActionButton onClick={onChangeMode}>別のモードで遊ぶ</ActionButton>
      </div>
      <button className={styles.homeLink} onClick={onHome}>
        クイズ一覧に戻る
      </button>
    </div>
  );
}
