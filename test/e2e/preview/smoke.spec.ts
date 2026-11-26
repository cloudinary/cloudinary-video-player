import { expect, test } from '@playwright/test';

// Runs against the Netlify deploy preview (PREVIEW_URL) of this commit (test-plan.md §6).

test('the CDN files load from the preview into a page on another origin', async ({ page, baseURL }) => {
  const base = new URL('/', baseURL).href;
  // Same scheme as the preview, so the browser does not block mixed content.
  const CONSUMER = `${new URL(base).protocol}//consumer.example.test/`;
  await page.route(CONSUMER, (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: `<!doctype html><link rel="stylesheet" href="${base}player.min.css"><script src="${base}player.min.js"></script>`,
    }),
  );
  const css = page.waitForResponse(`${base}player.min.css`);
  await page.goto(CONSUMER);
  expect((await css).ok()).toBe(true);
  expect(await page.evaluate(() => typeof (window as Window & { cloudinary?: object }).cloudinary)).toBe('object');
});

test('the preview examples page renders a preset', async ({ page }) => {
  await page.goto('/player.html?preset=minimal-v4');
  await expect(page.getByRole('heading', { level: 1, name: 'Minimal v4 snippet' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Minimal v4 snippet' })).toBeVisible();
});
