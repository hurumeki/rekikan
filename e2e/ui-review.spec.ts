import { test, expect } from '@playwright/test';
import path from 'path';

const SCREENSHOT_DIR = path.join(__dirname, '..', 'screenshots');

function screenshotPath(name: string) {
  return path.join(SCREENSHOT_DIR, name);
}

test.describe('UI Review - Mobile', () => {
  test('01 - Home screen: region selection', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('れきかん')).toBeVisible();
    await expect(page.getByText('日本史')).toBeVisible();
    await expect(page.getByText('ヨーロッパ史')).toBeVisible();
    await expect(page.getByText('中国史')).toBeVisible();
    await page.screenshot({ path: screenshotPath('01-home.png'), fullPage: true });
  });

  test('02 - Quiz list: Japan region', async ({ page }) => {
    await page.goto('/');
    await page.getByText('日本史').click();
    await expect(page.getByText('← 戻る')).toBeVisible();
    await expect(page.getByText('日本の歴史の大きな流れ')).toBeVisible();
    await page.screenshot({ path: screenshotPath('02-quiz-list.png'), fullPage: true });
  });

  test('03 - Mode selection', async ({ page }) => {
    await page.goto('/');
    await page.getByText('日本史').click();
    await page.getByText('日本の歴史の大きな流れ').click();
    await expect(page.getByText('じっくりモード')).toBeVisible();
    await expect(page.getByText('チャレンジモード')).toBeVisible();
    await page.screenshot({ path: screenshotPath('03-mode-select.png'), fullPage: true });
  });

  test('04 - Careful mode: initial', async ({ page }) => {
    await page.goto('/');
    await page.getByText('日本史').click();
    await page.getByText('日本の歴史の大きな流れ').click();
    await page.getByText('じっくりモード').click();
    await expect(page.getByText('この中で1番古いのはどれ？')).toBeVisible();
    await page.screenshot({ path: screenshotPath('04-careful-initial.png'), fullPage: true });
  });

  test('05 - Careful mode: after card tap (correct or shake)', async ({ page }) => {
    await page.goto('/');
    await page.getByText('日本史').click();
    await page.getByText('日本の歴史の大きな流れ').click();
    await page.getByText('じっくりモード').click();
    await expect(page.getByText('この中で1番古いのはどれ？')).toBeVisible();

    // Tap a card — it either moves to confirmed area (correct) or shakes red (incorrect)
    const firstCard = page.getByTestId('quiz-card').first();
    await firstCard.click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: screenshotPath('05-careful-feedback.png'), fullPage: true });
  });

  test('06 - Challenge mode: initial', async ({ page }) => {
    await page.goto('/');
    await page.getByText('日本史').click();
    await page.getByText('日本の歴史の大きな流れ').click();
    await page.getByText('チャレンジモード').click();
    await expect(page.getByText('古い順にカードをタップしてください')).toBeVisible();
    await page.screenshot({ path: screenshotPath('06-challenge-initial.png'), fullPage: true });
  });

  test('07 - Challenge mode: after selecting cards', async ({ page }) => {
    await page.goto('/');
    await page.getByText('日本史').click();
    await page.getByText('日本の歴史の大きな流れ').click();
    await page.getByText('チャレンジモード').click();
    await expect(page.getByText('古い順にカードをタップしてください')).toBeVisible();

    const cards = page.getByTestId('quiz-card');
    const count = await cards.count();
    for (let i = 0; i < Math.min(3, count); i++) {
      await cards.nth(i).click();
      await page.waitForTimeout(200);
    }
    await page.screenshot({ path: screenshotPath('07-challenge-selected.png'), fullPage: true });
  });

  test('08 - Challenge mode: result screen', async ({ page }) => {
    await page.goto('/');
    await page.getByText('日本史').click();
    await page.getByText('日本の歴史の大きな流れ').click();
    await page.getByText('チャレンジモード').click();
    await expect(page.getByText('古い順にカードをタップしてください')).toBeVisible();

    // Select all cards
    const cards = page.getByTestId('quiz-card');
    const count = await cards.count();
    for (let i = 0; i < count; i++) {
      await cards.nth(i).click();
      await page.waitForTimeout(150);
    }

    // Confirm
    const confirmButton = page.getByRole('button', { name: 'この順番で確定する' });
    await expect(confirmButton).toBeEnabled({ timeout: 3000 });
    await confirmButton.click();

    // Wait for result screen
    await expect(page.getByText('正解').first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('button', { name: 'もう一度' })).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: screenshotPath('08-challenge-result.png'), fullPage: true });
  });
});
