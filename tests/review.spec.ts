import { test, expect } from '@playwright/test';
import { buildReviewQuiz, REVIEW_MIN_CARDS, REVIEW_QUIZ_ID } from '@/lib/review';
import type { Card } from '@/lib/types';

function card(id: string, region: string, type: Card['type'] = 'term'): Card {
  return {
    id,
    region,
    type,
    name: type === 'term' ? id : null,
    year: 1000,
    year_end: null,
    era_color_key: 'medieval',
    category: 'event',
    hint: null,
    description: `${id} の説明`,
  };
}

test.describe('復習クイズの組み立て', () => {
  test('カードが足りなければ作らない', () => {
    const cards = Array.from({ length: REVIEW_MIN_CARDS - 1 }, (_, i) => card(`c${i}`, 'japan'));
    expect(buildReviewQuiz(cards)).toBeNull();
  });

  test('単一地域ならチャレンジモードで出題する', () => {
    const cards = ['a', 'b', 'c'].map((id) => card(id, 'japan'));
    const quiz = buildReviewQuiz(cards)!;
    expect(quiz.id).toBe(REVIEW_QUIZ_ID);
    expect(quiz.modes).toEqual(['careful', 'challenge']);
    expect(quiz.regions).toBeNull();
    expect(quiz.card_ids).toEqual(['a', 'b', 'c']);
  });

  test('複数地域が混ざれば同時代モードで出題する', () => {
    const cards = [card('a', 'japan'), card('b', 'europe'), card('c', 'china')];
    const quiz = buildReviewQuiz(cards)!;
    expect(quiz.modes).toEqual(['careful', 'cross_region']);
    expect(quiz.regions).toEqual(['japan', 'europe', 'china']);
  });

  test('記述カードが混ざれば description 扱いにする', () => {
    const cards = [card('a', 'japan'), card('b', 'japan', 'description'), card('c', 'japan')];
    expect(buildReviewQuiz(cards)!.card_type).toBe('description');
  });
});
