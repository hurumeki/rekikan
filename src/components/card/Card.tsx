'use client';

import { memo, useState } from 'react';
import type { Card as CardType, CardState } from '@/lib/types';
import EraBadge from '@/components/ui/EraBadge';
import CategoryIcon from '@/components/ui/CategoryIcon';
import NumberBadge from '@/components/ui/NumberBadge';
import { formatYearRange } from '@/lib/quiz-engine';
import { getCardImageSrc } from '@/lib/images';
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
  const classNames = [styles.card, state !== 'unselected' ? styles[state] : '']
    .filter(Boolean)
    .join(' ');

  const yearLabel = formatYearRange(card.year, card.year_end);

  const [imageFailed, setImageFailed] = useState(false);
  const imageSrc = getCardImageSrc(card);
  const showImage = !!imageSrc && !imageFailed && (showHint || showYear);

  return (
    <div className={classNames} data-testid="quiz-card" onClick={onClick}>
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

      {state === 'correct' && <div className={`${styles.mark} ${styles.correctMark}`}>✓</div>}

      {state === 'incorrect' && <div className={`${styles.mark} ${styles.incorrectMark}`}>✗</div>}
    </div>
  );
});

export default Card;
