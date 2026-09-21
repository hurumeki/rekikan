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

  const cardById = useMemo(() => new Map(shuffledCards.map((c) => [c.id, c])), [shuffledCards]);

  /** チップに出す短い見出し */
  const shortLabel = (cardId: string): string => {
    const card = cardById.get(cardId);
    if (!card) return '';
    const text = card.type === 'term' ? (card.name ?? '') : card.description;
    return text.length > 12 ? `${text.slice(0, 12)}…` : text;
  };

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

      {/* 選んだ順を 1 か所にまとめて見せる。番号バッジだけだと
          途中を直したいときに全体の並びが読み取りにくい */}
      {!isConfirmed && selectionOrder.length > 0 && (
        <div className={styles.tray} data-testid="selection-tray">
          <span className={styles.trayLabel}>選んだ順</span>
          <div className={styles.trayItems}>
            {selectionOrder.map((cardId, i) => (
              <button
                key={cardId}
                type="button"
                className={styles.trayItem}
                onClick={() => toggleSelect(cardId)}
                aria-label={`${i + 1}番目 ${shortLabel(cardId)} を取り消す`}
              >
                <span className={styles.trayIndex}>{i + 1}</span>
                <span className={styles.trayText}>{shortLabel(cardId)}</span>
                <span aria-hidden="true">×</span>
              </button>
            ))}
          </div>
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
