import { test, expect } from '@playwright/test';
import path from 'path';
import { loadAllCards, allQuizzes } from '@/lib/data-loader';
import { ALL_NODES } from '@/lib/data-registry';

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
    const confirmButton = page.getByTestId('confirm-order');
    await expect(confirmButton).toBeEnabled({ timeout: 3000 });
    await confirmButton.click();

    // Wait for result screen
    await expect(page.getByText('正解').first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('button', { name: 'もう一度' })).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: screenshotPath('08-challenge-result.png'), fullPage: true });
  });

  test('09 - Card images: shown once a card has one', async ({ page }) => {
    const withImage = (await loadAllCards()).find((c) => c.has_image);

    await page.goto('/');
    await page.getByText('日本史').click();
    await page.getByText('日本の歴史の大きな流れ').click();
    await page.getByText('チャレンジモード').click();
    await expect(page.getByText('古い順にカードをタップしてください')).toBeVisible();

    if (!withImage) {
      // まだ画像付きのカードが 1 枚もない状態。画像なしでも表示が崩れないことだけ確かめる
      await expect(page.getByTestId('card-image')).toHaveCount(0);
      await expect(page.getByTestId('quiz-card').first()).toBeVisible();
      return;
    }

    // 画像はヒント ON か解答後に出る（docs/09 §9.1.4）
    const quiz = allQuizzes.find((q) => q.card_ids.includes(withImage.id));
    test.skip(!quiz, '画像付きカードを含むクイズがない');
    await page.goto(`/quiz/${quiz!.id}`);
    await page.getByText('チャレンジモード').click();
    await expect(page.getByTestId('card-image')).toHaveCount(0);
    await page.getByRole('button', { name: /ヒント/ }).click();
    await expect(page.getByTestId('card-image').first()).toBeVisible();
  });

  test('10 - Node cover images: shown once a node has one', async ({ page }) => {
    const withCover = ALL_NODES.find((n) => n.has_cover_image);

    await page.goto('/');
    await page.getByText('日本史').click();
    await expect(page.getByText('← 戻る')).toBeVisible();

    if (!withCover) {
      await expect(page.getByTestId('node-cover-image')).toHaveCount(0);
      return;
    }

    await page.goto(`/?region=${withCover.region}`);
    // カバー画像を持つノードを開く
    await page.getByTestId('node-toggle').filter({ hasText: withCover.label }).first().click();
    await expect(page.getByTestId('node-cover-image').first()).toBeVisible();
  });
});
