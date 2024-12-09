import { Page } from '@playwright/test';
import { HighlightsGraphPage } from './highlightsGraphPage';
import { BasePage } from './BasePage';
import { MainPage } from './mainPage';
import { AnalyticsPage } from './analyticsPage';

/**
 * Page manager,
 * Contains and initialize pages that uses in the tests
 */
export class PageManager {
    private readonly page: Page;
    private readonly pageMap = new Map<string, BasePage>();

    constructor(page: Page) {
        this.page = page;
    }

    /**
     * Helper:
     * Returns and initialize relevant page
     */
    private getPage<T extends BasePage>(page: new (page: Page) => T): T {
        const pageName = page.name;
        if (!this.pageMap.has(pageName)) {
            this.pageMap.set(pageName, new page(this.page));
        }
        return this.pageMap.get(pageName) as T;
    }

    /**
     * Returns main page object
     */
    public get mainPage(): MainPage {
        return this.getPage(MainPage);
    }

    /**
     * Returns highlightGraphPage page object
     */
    public get highlightGraphPage(): HighlightsGraphPage {
        return this.getPage(HighlightsGraphPage);
    }

    /**
     * Returns Analytics page object
     */
    public get analyticsPage(): AnalyticsPage {
        return this.getPage(AnalyticsPage);
    }
}
export default PageManager;
