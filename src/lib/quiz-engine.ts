import type { Card, CardResult } from './types';

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/** カードIDから年を引く辞書。同年判定のために各モードで共有する。 */
export type YearLookup = (cardId: string) => number | undefined;

export function createYearLookup(cards: Card[]): YearLookup {
  const years = new Map(cards.map((c) => [c.id, c.year]));
  return (cardId) => years.get(cardId);
}

/**
 * 並べ替えの正誤判定。
 *
 * 同じ年のカードは歴史的にどちらを先に置いても正しいため、
 * 配列の位置ではなく「その位置に来るべき年」と一致するかで判定する。
 * 年が引けないカードは従来どおり位置の一致で判定する。
 */
export function checkAnswers(
  userOrder: string[],
  correctOrder: string[],
  yearOf?: YearLookup,
): CardResult[] {
  return userOrder.map((cardId, userIndex) => {
    const correctIndex = correctOrder.indexOf(cardId);
    let correct = userIndex === correctIndex;

    if (!correct && yearOf) {
      const placedYear = yearOf(cardId);
      const expectedYear = yearOf(correctOrder[userIndex]!);
      correct = placedYear !== undefined && placedYear === expectedYear;
    }

    return {
      cardId,
      correct,
      correctPosition: correctIndex,
      userPosition: userIndex,
    };
  });
}

/**
 * じっくりモードの判定。残りカードの中で最も古い年と同じなら正解。
 * 同じ年のカードが複数残っている場合は、そのどれを選んでも正解になる。
 */
export function isOldestAmong(card: Card, remaining: Card[]): boolean {
  if (remaining.length === 0) return false;
  const oldestYear = Math.min(...remaining.map((c) => c.year));
  return card.year === oldestYear;
}

export function calculateScore(results: CardResult[]): { correct: number; total: number } {
  const correct = results.filter((r) => r.correct).length;
  return { correct, total: results.length };
}

export function isPerfect(results: CardResult[]): boolean {
  return results.every((r) => r.correct);
}

function formatYear(year: number): string {
  return year < 0 ? `前${Math.abs(year)}年` : `${year}年`;
}

export function formatYearRange(year: number, yearEnd: number | null): string {
  if (yearEnd != null) {
    return `${formatYear(year)}–${formatYear(yearEnd)}`;
  }
  return formatYear(year);
}
