import { Page, test, expect, Request } from '@playwright/test';
import { waitForPageToLoadWithTimeout } from '../../src/helpers/waitForPageToLoadWithTimeout';
import PageManager from '../../src/pom/PageManager';
import { ExampleLinkType } from '../../types/exampleLinkType';

const PROFILE_ROUTE_PATTERN = '**/_applet_/video_service/video_player_profiles/*.json*';
const CONFIG_ROUTE_PATTERN = '**/_applet_/video_service/video_player_config/**/*.json*';

export async function testProfileAndConfigAppletUrlsAndMockedColors(page: Page, pomPages: PageManager,link: ExampleLinkType
) {
  const profileRequests: Request[] = [];
  const configRequests: Request[] = [];

  const profileMockColors = { base: '#FF0000', accent: '#00FF00', text: '#0000FF' };
  const configMockColors = { base: '#AA0000', accent: '#00AA00', text: '#0000AA' };

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

  await test.step('Remove tracking routes', async () => {
    await page.unroute(PROFILE_ROUTE_PATTERN);
    await page.unroute(CONFIG_ROUTE_PATTERN);
  });

  await test.step('Mock profile and config responses with custom colors', async () => {
    await page.route(PROFILE_ROUTE_PATTERN, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          playerOptions: { colors: profileMockColors },
          sourceOptions: {},
        }),
      });
    });

    await page.route(CONFIG_ROUTE_PATTERN, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          playerOptions: { colors: configMockColors },
          sourceOptions: {},
        }),
      });
    });
  });

  await test.step('Reload page to apply mocked responses', async () => {
    await page.reload();
    await waitForPageToLoadWithTimeout(page, 5000);
  });

  await test.step('Validate mocked profile colors are applied', async () => {
    await pomPages.profilesPage.profilesCustomProfileVideoComponent.validateColors(profileMockColors);
  });

  await test.step('Validate mocked config colors are applied', async () => {
    await pomPages.profilesPage.profilesAssetConfigVideoComponent.validateColors(configMockColors);
  });
}