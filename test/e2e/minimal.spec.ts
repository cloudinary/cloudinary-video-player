import { createRequire } from 'node:module';
import { assets } from './assets.ts';
import { expect, test } from './fixtures/example-page.ts';

const hlsScript = createRequire(import.meta.url).resolve('hls.js/dist/hls.min.js');

// Walking skeleton (T028): the built loader runs on the examples page, and this browser can
// decode the live H.264 HLS media that the player will use (hls.js on a plain <video>).
test('minimal-v4: the loader runs and live HLS media plays @smoke', async ({ examplePage, page }) => {
  await examplePage.open('minimal-v4');
  expect(await page.evaluate(() => typeof (window as Window & { cloudinary?: object }).cloudinary)).toBe('object');
  expect(await examplePage.axe()).toEqual([]);

  await page.addScriptTag({ path: hlsScript });
  await page.evaluate((src) => {
    const video = Object.assign(document.createElement('video'), { id: 'probe', muted: true });
    document.body.append(video);
    const { Hls } = window as unknown as { Hls: new () => { loadSource(url: string): void; attachMedia(media: HTMLVideoElement): void } };
    const hls = new Hls();
    hls.loadSource(src);
    hls.attachMedia(video);
    void video.play();
  }, assets.seaTurtle.hls);
  await expect.poll(() => page.locator('#probe').evaluate((video: HTMLVideoElement) => video.currentTime), { timeout: 20_000 }).toBeGreaterThan(1);
});

for (const delivery of ['cdn', 'npm', 'element'] as const) {
  test(`minimal-v4 renders with delivery=${delivery} @smoke`, async ({ examplePage, page }) => {
    await examplePage.open('minimal-v4', delivery);
    await expect(page.getByRole('region', { name: 'Minimal v4 snippet' })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Delivery' }).locator('[aria-current="page"]')).toHaveAttribute('href', `?preset=minimal-v4&delivery=${delivery}`);
  });
}
