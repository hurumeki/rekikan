import { test, expect } from '@playwright/test';

/** 苦手カード統計を直接書き込んでから復習画面を開く */
async function seedWeakCards(page: import('@playwright/test').Page, cardIds: string[]) {
  await page.goto('/');
  await page.evaluate((ids) => {
    const cards: Record<string, unknown> = {};
    for (const id of ids) {
      cards[id] = { cardId: id, attempts: 2, correct: 0, lastSeen: new Date().toISOString() };
    }
    localStorage.setItem('rekikan_card_stats', JSON.stringify({ version: 1, cards }));
  }, cardIds);
}

test.describe('苦手カードの復習', () => {
  test('苦手カードがないときは入口が出ない', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('review-entry')).toHaveCount(0);
  });

  test('苦手カードがたまると入口が出て、復習を始められる', async ({ page }) => {
    await seedWeakCards(page, ['card_jp_1', 'card_jp_2', 'card_jp_3', 'card_jp_4']);
    await page.reload();

    const entry = page.getByTestId('review-entry');
    await expect(entry).toBeVisible();
    await expect(entry).toContainText('4枚');

    await entry.click();
    await expect(page.getByText('苦手カードの復習')).toBeVisible();
    await page.getByText('じっくりモード').click();
    await expect(page.getByText('この中で1番古いのはどれ？')).toBeVisible();
    await expect(page.getByTestId('quiz-card')).toHaveCount(4);
  });

  test('カードが足りないときは案内を出す', async ({ page }) => {
    await seedWeakCards(page, ['card_jp_1']);
    await page.goto('/review');
    await expect(page.getByText('まだ復習できるカードがありません')).toBeVisible();
  });

  test('クイズを解くとカード統計が記録される', async ({ page }) => {
    await page.goto('/');
    await page.getByText('日本史').click();
    await page.getByText('日本の歴史の大きな流れ').click();
    await page.getByText('チャレンジモード').click();

    const cards = page.getByTestId('quiz-card');
    const count = await cards.count();
    for (let i = 0; i < count; i++) await cards.nth(i).click();
    await page.getByTestId('confirm-order').click();
    await expect(page.getByRole('button', { name: 'もう一度' })).toBeVisible();

    const stats = await page.evaluate(() => localStorage.getItem('rekikan_card_stats'));
    expect(stats).not.toBeNull();
    const parsed = JSON.parse(stats!);
    expect(Object.keys(parsed.cards)).toHaveLength(count);
  });
});
