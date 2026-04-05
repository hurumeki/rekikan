'use client';

import { useRef, useCallback } from 'react';
import type { Card as CardType, CardState } from '@/lib/types';
import EraBadge from '@/components/ui/EraBadge';
import CategoryIcon from '@/components/ui/CategoryIcon';
import NumberBadge from '@/components/ui/NumberBadge';
import { formatYearRange } from '@/lib/quiz-engine';
import styles from './Card.module.css';

interface CardProps {
  card: CardType;
  state: CardState;
  eraColor: string;
  selectionNumber?: number;
  showHint?: boolean;
  showYear?: boolean;
  showDescription?: boolean;
  onClick?: () => void;
  onLongPress?: () => void;
}

export default function Card({
  card,
  state,
  eraColor,
  selectionNumber,
  showHint,
  showYear,
  showDescription,
  onClick,
  onLongPress,
}: CardProps) {
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggered = useRef(false);
  const touchHandled = useRef(false);
  const touchMoved = useRef(false);
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);

  const clearTimer = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      longPressTriggered.current = false;
      touchHandled.current = true;
      touchMoved.current = false;
      const touch = e.touches[0];
      touchStartPos.current = { x: touch.clientX, y: touch.clientY };
      if (onLongPress) {
        longPressTimer.current = setTimeout(() => {
          if (!touchMoved.current) {
            longPressTriggered.current = true;
            onLongPress();
          }
        }, 500);
      }
    },
    [onLongPress],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (touchMoved.current) return;
      const touch = e.touches[0];
      const start = touchStartPos.current;
      if (start) {
        const dx = Math.abs(touch.clientX - start.x);
        const dy = Math.abs(touch.clientY - start.y);
        if (dx > 10 || dy > 10) {
          touchMoved.current = true;
          clearTimer();
        }
      }
    },
    [clearTimer],
  );

  const handleTouchEnd = useCallback(() => {
    clearTimer();
    if (!touchMoved.current && !longPressTriggered.current) {
      onClick?.();
    }
  }, [clearTimer, onClick]);

  const handleMouseDown = useCallback(() => {
    // Skip synthetic mouse events fired after touch
    if (touchHandled.current) return;
    longPressTriggered.current = false;
    if (onLongPress) {
      longPressTimer.current = setTimeout(() => {
        longPressTriggered.current = true;
        onLongPress();
      }, 500);
    }
  }, [onLongPress]);

  const handleMouseUp = useCallback(() => {
    if (touchHandled.current) return;
    clearTimer();
    if (!longPressTriggered.current) {
      onClick?.();
    }
  }, [clearTimer, onClick]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      // After touch or when long-press is active, always suppress click
      if (touchHandled.current) {
        touchHandled.current = false;
        return;
      }
      if (onLongPress) {
        // Desktop: handled via mouseDown/mouseUp
        return;
      }
      onClick?.();
    },
    [onClick, onLongPress],
  );

  const classNames = [styles.card, state !== 'unselected' ? styles[state] : '']
    .filter(Boolean)
    .join(' ');

  const yearLabel = formatYearRange(card.year, card.year_end);

  return (
    <div
      className={classNames}
      data-testid="quiz-card"
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={onLongPress ? handleMouseDown : undefined}
      onMouseUp={onLongPress ? handleMouseUp : undefined}
      onMouseLeave={onLongPress ? clearTimer : undefined}
    >
      <EraBadge color={eraColor} />

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

      {selectionNumber !== undefined && state === 'selected' && (
        <NumberBadge number={selectionNumber} />
      )}

      {state === 'locked' && <span className={styles.lockIcon}>🔒</span>}

      {state === 'correct' && <div className={`${styles.mark} ${styles.correctMark}`}>✓</div>}

      {state === 'incorrect' && <div className={`${styles.mark} ${styles.incorrectMark}`}>✗</div>}
    </div>
  );
}
