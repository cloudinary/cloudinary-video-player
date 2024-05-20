import { Page } from '@playwright/test';

export class VideoPlayerExamplesPage {
  private page: Page;

  constructor(page: Page) {
    this.page= page;
  }

  public async clickLinkByName(name: string): Promise<void> {
    await this.page.getByRole('link', { name, exact: true }).click();
    await this.page.waitForLoadState('load');
  }

  public async goto(): Promise<void> {
    await this.page.goto('http://localhost:3000/index.html');
  }
}


