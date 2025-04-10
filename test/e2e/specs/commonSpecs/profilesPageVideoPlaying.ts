import { Page, test } from '@playwright/test';
import { waitForPageToLoadWithTimeout } from '../../src/helpers/waitForPageToLoadWithTimeout';
import PageManager from '../../src/pom/PageManager';
import { ExampleLinkType } from '../../types/exampleLinkType';

export async function testProfilesPageVideoIsPlaying(page: Page, pomPages: PageManager, link: ExampleLinkType) {
    await test.step('Navigate to profiles page by clicking on link', async () => {
        await pomPages.mainPage.clickLinkByName(link.name);
        await waitForPageToLoadWithTimeout(page, 5000);
    });
    await test.step('Validating that default profile video is playing', async () => {
        await pomPages.profilesPage.profilesDefaultProfileVideoComponent.validateVideoIsPlaying(true);
    });
    await test.step('Scroll until custom profile video element is visible', async () => {
        await pomPages.profilesPage.profilesCustomProfileVideoComponent.locator.scrollIntoViewIfNeeded();
    });
    await test.step('Validating that custom profile video is playing', async () => {
        await pomPages.profilesPage.profilesCustomProfileVideoComponent.validateVideoIsPlaying(true);
    });
    await test.step('Scroll until custom profile overrides video element is visible', async () => {
        await pomPages.profilesPage.profilesCustomProfileOverridesVideoComponent.locator.scrollIntoViewIfNeeded();
    });
    await test.step('Validating that custom profile overrides video is playing', async () => {
        await pomPages.profilesPage.profilesCustomProfileOverridesVideoComponent.validateVideoIsPlaying(true);
    });
}
