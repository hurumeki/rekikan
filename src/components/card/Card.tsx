'use client';

import { memo, useState } from 'react';
import type { Card as CardType, CardState } from '@/lib/types';
import EraBadge from '@/components/ui/EraBadge';
import CategoryIcon from '@/components/ui/CategoryIcon';
import NumberBadge from '@/components/ui/NumberBadge';
import { formatYearRange } from '@/lib/quiz-engine';
import { getCardImageSrc } from '@/lib/images';
import { CATEGORY_LABELS } from '@/lib/constants';
import styles from './Card.module.css';

interface CardProps {
  card: CardType;
  state: CardState;
  eraColor: string;
  selectionNumber?: number;
  showHint?: boolean;
  showYear?: boolean;
  showDescription?: boolean;
  hideEraBadge?: boolean;
  onClick?: () => void;
}

const STATE_LABELS: Record<CardState, string> = {
  unselected: '未選択',
  selected: '選択中',
  correct: '正解',
  incorrect: '不正解',
};

/** スクリーンリーダー向けに、カードの内容と状態を 1 行にまとめる。 */
function buildAriaLabel(card: CardType, state: CardState, selectionNumber?: number): string {
  const parts: string[] = [];
  if (card.type === 'term') {
    parts.push(card.name ?? '');
    if (card.category) parts.push(CATEGORY_LABELS[card.category]);
  } else {
    parts.push(card.description);
  }
  if (selectionNumber !== undefined && state === 'selected') {
    parts.push(`${selectionNumber}番目に選択中`);
  } else if (state !== 'unselected') {
    parts.push(STATE_LABELS[state]);
  }
  return parts.filter(Boolean).join('、');
}

const Card = memo(function Card({
  card,
  state,
  eraColor,
  selectionNumber,
  showHint,
  showYear,
  showDescription,
  hideEraBadge,
  onClick,
}: CardProps) {
  const classNames = [
    styles.card,
    state !== 'unselected' ? styles[state] : '',
    onClick ? styles.interactive : styles.static,
  ]
    .filter(Boolean)
    .join(' ');

  const yearLabel = formatYearRange(card.year, card.year_end);

  const [imageFailed, setImageFailed] = useState(false);
  const imageSrc = getCardImageSrc(card);
  const showImage = !!imageSrc && !imageFailed && (showHint || showYear);

  const body = (
    <>
      {!hideEraBadge && (showHint || showYear) && <EraBadge color={eraColor} />}

      <div className={styles.content}>
        {card.type === 'term' ? (
          <>
            <div className={styles.header}>
              <CategoryIcon category={card.category} />
              <span className={styles.name}>{card.name}</span>
            </div>
            {showHint && card.hint && <div className={styles.hint}>{card.hint}</div>}
            {showYear && <div className={styles.yearLabel}>{yearLabel}</div>}
            {showDescription && <div className={styles.description}>{card.description}</div>}
          </>
        ) : (
          <>
            <div className={styles.description}>{card.description}</div>
            {showYear && <div className={styles.yearLabel}>{yearLabel}</div>}
          </>
        )}
      </div>

      {showImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className={styles.image}
          src={imageSrc!}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setImageFailed(true)}
          data-testid="card-image"
        />
      )}

      {selectionNumber !== undefined && state === 'selected' && (
        <NumberBadge number={selectionNumber} />
      )}

      {state === 'correct' && (
        <div className={`${styles.mark} ${styles.correctMark}`} aria-hidden="true">
          ✓
        </div>
      )}

      {state === 'incorrect' && (
        <div className={`${styles.mark} ${styles.incorrectMark}`} aria-hidden="true">
          ✗
        </div>
      )}
    </>
  );

  // 操作できるカードは button として描画する。これだけでキーボード操作・
  // フォーカスリング・スクリーンリーダーの読み上げがまとめて有効になる。
  if (onClick) {
    return (
      <button
        type="button"
        className={classNames}
        data-testid="quiz-card"
        onClick={onClick}
        aria-pressed={state === 'selected'}
        aria-label={buildAriaLabel(card, state, selectionNumber)}
      >
        {body}
      </button>
    );
  }

  return (
    <div className={classNames} data-testid="quiz-card">
      {body}
    </div>
  );
});

export default Card;
