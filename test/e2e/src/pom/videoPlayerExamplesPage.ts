import { Locator, Page } from '@playwright/test';

const EXAMPLE_LINKS_LIST_SELECTOR = "//*[@data-testid='examples-link']//li";
export class VideoPlayerExamplesPage {
  private page: Page;
  public examplesList: Locator;
  constructor(page: Page) {
    this.page= page;
    this.examplesList= page.locator(EXAMPLE_LINKS_LIST_SELECTOR);
  }
  public async clickLinkByName(name: string): Promise<void> {
    await this.page.getByRole('link', { name }).click();
    await this.page.waitForLoadState('networkidle');
  }
  public async goto(): Promise<void> {
    await this.page.goto('http://localhost:3000/index.html')
  }
}


