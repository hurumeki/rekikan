import type { CardResult } from './types';

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function checkAnswers(userOrder: string[], correctOrder: string[]): CardResult[] {
  return userOrder.map((cardId, userIndex) => {
    const correctIndex = correctOrder.indexOf(cardId);
    return {
      cardId,
      correct: userIndex === correctIndex,
      correctPosition: correctIndex,
      userPosition: userIndex,
    };
  });
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
