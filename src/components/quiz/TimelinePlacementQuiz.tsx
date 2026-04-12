'use client';

import { useEffect, useCallback, useRef, useMemo } from 'react';
import type { Card as CardType, CardResult, EraColor } from '@/lib/types';
import { useTimelineMode } from '@/hooks/useTimelineMode';
import Card from '@/components/card/Card';
import { formatYearRange } from '@/lib/quiz-engine';
import styles from './TimelinePlacementQuiz.module.css';

interface TimelinePlacementQuizProps {
  cards: CardType[];
  correctOrder: string[];
  eraColors: Record<string, string>;
  hintEnabled: boolean;
  onComplete: (results: CardResult[], score: number, total: number) => void;
  eraConfig: Record<string, EraColor>;
  timelineRange: { start: number; end: number };
}

function formatTimelineYear(year: number): string {
  if (year < 0) return `前${Math.abs(year).toLocaleString()}年`;
  return `${year.toLocaleString()}年`;
}

/** Choose navigation step sizes based on the total span */
function calcNavSteps(span: number): [number, number, number] {
  if (span > 20000) return [5000, 1000, 100];
  if (span > 5000) return [1000, 200, 20];
  if (span > 1000) return [500, 100, 10];
  if (span > 200) return [100, 20, 5];
  return [50, 10, 1];
}

export default function TimelinePlacementQuiz({
  cards,
  eraColors,
  hintEnabled,
  onComplete,
  eraConfig,
  timelineRange,
}: TimelinePlacementQuizProps) {
  const {
    currentCard,
    currentIndex,
    total,
    score,
    selectedYear,
    answeredYear,
    results,
    isComplete,
    selectPosition,
    adjustYear,
    confirmAnswer,
    advance,
    yearToPercent,
  } = useTimelineMode(cards, timelineRange.start, timelineRange.end);

  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isComplete) {
      onComplete(results, score, total);
    }
  }, [isComplete, results, score, total, onComplete]);

  const handleTimelineInteraction = useCallback(
    (clientX: number) => {
      if (answeredYear !== null) return;
      const el = timelineRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      selectPosition(pct);
    },
    [answeredYear, selectPosition],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => handleTimelineInteraction(e.clientX),
    [handleTimelineInteraction],
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      if (touch) handleTimelineInteraction(touch.clientX);
    },
    [handleTimelineInteraction],
  );

  const totalSpan = timelineRange.end - timelineRange.start;
  const navSteps = useMemo(() => calcNavSteps(totalSpan), [totalSpan]);

  // Era bands: use defined year_start from eraConfig when available,
  // otherwise fall back to min card year in that era
  const eraBands = useMemo(() => {
    const eraKeys = Object.keys(eraConfig);
    return eraKeys.map((key, i) => {
      const cfg = eraConfig[key]!;
      const nextKey = eraKeys[i + 1];
      const nextCfg = nextKey ? eraConfig[nextKey] : undefined;

      // Use defined year_start if available, otherwise derive from cards
      const eraYears = cards
        .filter((c) => c.era_color_key === key)
        .map((c) => c.year)
        .sort((a, b) => a - b);

      const eraStart =
        cfg.year_start !== undefined
          ? cfg.year_start
          : eraYears.length > 0
            ? eraYears[0]!
            : timelineRange.start + (i / eraKeys.length) * totalSpan;

      const nextEraStart =
        nextCfg?.year_start !== undefined
          ? nextCfg.year_start
          : nextKey
            ? (() => {
                const ny = cards
                  .filter((c) => c.era_color_key === nextKey)
                  .map((c) => c.year)
                  .sort((a, b) => a - b);
                return ny.length > 0
                  ? ny[0]!
                  : timelineRange.start + ((i + 1) / eraKeys.length) * totalSpan;
              })()
            : timelineRange.end;

      const eraEnd = nextKey ? nextEraStart : timelineRange.end;

      // Clamp to timeline range
      const clampedStart = Math.max(timelineRange.start, eraStart);
      const clampedEnd = Math.min(timelineRange.end, eraEnd);

      const left = Math.max(0, ((clampedStart - timelineRange.start) / totalSpan) * 100);
      const width = Math.max(0, ((clampedEnd - clampedStart) / totalSpan) * 100);

      return {
        key,
        color: cfg.color,
        label: cfg.label,
        left,
        width,
        yearStart: clampedStart,
      };
    });
  }, [eraConfig, cards, timelineRange, totalSpan]);

  // Boundary years for the era-jump buttons
  const eraBoundaryYears = useMemo(
    () =>
      eraBands
        .map((b) => b.yearStart)
        .filter((y) => y > timelineRange.start)
        .sort((a, b) => a - b),
    [eraBands, timelineRange.start],
  );

  const handleJumpEra = useCallback(
    (direction: 'prev' | 'next') => {
      if (answeredYear !== null) return;
      const base = selectedYear ?? Math.round((timelineRange.start + timelineRange.end) / 2);
      if (direction === 'prev') {
        const target = [...eraBoundaryYears].reverse().find((y) => y < base);
        if (target !== undefined) adjustYear(target - base);
        else adjustYear(timelineRange.start - base);
      } else {
        const target = eraBoundaryYears.find((y) => y > base);
        if (target !== undefined) adjustYear(target - base);
        else adjustYear(timelineRange.end - base);
      }
    },
    [answeredYear, selectedYear, timelineRange, eraBoundaryYears, adjustYear],
  );

  if (!currentCard) return null;

  const selectedPct = selectedYear !== null ? yearToPercent(selectedYear) : null;
  const correctPct = answeredYear !== null ? yearToPercent(currentCard.year) : null;
  const isCorrect =
    answeredYear !== null && results.at(-1)?.cardId === currentCard.id && results.at(-1)?.correct;

  const navDisabled = answeredYear !== null;

  return (
    <div className={styles.container}>
      <div className={styles.progress}>
        {currentIndex + 1} / {total}
      </div>

      <div className={styles.prompt}>この出来事はいつ頃？</div>

      <Card
        card={currentCard}
        state="unselected"
        eraColor={eraColors[currentCard.era_color_key] ?? '#888'}
        showHint={hintEnabled}
        showYear={answeredYear !== null}
        showDescription={answeredYear !== null}
      />

      {/* Timeline */}
      <div className={styles.timelineWrapper}>
        <div
          ref={timelineRef}
          className={styles.timeline}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          {/* Era band segments */}
          {eraBands.map((band) =>
            band.width > 0 ? (
              <div
                key={band.key}
                className={styles.eraBand}
                style={{
                  left: `${band.left}%`,
                  width: `${band.width}%`,
                  background: band.color,
                }}
              >
                {/* Era label inside band (only if wide enough) */}
                {band.width > 8 && <span className={styles.eraBandLabel}>{band.label}</span>}
              </div>
            ) : null,
          )}

          {/* User selection marker */}
          {selectedPct !== null && (
            <div
              className={`${styles.marker} ${answeredYear !== null ? (isCorrect ? styles.markerCorrect : styles.markerWrong) : styles.markerSelected}`}
              style={{ left: `${selectedPct}%` }}
            />
          )}

          {/* Correct answer marker (shown after answer) */}
          {correctPct !== null && !isCorrect && (
            <div
              className={`${styles.marker} ${styles.markerCorrectAnswer}`}
              style={{ left: `${correctPct}%` }}
            />
          )}
        </div>

        {/* Era boundary year labels below timeline */}
        <div className={styles.eraYearLabels}>
          <span className={styles.eraYearLabel} style={{ left: '0%' }}>
            {formatTimelineYear(timelineRange.start)}
          </span>
          {eraBands.slice(1).map((band) =>
            band.left > 5 && band.left < 95 ? (
              <span
                key={band.key}
                className={styles.eraYearLabel}
                style={{ left: `${band.left}%` }}
              >
                {formatTimelineYear(band.yearStart)}
              </span>
            ) : null,
          )}
          <span
            className={styles.eraYearLabel}
            style={{ left: '100%', transform: 'translateX(-100%)' }}
          >
            {formatTimelineYear(timelineRange.end)}
          </span>
        </div>
      </div>

      {/* Navigation buttons */}
      <div className={styles.navButtons}>
        <button
          className={`${styles.navBtn} ${styles.navBtnEra}`}
          onClick={() => handleJumpEra('prev')}
          disabled={navDisabled}
          title="前の時代帯へ"
          aria-label="前の時代帯へジャンプ"
        >
          ⏮
        </button>
        {([-navSteps[0], -navSteps[1], -navSteps[2]] as const).map((d) => (
          <button
            key={d}
            className={styles.navBtn}
            onClick={() => adjustYear(d)}
            disabled={navDisabled}
            title={`${Math.abs(d)}年前へ`}
          >
            ◀{Math.abs(d)}
          </button>
        ))}
        {([navSteps[2], navSteps[1], navSteps[0]] as const).map((d) => (
          <button
            key={d}
            className={styles.navBtn}
            onClick={() => adjustYear(d)}
            disabled={navDisabled}
            title={`${d}年後へ`}
          >
            {d}▶
          </button>
        ))}
        <button
          className={`${styles.navBtn} ${styles.navBtnEra}`}
          onClick={() => handleJumpEra('next')}
          disabled={navDisabled}
          title="次の時代帯へ"
          aria-label="次の時代帯へジャンプ"
        >
          ⏭
        </button>
      </div>

      {/* Show selected year */}
      {selectedYear !== null && answeredYear === null && (
        <div className={styles.selectedLabel}>選択中: {formatTimelineYear(selectedYear)}</div>
      )}

      {/* Feedback after answer */}
      {answeredYear !== null && (
        <div
          className={`${styles.feedback} ${isCorrect ? styles.feedbackCorrect : styles.feedbackWrong}`}
        >
          {isCorrect
            ? `正解！ ${formatYearRange(currentCard.year, currentCard.year_end)}`
            : `不正解 — 正解は ${formatYearRange(currentCard.year, currentCard.year_end)}`}
        </div>
      )}

      {/* Action buttons */}
      {answeredYear === null ? (
        <button
          className={styles.confirmButton}
          disabled={selectedYear === null}
          onClick={confirmAnswer}
        >
          ここに配置する
        </button>
      ) : !isComplete ? (
        <button className={styles.nextButton} onClick={advance}>
          次へ
        </button>
      ) : null}
    </div>
  );
}
