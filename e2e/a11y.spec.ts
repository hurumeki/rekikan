import { test, expect } from '@playwright/test';
import path from 'path';

const SCREENSHOT_DIR = path.join(__dirname, '..', 'screenshots');

test.describe('アクセシビリティ', () => {
  test('カードは button として描画され、キーボードだけで解答できる', async ({ page }) => {
    await page.goto('/');
    await page.getByText('日本史').click();
    await page.getByText('日本の歴史の大きな流れ').click();
    await page.getByText('チャレンジモード').click();
    await expect(page.getByText('古い順にカードをタップしてください')).toBeVisible();

    const cards = page.getByTestId('quiz-card');
    await expect(cards.first()).toHaveJSProperty('tagName', 'BUTTON');
    await expect(cards.first()).toHaveAttribute('aria-pressed', 'false');

    // Enter キーで選択できる（クリックを使わない）
    await cards.first().focus();
    await page.keyboard.press('Enter');
    await expect(cards.first()).toHaveAttribute('aria-pressed', 'true');

    // Space キーで選択解除できる
    await page.keyboard.press(' ');
    await expect(cards.first()).toHaveAttribute('aria-pressed', 'false');
  });

  test('確定ボタンは全カードを選ぶまで無効で、残り枚数を示す', async ({ page }) => {
    await page.goto('/');
    await page.getByText('日本史').click();
    await page.getByText('日本の歴史の大きな流れ').click();
    await page.getByText('チャレンジモード').click();

    const confirm = page.getByTestId('confirm-order');
    await expect(confirm).toBeDisabled();
    await expect(confirm).toContainText('あと');

    const cards = page.getByTestId('quiz-card');
    const count = await cards.count();
    for (let i = 0; i < count; i++) await cards.nth(i).click();
    await expect(confirm).toBeEnabled();
  });
});

test.describe('ダークテーマ', () => {
  test.use({ colorScheme: 'dark' });

  test('ダークテーマの背景色が適用される', async ({ page }) => {
    await page.goto('/');
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bg).toBe('rgb(28, 25, 23)');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '11-home-dark.png'), fullPage: true });
  });

  test('クイズ画面もダークテーマで表示される', async ({ page }) => {
    await page.goto('/');
    await page.getByText('日本史').click();
    await page.getByText('日本の歴史の大きな流れ').click();
    await page.getByText('じっくりモード').click();
    await expect(page.getByText('この中で1番古いのはどれ？')).toBeVisible();
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '12-careful-dark.png'),
      fullPage: true,
    });
  });
});
