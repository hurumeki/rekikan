import { test, expect } from '@playwright/test';
import { checkAnswers, createYearLookup, isOldestAmong } from '@/lib/quiz-engine';
import type { Card } from '@/lib/types';

function card(id: string, year: number): Card {
  return {
    id,
    region: 'japan',
    type: 'term',
    name: id,
    year,
    year_end: null,
    era_color_key: 'medieval',
    category: 'event',
    hint: null,
    description: `${id} の説明`,
  };
}

test.describe('checkAnswers', () => {
  const cards = [card('a', 1000), card('b', 1185), card('c', 1185), card('d', 1300)];
  const yearOf = createYearLookup(cards);
  const correctOrder = ['a', 'b', 'c', 'd'];

  test('正しい順序は全問正解になる', () => {
    const results = checkAnswers(correctOrder, correctOrder, yearOf);
    expect(results.every((r) => r.correct)).toBe(true);
  });

  test('同じ年のカードを入れ替えても正解として扱う', () => {
    const results = checkAnswers(['a', 'c', 'b', 'd'], correctOrder, yearOf);
    expect(results.every((r) => r.correct)).toBe(true);
  });

  test('年が違うカードを入れ替えたら不正解になる', () => {
    const results = checkAnswers(['b', 'a', 'c', 'd'], correctOrder, yearOf);
    expect(
      results
        .filter((r) => !r.correct)
        .map((r) => r.cardId)
        .sort(),
    ).toEqual(['a', 'b']);
  });

  test('年の辞書を渡さない場合は位置の一致で判定する（後方互換）', () => {
    const results = checkAnswers(['a', 'c', 'b', 'd'], correctOrder);
    expect(
      results
        .filter((r) => !r.correct)
        .map((r) => r.cardId)
        .sort(),
    ).toEqual(['b', 'c']);
  });

  test('correctPosition は正解順序上の位置を返す', () => {
    const results = checkAnswers(['d', 'a', 'b', 'c'], correctOrder, yearOf);
    expect(results.find((r) => r.cardId === 'd')?.correctPosition).toBe(3);
  });
});

test.describe('isOldestAmong（じっくりモードの判定）', () => {
  test('最も古いカードを選べば正解', () => {
    const remaining = [card('a', 1000), card('b', 1185)];
    expect(isOldestAmong(remaining[0]!, remaining)).toBe(true);
  });

  test('同じ年のカードはどちらを選んでも正解', () => {
    const remaining = [card('b', 1185), card('c', 1185), card('d', 1300)];
    expect(isOldestAmong(remaining[0]!, remaining)).toBe(true);
    expect(isOldestAmong(remaining[1]!, remaining)).toBe(true);
  });

  test('新しいカードを選んだら不正解', () => {
    const remaining = [card('a', 1000), card('b', 1185)];
    expect(isOldestAmong(remaining[1]!, remaining)).toBe(false);
  });
});
