'use client';

import { useEffect, useCallback, useRef, useMemo } from 'react';
import type { EraColor } from '@/lib/types';
import type { QuizModeProps } from './mode-props';
import { useTimelineMode } from '@/hooks/useTimelineMode';
import Card from '@/components/card/Card';
import { formatYearRange } from '@/lib/quiz-engine';
import { buildTimelineScale, toleranceYears, TOLERANCE_PERCENT } from '@/lib/timeline-scale';
import styles from './TimelinePlacementQuiz.module.css';

interface TimelinePlacementQuizProps extends QuizModeProps {
  eraConfig: Record<string, EraColor>;
  timelineRange: { start: number; end: number };
}

function formatTimelineYear(year: number): string {
  if (year < 0) return `前${Math.abs(year).toLocaleString()}年`;
  return `${year.toLocaleString()}年`;
}

export default function TimelinePlacementQuiz({
  cards,
  eraColors,
  hintEnabled,
  onComplete,
  eraConfig,
  timelineRange,
}: TimelinePlacementQuizProps) {
  // 時代帯ごとに等幅の区分線形スケール。先史が画面を占有しないようにする
  const scale = useMemo(
    () => buildTimelineScale(eraConfig, cards, timelineRange),
    [eraConfig, cards, timelineRange],
  );

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
    adjustPercent,
    confirmAnswer,
    advance,
    yearToPercent,
  } = useTimelineMode(cards, scale);

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

  const eraBands = useMemo(
    () =>
      scale.segments.map((seg) => ({
        key: seg.key,
        color: seg.color,
        label: seg.label,
        left: seg.startPct,
        width: seg.endPct - seg.startPct,
        yearStart: seg.startYear,
      })),
    [scale],
  );

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
                data-testid="era-band"
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

          {/* 正解とみなされる範囲（解答後に表示して感覚をつかんでもらう） */}
          {correctPct !== null && (
            <div
              className={styles.toleranceZone}
              style={{
                left: `${Math.max(0, correctPct - TOLERANCE_PERCENT)}%`,
                width: `${Math.min(100, correctPct + TOLERANCE_PERCENT) - Math.max(0, correctPct - TOLERANCE_PERCENT)}%`,
              }}
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
          <span className={styles.eraYearLabel} style={{ left: '0%', transform: 'translateX(0)' }}>
            {formatTimelineYear(timelineRange.start)}
          </span>
          {eraBands.slice(1).map((band) =>
            // 端のラベルと重なる区切りは出さない（桁の多い年号がぶつかるため）
            band.left > 14 && band.left < 86 ? (
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
        <button
          className={styles.navBtn}
          onClick={() => adjustPercent(-5)}
          disabled={navDisabled}
          aria-label="大きく戻す"
        >
          ◀◀
        </button>
        <button
          className={styles.navBtn}
          onClick={() => adjustPercent(-1)}
          disabled={navDisabled}
          aria-label="少し戻す"
        >
          ◀
        </button>
        <button
          className={styles.navBtn}
          onClick={() => adjustPercent(1)}
          disabled={navDisabled}
          aria-label="少し進める"
        >
          ▶
        </button>
        <button
          className={styles.navBtn}
          onClick={() => adjustPercent(5)}
          disabled={navDisabled}
          aria-label="大きく進める"
        >
          ▶▶
        </button>
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
            : `不正解 — 正解は ${formatYearRange(currentCard.year, currentCard.year_end)}（およそ±${toleranceYears(
                currentCard.year,
                scale,
              ).toLocaleString()}年まで正解）`}
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
