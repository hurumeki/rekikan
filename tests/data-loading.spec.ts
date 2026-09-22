import { test, expect } from '@playwright/test';
import { CARD_LOADERS, CARD_REGION_IDS, ALL_QUIZZES } from '@/lib/data-registry';
import { loadCardsForQuiz, loadRegionCards, getCard, isRegionCardsLoaded } from '@/lib/data-loader';

test.describe('カードの遅延読み込み', () => {
  test('地域ごとにローダーが用意されている', () => {
    expect(CARD_REGION_IDS.length).toBe(10);
    // world は自前のカードを持たない
    expect(CARD_LOADERS.world).toBeUndefined();
    expect(isRegionCardsLoaded('world')).toBe(true);
  });

  test('読み込んだ地域のカードだけが取り出せる', async () => {
    await loadRegionCards('japan');
    expect(getCard('card_jp_1')).toBeDefined();
    expect(isRegionCardsLoaded('japan')).toBe(true);
  });

  test('クイズに必要なカードが card_ids の順に揃う', async () => {
    const quiz = ALL_QUIZZES.find((q) => q.id === 'quiz_japan_era_intro_desc')!;
    const cards = await loadCardsForQuiz(quiz);
    expect(cards.map((c) => c.id)).toEqual(quiz.card_ids);
  });

  test('複数地域が混ざるクイズでも全カードが揃う', async () => {
    const quiz = ALL_QUIZZES.find((q) => q.regions && q.regions.length > 2)!;
    const cards = await loadCardsForQuiz(quiz);
    expect(cards).toHaveLength(quiz.card_ids.length);
  });

  test('すべてのクイズでカードが欠けない', async () => {
    for (const quiz of ALL_QUIZZES) {
      const cards = await loadCardsForQuiz(quiz);
      expect(cards.length, quiz.id).toBe(quiz.card_ids.length);
    }
  });
});
