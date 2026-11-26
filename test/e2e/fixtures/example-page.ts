import AxeBuilder from '@axe-core/playwright';
import { test as base, expect } from '@playwright/test';

export type Delivery = 'cdn' | 'npm' | 'element';

/** Console errors that are not player bugs. Keep it short and give each entry a reason. */
const ALLOWED_CONSOLE_ERRORS: RegExp[] = [];
const MEDIA_HOSTS = /res\.cloudinary\.com|video_service/;
const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

interface ExamplePage {
  /** Opens `player.html` with a preset and waits for `window.examples.ready`. */
  open(preset: string, delivery?: Delivery): Promise<void>;
  /** Every request URL the page made. */
  readonly requests: string[];
  /** axe violations on the current page (WCAG 2.2 AA tags). */
  axe(): Promise<Awaited<ReturnType<AxeBuilder['analyze']>>['violations']>;
}

export const test = base.extend<{ examplePage: ExamplePage }>({
  examplePage: async ({ page }, use, testInfo) => {
    const errors: string[] = [];
    const requests: string[] = [];
    const failed: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error' && !ALLOWED_CONSOLE_ERRORS.some((allowed) => allowed.test(message.text()))) {
        errors.push(message.text());
      }
    });
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('request', (request) => requests.push(request.url()));
    page.on('requestfailed', (request) => failed.push(`${request.url()} (${request.failure()?.errorText})`));
    page.on('response', (response) => {
      if (response.status() >= 400) failed.push(`${response.url()} (${response.status()})`);
    });

    await use({
      async open(preset, delivery = 'cdn') {
        await page.goto(`/player.html?preset=${preset}&delivery=${delivery}`);
        await page.waitForFunction(() => window.examples !== undefined);
        await page.evaluate(() => window.examples.ready);
      },
      requests,
      async axe() {
        return (await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze()).violations;
      },
    });

    // Failed media and video-service requests in the report tell an outage from a bug.
    const mediaFailures = failed.filter((entry) => MEDIA_HOSTS.test(entry));
    if (mediaFailures.length) {
      await testInfo.attach('failed media requests', { body: mediaFailures.join('\n'), contentType: 'text/plain' });
    }
    expect(errors, 'console errors').toEqual([]);
  },
});

export { expect };

declare global {
  interface Window {
    examples: { players: unknown[]; ready: Promise<void> };
  }
}
