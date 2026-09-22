import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('タイムラインモード', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByText('日本史').click();
    await page.getByText('日本の歴史の大きな流れ').click();
    await page.getByText('タイムラインモード').click();
    await expect(page.getByText('この出来事はいつ頃？')).toBeVisible();
  });

  test('時代帯が等幅で表示される', async ({ page }) => {
    const bands = page.getByTestId('era-band');
    const count = await bands.count();
    expect(count).toBeGreaterThan(1);

    const widths: number[] = [];
    for (let i = 0; i < count; i++) {
      const box = await bands.nth(i).boundingBox();
      if (box) widths.push(Math.round(box.width));
    }
    const min = Math.min(...widths);
    const max = Math.max(...widths);
    // 等幅（丸め誤差の範囲で一致）
    expect(max - min).toBeLessThanOrEqual(2);
  });

  test('タイムラインをタップして解答できる', async ({ page }) => {
    const timeline = page.locator('[class*="timeline"]').first();
    const box = (await timeline.boundingBox())!;
    await page.mouse.click(box.x + box.width * 0.3, box.y + box.height / 2);

    await expect(page.getByText(/選択中:/)).toBeVisible();
    await page.getByRole('button', { name: 'ここに配置する' }).click();

    await expect(page.getByText(/正解！|不正解/)).toBeVisible();
    await page.screenshot({
      path: path.join(__dirname, '..', 'screenshots', '13-timeline.png'),
      fullPage: true,
    });
  });

  test('矢印ボタンで位置を調整できる', async ({ page }) => {
    const timeline = page.locator('[class*="timeline"]').first();
    const box = (await timeline.boundingBox())!;
    await page.mouse.click(box.x + box.width * 0.5, box.y + box.height / 2);

    const label = page.getByText(/選択中:/);
    const before = await label.textContent();
    await page.getByRole('button', { name: '大きく進める' }).click();
    await expect(label).not.toHaveText(before!);
  });
});
