import type React from 'react';
import styles from './StarRating.module.css';

export const MAX_STARS = 3;

interface StarRatingProps {
  /** 獲得した星の数（0〜3） */
  stars: number;
  size?: 'sm' | 'md' | 'lg';
  /** 1 つずつ跳ねて出す（リザルト用） */
  animated?: boolean;
}

/** 星 3 つで成績を示す共通表示。 */
export default function StarRating({ stars, size = 'sm', animated = false }: StarRatingProps) {
  return (
    <span className={`${styles.stars} ${styles[size]}`} aria-label={`${stars}つ星`}>
      {Array.from({ length: MAX_STARS }, (_, i) => {
        const index = i + 1;
        const className = [
          styles.star,
          index <= stars ? styles.filled : '',
          animated ? styles.animated : '',
        ]
          .filter(Boolean)
          .join(' ');
        return (
          <span
            key={index}
            className={className}
            style={
              animated ? ({ '--star-delay': `${i * 0.12}s` } as React.CSSProperties) : undefined
            }
            aria-hidden="true"
          >
            ★
          </span>
        );
      })}
    </span>
  );
}
