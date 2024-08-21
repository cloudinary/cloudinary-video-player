import { Page } from '@playwright/test';

/**
 * Wait until there are no network connections for at least 5000 ms or for given timeout to pass.
 * Needed for console logs to appear. and in pages that loading video 'waitForLoadState('networkidle')' entering a long loop.
 */
export async function waitForPageToLoadWithTimeout(page: Page, timeout: number): Promise<unknown> {
    return Promise.race([page.waitForLoadState('networkidle'), new Promise((r) => setTimeout(r, timeout))]);
}
