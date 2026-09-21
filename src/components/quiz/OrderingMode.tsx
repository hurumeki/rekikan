'use client';

import { useEffect, useMemo } from 'react';
import type { Card as CardType, CardResult, Region } from '@/lib/types';
import { useOrderingMode } from '@/hooks/useOrderingMode';
import Card from '@/components/card/Card';
import styles from './OrderingMode.module.css';

interface OrderingModeProps {
  cards: CardType[];
  correctOrder: string[];
  eraColors: Record<string, string>;
  hintEnabled: boolean;
  onComplete: (results: CardResult[], score: number, total: number) => void;
  /**
   * 渡すと各カードに地域バッジを表示する（同時代モード）。
   * 省略した場合は単一地域のチャレンジモードとして振る舞う。
   */
  regions?: Region[];
}

/**
 * 全カードを並べてから一括判定するモード。
 * チャレンジモードと同時代モードの実体で、違いは地域バッジの有無だけ。
 */
export default function OrderingMode({
  cards,
  correctOrder,
  eraColors,
  hintEnabled,
  onComplete,
  regions,
}: OrderingModeProps) {
  const {
    cards: shuffledCards,
    isConfirmed,
    results,
    score,
    total,
    selectionOrder,
    allSelected,
    toggleSelect,
    confirm,
    getCardState,
    getSelectionNumber,
  } = useOrderingMode(cards, correctOrder);

  const regionMap = useMemo(
    () => (regions ? new Map(regions.map((r) => [r.id, r])) : null),
    [regions],
  );

  const cardClickHandlers = useMemo(
    () => new Map(shuffledCards.map((card) => [card.id, () => toggleSelect(card.id)])),
    [shuffledCards, toggleSelect],
  );

  // 地域バッジはヒント ON か解答後のみ（普段は地域が手がかりになりすぎる）
  const showRegionBadge = !!regionMap && (hintEnabled || isConfirmed);

  const remaining = shuffledCards.length - selectionOrder.length;

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
          const region = regionMap?.get(card.region);
          return (
            <div key={card.id} className={styles.cardWrapper}>
              {region && showRegionBadge && (
                <div className={styles.regionBadge} style={{ borderColor: region.color }}>
                  <span aria-hidden="true">{region.emoji}</span>
                  <span className={styles.regionLabel}>{region.label}</span>
                </div>
              )}
              <Card
                card={card}
                state={getCardState(card.id)}
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
        <button
          className={styles.confirmButton}
          disabled={!allSelected}
          onClick={confirm}
          data-testid="confirm-order"
        >
          {allSelected ? 'この順番で確定する' : `あと${remaining}枚えらぶ`}
        </button>
      )}
    </div>
  );
}
