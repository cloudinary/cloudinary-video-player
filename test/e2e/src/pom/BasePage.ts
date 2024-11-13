import { Page } from '@playwright/test';

/**
 * Base Page represent an example page
 * Such as main page, highlight graph page etc.
 */
export class BasePage {
    protected page: Page;

    constructor(page: Page) {
        this.page = page;
    }
}
