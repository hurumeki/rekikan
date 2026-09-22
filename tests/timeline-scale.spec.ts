import { test, expect } from '@playwright/test';
import { buildTimelineScale, isWithinTolerance, TOLERANCE_PERCENT } from '@/lib/timeline-scale';
import { REGIONS, ALL_QUIZZES } from '@/lib/data-registry';
import { loadCardsForQuiz } from '@/lib/data-loader';
import type { Card, EraColor } from '@/lib/types';

const japan = REGIONS.find((r) => r.id === 'japan')!;

function card(id: string, year: number, eraKey: string): Card {
  return {
    id,
    region: 'japan',
    type: 'term',
    name: id,
    year,
    year_end: null,
    era_color_key: eraKey,
    category: 'event',
    hint: null,
    description: id,
  };
}

test.describe('タイムラインの区分線形スケール', () => {
  const range = { start: -10000, end: 2000 };
  const scale = buildTimelineScale(japan.era_colors, [], range);

  test('時代帯ごとに等幅の区間になる', () => {
    const widths = scale.segments.map((s) => Math.round(s.endPct - s.startPct));
    expect(new Set(widths).size).toBe(1);
    expect(scale.segments).toHaveLength(Object.keys(japan.era_colors).length);
  });

  test('両端が範囲の端に一致する', () => {
    expect(scale.yearToPercent(range.start)).toBe(0);
    expect(scale.yearToPercent(range.end)).toBe(100);
  });

  test('年と位置の変換が往復する', () => {
    for (const year of [-5000, 800, 1300, 1700, 1900, 1990]) {
      const pct = scale.yearToPercent(year);
      expect(Math.abs(scale.percentToYear(pct) - year)).toBeLessThanOrEqual(1);
    }
  });

  test('位置は年に対して単調増加する', () => {
    let prev = -1;
    for (let year = range.start; year <= range.end; year += 97) {
      const pct = scale.yearToPercent(year);
      expect(pct).toBeGreaterThanOrEqual(prev);
      prev = pct;
    }
  });

  test('近代以降が画面の端に潰れない', () => {
    // 線形なら 1868〜2000 は全体の 1% ほどしかないが、
    // 区分線形では 2 時代帯ぶん（40%）を占める
    const modernWidth = scale.yearToPercent(2000) - scale.yearToPercent(1868);
    expect(modernWidth).toBeGreaterThan(30);
  });

  test('時代帯の定義が空でも線形スケールとして成立する', () => {
    const empty = buildTimelineScale({} as Record<string, EraColor>, [], range);
    expect(empty.segments).toHaveLength(1);
    expect(empty.yearToPercent(range.start)).toBe(0);
    expect(empty.yearToPercent(range.end)).toBe(100);
  });

  test('定義がない時代帯はカードの年から推定する', () => {
    const eraConfig: Record<string, EraColor> = {
      early: { label: '前half', color: '#111' },
      late: { label: '後half', color: '#222' },
    };
    const cards = [card('a', 100, 'early'), card('b', 900, 'late')];
    const s = buildTimelineScale(eraConfig, cards, { start: 0, end: 1000 });
    expect(s.segments.map((x) => x.key)).toEqual(['early', 'late']);
    expect(Math.round(s.yearToPercent(900))).toBe(50);
  });
});

test.describe('正誤判定の許容幅', () => {
  test('どのクイズでも許容幅は画面の同じ割合になる', async () => {
    const timelineQuizzes = ALL_QUIZZES.filter((q) => q.modes.includes('timeline'));
    // 期間が極端に長いクイズと短いクイズを 1 つずつ確かめる
    const withSpans = await Promise.all(
      timelineQuizzes.slice(0, 40).map(async (quiz) => {
        const cards = await loadCardsForQuiz(quiz);
        const years = cards.map((c) => c.year);
        return { quiz, cards, span: Math.max(...years) - Math.min(...years) };
      }),
    );
    withSpans.sort((a, b) => b.span - a.span);
    const longest = withSpans[0]!;
    const shortest = withSpans[withSpans.length - 1]!;

    for (const { cards } of [longest, shortest]) {
      const region = REGIONS.find((r) => r.id === cards[0]!.region)!;
      const years = cards.map((c) => c.year);
      const range = { start: Math.min(...years), end: Math.max(...years) };
      const s = buildTimelineScale(region.era_colors, cards, range);
      const target = cards[0]!.year;

      // 画面上で許容幅ちょうどの位置は正解、明確に外れた位置は不正解
      const justInside = s.percentToYear(s.yearToPercent(target) + TOLERANCE_PERCENT - 1);
      const wayOff = s.percentToYear(s.yearToPercent(target) + TOLERANCE_PERCENT * 3);
      expect(isWithinTolerance(justInside, target, s)).toBe(true);
      expect(isWithinTolerance(wayOff, target, s)).toBe(false);
    }
  });

  test('正解の年そのものは当然正解', () => {
    const s = buildTimelineScale(japan.era_colors, [], { start: -10000, end: 2000 });
    expect(isWithinTolerance(1600, 1600, s)).toBe(true);
  });
});
