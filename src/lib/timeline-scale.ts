import type { Card, EraColor } from './types';

export interface TimelineSegment {
  key: string;
  label: string;
  color: string;
  /** この区間が受け持つ年の範囲 */
  startYear: number;
  endYear: number;
  /** タイムライン上の位置（%） */
  startPct: number;
  endPct: number;
}

export interface TimelineScale {
  range: { start: number; end: number };
  segments: TimelineSegment[];
  /** 年 → タイムライン上の位置（0〜100%） */
  yearToPercent(year: number): number;
  /** 位置（0〜100%） → 年 */
  percentToYear(pct: number): number;
}

/**
 * 正解とみなす許容幅（タイムライン全体に対する割合）。
 *
 * 年数で固定すると、先史から現代までを扱うクイズでは
 * 「±8000年なら正解」のようにほぼ全域が正解になり、
 * 戦後史のクイズでは「±11年」と年号暗記になってしまう。
 * 画面上の距離で判定することで、どのクイズでも体感の難度を揃える。
 */
export const TOLERANCE_PERCENT = 8;

/** タイムラインの左端を丸める単位を、扱う期間の長さから決める */
function roundingUnit(span: number): number {
  if (span > 10000) return 1000;
  if (span > 2000) return 100;
  if (span > 300) return 10;
  return 1;
}

/**
 * 出題カードから、表示するタイムラインの範囲を決める。
 * クイズに timeline_range が指定されていればそちらを優先する。
 */
export function buildTimelineRange(cards: Card[]): { start: number; end: number } {
  if (cards.length === 0) return { start: 0, end: 2000 };

  const years = cards.map((c) => c.year);
  const min = Math.min(...years);
  const max = Math.max(...years);
  const padding = Math.round((max - min) * 0.15) || 50;
  const currentYear = new Date().getFullYear();

  // 未来側には現在年より先へ伸ばさない
  const end = Math.min(max + padding, Math.max(max + 10, currentYear));
  // 端の目盛りが「前11,780年」のような半端な数にならないよう丸める
  const unit = roundingUnit(max - min);
  return { start: Math.floor((min - padding) / unit) * unit, end };
}

/** 時代帯の開始年を決める。定義があればそれを使い、なければカードから推定する。 */
function resolveEraStart(
  key: string,
  index: number,
  eraKeys: string[],
  eraConfig: Record<string, EraColor>,
  cards: Card[],
  range: { start: number; end: number },
): number {
  const configured = eraConfig[key]?.year_start;
  if (configured !== undefined) return configured;

  const years = cards.filter((c) => c.era_color_key === key).map((c) => c.year);
  if (years.length > 0) return Math.min(...years);

  // 手がかりがなければ等間隔に置く
  return range.start + (index / eraKeys.length) * (range.end - range.start);
}

/**
 * 時代帯ごとに同じ幅を割り当てる区分線形スケールを作る。
 *
 * 年を素直に比例配分すると、先史・古代が画面の大半を占めて
 * 近代以降が数ピクセルに潰れてしまう。時代帯を等幅にすることで
 * どの時代でも同じ操作感で置けるようにする（docs/05 §5.4）。
 */
export function buildTimelineScale(
  eraConfig: Record<string, EraColor>,
  cards: Card[],
  range: { start: number; end: number },
): TimelineScale {
  const eraKeys = Object.keys(eraConfig);

  const bounds = eraKeys
    .map((key, i) => ({
      key,
      label: eraConfig[key]?.label ?? key,
      color: eraConfig[key]?.color ?? '#888',
      startYear: resolveEraStart(key, i, eraKeys, eraConfig, cards, range),
    }))
    .sort((a, b) => a.startYear - b.startYear);

  // 表示範囲に重なる区間だけを残し、両端を範囲に合わせる
  const visible: Omit<TimelineSegment, 'startPct' | 'endPct'>[] = [];
  for (let i = 0; i < bounds.length; i++) {
    const startYear = Math.max(range.start, bounds[i]!.startYear);
    const endYear = Math.min(range.end, bounds[i + 1]?.startYear ?? range.end);
    if (endYear <= startYear) continue;
    visible.push({ ...bounds[i]!, startYear, endYear });
  }

  // 時代帯が 1 つも重ならない場合は単純な線形スケールにする
  if (visible.length === 0) {
    visible.push({
      key: eraKeys[0] ?? 'all',
      label: eraConfig[eraKeys[0] ?? '']?.label ?? '',
      color: eraConfig[eraKeys[0] ?? '']?.color ?? '#888',
      startYear: range.start,
      endYear: range.end,
    });
  }

  // 先頭の区間は範囲の左端から始める（範囲の手前で始まる時代帯があるため）
  visible[0] = { ...visible[0]!, startYear: range.start };
  visible[visible.length - 1] = { ...visible[visible.length - 1]!, endYear: range.end };

  const width = 100 / visible.length;
  const segments: TimelineSegment[] = visible.map((seg, i) => ({
    ...seg,
    startPct: i * width,
    endPct: (i + 1) * width,
  }));

  function yearToPercent(year: number): number {
    if (year <= segments[0]!.startYear) return 0;
    const last = segments[segments.length - 1]!;
    if (year >= last.endYear) return 100;

    for (const seg of segments) {
      if (year >= seg.startYear && year <= seg.endYear) {
        const span = seg.endYear - seg.startYear;
        const ratio = span === 0 ? 0 : (year - seg.startYear) / span;
        return seg.startPct + ratio * (seg.endPct - seg.startPct);
      }
    }
    return 100;
  }

  function percentToYear(pct: number): number {
    const clamped = Math.max(0, Math.min(100, pct));
    for (const seg of segments) {
      if (clamped >= seg.startPct && clamped <= seg.endPct) {
        const pctSpan = seg.endPct - seg.startPct;
        const ratio = pctSpan === 0 ? 0 : (clamped - seg.startPct) / pctSpan;
        return Math.round(seg.startYear + ratio * (seg.endYear - seg.startYear));
      }
    }
    return range.end;
  }

  return { range, segments, yearToPercent, percentToYear };
}

/** 画面上の距離で正誤を判定する。 */
export function isWithinTolerance(
  userYear: number,
  correctYear: number,
  scale: TimelineScale,
  tolerancePercent: number = TOLERANCE_PERCENT,
): boolean {
  return (
    Math.abs(scale.yearToPercent(userYear) - scale.yearToPercent(correctYear)) <= tolerancePercent
  );
}

/** 許容幅を年に直した目安（フィードバック表示用）。 */
export function toleranceYears(
  correctYear: number,
  scale: TimelineScale,
  tolerancePercent: number = TOLERANCE_PERCENT,
): number {
  const pct = scale.yearToPercent(correctYear);
  const low = scale.percentToYear(Math.max(0, pct - tolerancePercent));
  const high = scale.percentToYear(Math.min(100, pct + tolerancePercent));
  return Math.round((high - low) / 2);
}
