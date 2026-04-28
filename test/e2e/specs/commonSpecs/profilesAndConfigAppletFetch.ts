import { Page, test, expect, Request } from '@playwright/test';
import { waitForPageToLoadWithTimeout } from '../../src/helpers/waitForPageToLoadWithTimeout';
import PageManager from '../../src/pom/PageManager';
import { ExampleLinkType } from '../../types/exampleLinkType';
import { PROFILE_ROUTE_PATTERN, CONFIG_ROUTE_PATTERN } from '../../src/consts/appletRoutes';


export async function testProfileAndConfigAppletUrlsFetch(page: Page, pomPages: PageManager,link: ExampleLinkType
) {
  const profileRequests: Request[] = [];
  const configRequests: Request[] = [];

  await test.step('Track profile and config requests', async () => {
    await page.route(PROFILE_ROUTE_PATTERN, (route) => {
      profileRequests.push(route.request());
      return route.continue();
    });

    await page.route(CONFIG_ROUTE_PATTERN, (route) => {
      configRequests.push(route.request());
      return route.continue();
    });
  });

  await test.step('Navigate to profiles page', async () => {
    await pomPages.mainPage.clickLinkByName(link.name);
    await waitForPageToLoadWithTimeout(page, 5000);
  });

  await test.step('Validate profile request URL', async () => {
    expect(profileRequests.length, 'Expected at least one profile request').toBeGreaterThanOrEqual(1);

    const profileUrl = new URL(profileRequests[0].url());
    expect(profileUrl.pathname).toMatch(
      /\/_applet_\/video_service\/video_player_profiles\/[^/]+\.json$/
    );
  });

  await test.step('Validate config request URL', async () => {
    expect(configRequests.length, 'Expected at least one config request').toBeGreaterThanOrEqual(1);

    const configUrl = new URL(configRequests[0].url());
    expect(configUrl.pathname).toMatch(
      /\/_applet_\/video_service\/video_player_config\/video\/[^/]+\/[^/]+\.json$/
    );
  });
}