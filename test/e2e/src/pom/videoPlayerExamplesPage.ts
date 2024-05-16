import { Locator, Page } from '@playwright/test';

const EXAMPLE_LINKS_LIST_ID = "examples-link";
export class VideoPlayerExamplesPage {
  private page: Page;
  public examplesList: Locator;
  constructor(page: Page) {
    this.page= page;
    this.examplesList= page.getByTestId(EXAMPLE_LINKS_LIST_ID);
  }
  public async clickLinkByName(name: string): Promise<void> {
    await this.page.getByRole('link', { name }).click();
    await this.page.waitForLoadState('networkidle');
  }
  public async goto(): Promise<void> {
    await this.page.goto('http://localhost:3000/index.html');
  }
}


