import { test, expect } from '@playwright/test';

test.describe('クイズ一覧', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByText('日本史').click();
    await expect(page.getByText('← 戻る')).toBeVisible();
  });

  test('初期表示ではロック中の階層が畳まれ、1 画面に収まる', async ({ page }) => {
    // 51 問すべてではなく、遊べる問題だけが見えている
    const items = page.getByTestId('quiz-item');
    await expect(items).toHaveCount(1);
    await expect(items.first()).toContainText('日本の歴史の大きな流れ');

    const height = await page.evaluate(() => document.body.scrollHeight);
    expect(height).toBeLessThan(2000);
  });

  test('次に遊ぶ 1 問に「つぎはこれ」が付く', async ({ page }) => {
    await expect(page.getByText('つぎはこれ')).toHaveCount(1);
  });

  test('見出しをタップすると階層が開閉する', async ({ page }) => {
    const toggle = page.getByTestId('node-toggle').filter({ hasText: '先史・古代' });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(
      page.getByTestId('quiz-item').filter({ hasText: '古代の社会変化の概要' }),
    ).toBeVisible();

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('ロック中の階層には解放までの残り問題数が出る', async ({ page }) => {
    await page.getByTestId('node-toggle').filter({ hasText: '先史・古代' }).click();
    await expect(page.getByText(/あと\d+問でひらく/).first()).toBeVisible();
  });

  test('ロック中のクイズをタップすると条件が表示される', async ({ page }) => {
    await page.getByTestId('node-toggle').filter({ hasText: '先史・古代' }).click();
    await page.getByTestId('quiz-item').filter({ hasText: '古代の社会変化の概要' }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('アンロック条件');
    await dialog.getByRole('button', { name: '閉じる' }).click();
    await expect(dialog).toBeHidden();
  });
});
