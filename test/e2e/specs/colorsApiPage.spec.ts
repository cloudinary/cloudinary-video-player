import { vpTest } from '../fixtures/vpTest';
import { expect, test } from '@playwright/test';
import { waitForPageToLoadWithTimeout } from '../src/helpers/waitForPageToLoadWithTimeout';
import { getLinkByName } from '../testData/pageLinksData';
import { ExampleLinkName } from '../testData/ExampleLinkNames';

const link = getLinkByName(ExampleLinkName.ColorsAPI);

vpTest(`Test if 3 videos on colors API page are playing as expected`, async ({ page, pomPages }) => {
    await test.step('Navigate to colors API page by clicking on link', async () => {
        await pomPages.mainPage.clickLinkByName(link.name);
        await waitForPageToLoadWithTimeout(page, 5000);
    });
    await test.step('Validating that modified color video is playing (in case isPause is false)', async () => {
        expect(await pomPages.colorsApiPage.colorsApiColorSkinVideoComponent.validateVideoPaused(false));
    });
    await test.step('Validating that dark skin video video is playing (in case isPause is false)', async () => {
        expect(await pomPages.colorsApiPage.colorsApiDarkSkinVideoComponent.validateVideoPaused(false));
    });
    await test.step('Scroll until light skin video element is visible', async () => {
        await pomPages.colorsApiPage.colorsApiLightSkinVideoComponent.locator.scrollIntoViewIfNeeded();
    });
    await test.step('Validating that light skin video is playing (in case isPause is false)', async () => {
        await expect(async () => {
            expect(await pomPages.colorsApiPage.colorsApiLightSkinVideoComponent.validateVideoPaused(false));
        }).toPass({ intervals: [500], timeout: 3000 });
    });
});
