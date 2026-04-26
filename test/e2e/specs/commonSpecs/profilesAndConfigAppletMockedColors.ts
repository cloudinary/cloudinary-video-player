import { Page, test, expect, Request } from '@playwright/test';
import { waitForPageToLoadWithTimeout } from '../../src/helpers/waitForPageToLoadWithTimeout';
import PageManager from '../../src/pom/PageManager';
import { ExampleLinkType } from '../../types/exampleLinkType';
import { PROFILE_ROUTE_PATTERN, CONFIG_ROUTE_PATTERN } from '../../src/consts/appletRoutes';

export async function testProfileAndConfigAppletMockedColors(page: Page, pomPages: PageManager,link: ExampleLinkType
) {

  const profileMockColors = { base: '#FF0000', accent: '#00FF00', text: '#0000FF' };
  const configMockColors = { base: '#AA0000', accent: '#00AA00', text: '#0000AA' };

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

  await test.step('Navigate to profiles page', async () => {
    await pomPages.mainPage.clickLinkByName(link.name);
    await waitForPageToLoadWithTimeout(page, 5000);
  });

  await test.step('Validate mocked profile colors are applied', async () => {
    await pomPages.profilesPage.profilesCustomProfileVideoComponent.validateColors(profileMockColors);
  });

  await test.step('Validate mocked config colors are applied', async () => {
    await pomPages.profilesPage.profilesAssetConfigVideoComponent.validateColors(configMockColors);
  });
}