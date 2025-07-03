import { Page, test, expect } from '@playwright/test';
import { waitForPageToLoadWithTimeout } from '../../src/helpers/waitForPageToLoadWithTimeout';
import PageManager from '../../src/pom/PageManager';
import { ExampleLinkType } from '../../types/exampleLinkType';
import { VideoComponent } from '../../components/videoComponent';

export async function testVideoDetailsPageVideoIsPlaying(page: Page, pomPages: PageManager, link: ExampleLinkType) {
    await test.step('Navigate to video details page by clicking on link', async () => {
        await pomPages.mainPage.clickLinkByName(link.name);
        await waitForPageToLoadWithTimeout(page, 5000);
    });
    
    await test.step('Validating that auto-fetch both title & description video is playing', async () => {
        const player1VideoSelector = '//*[@id="player1_html5_api"]';
        const player1Component = new VideoComponent(page, player1VideoSelector);
        await player1Component.validateVideoIsPlaying(true);
    });
    
    await test.step('Validating that auto-fetch title only video is playing', async () => {
        const player2VideoSelector = '//*[@id="player2_html5_api"]';
        const player2Component = new VideoComponent(page, player2VideoSelector);
        
        // Try to click play if the video isn't autoplaying due to browser policies
        try {
            await player2Component.clickPlay();
        } catch (e) {
            // Play button might not be visible if video is already playing
        }
        
        await player2Component.validateVideoIsPlaying(true);
    });
    
    await test.step('Validating that mixed legacy format video is playing', async () => {
        const player3VideoSelector = '//*[@id="player3_html5_api"]';
        const player3Component = new VideoComponent(page, player3VideoSelector);
        
        // Try to click play if the video isn't autoplaying due to browser policies
        try {
            await player3Component.clickPlay();
        } catch (e) {
            // Play button might not be visible if video is already playing
        }
        
        await player3Component.validateVideoIsPlaying(true);
    });
    
    await test.step('Validating that title bars are visible on players', async () => {
        // Check that title bar elements exist and are visible for players with title content
        const titleBarSelector = '.vjs-title-bar';
        const titleBars = page.locator(titleBarSelector);
        
        // Wait for at least one title bar to be visible (auto-fetch might take time)
        await expect(titleBars.first()).toBeVisible({ timeout: 10000 });
        
        // Verify title bar content is not empty for at least one player
        const titleText = await page.locator('.vjs-title-bar-title').first().textContent();
        expect(titleText).toBeTruthy();
    });
} 
