import { expect, Page, test } from '@playwright/test';
import { waitForPageToLoadWithTimeout } from '../../src/helpers/waitForPageToLoadWithTimeout';
import PageManager from '../../src/pom/PageManager';
import { ExampleLinkType } from '../../types/exampleLinkType';

const PORTRAIT_PLAYER_SELECTOR = '#portrait';
// vtt.js sizes cue text at 5% of the display *height*; on a 9:16 player that is ~9% of
// the width. The player caps it at 3.5% of the width (see text-tracks.scss).
const MAX_FONT_SIZE_TO_WIDTH = 0.04;
const CUES_TO_SAMPLE = 3;

/**
 * Captions on a portrait (9:16) player must stay inside the caption display and be sized
 * relative to the player width, not its height (VIDEO-21222).
 */
export async function testSubtitlesAndCaptionsPortraitCues(page: Page, pomPages: PageManager, link: ExampleLinkType) {
    await test.step('Navigate to subtitles and captions page by clicking on link', async () => {
        await pomPages.mainPage.clickLinkByName(link.name);
        await waitForPageToLoadWithTimeout(page, 5000);
    });
    await test.step('Play the portrait player', async () => {
        await pomPages.subtitlesAndCaptionsVideosPage.portraitVideoComponent.clickPlay();
        await pomPages.subtitlesAndCaptionsVideosPage.portraitVideoComponent.validateVideoIsPlaying(true);
    });
    await test.step('Every sampled cue is inside the caption display and sized by player width', async () => {
        const seen = new Set<string>();
        await expect(async () => {
            const cue = await page.evaluate((selector: string) => {
                const player = document.querySelector(selector) as HTMLElement | null;
                const display = player?.querySelector('.vjs-text-track-display') as HTMLElement | null;
                const cueEl = display?.querySelector('.vjs-text-track-cue') as HTMLElement | null;
                const textEl = cueEl?.firstElementChild as HTMLElement | null;
                if (!player || !display || !cueEl || !textEl) return null;
                return {
                    text: textEl.textContent || '',
                    playerWidth: player.getBoundingClientRect().width,
                    displayBottom: display.getBoundingClientRect().bottom,
                    textBottom: textEl.getBoundingClientRect().bottom,
                    fontSize: parseFloat(getComputedStyle(cueEl).fontSize),
                };
            }, PORTRAIT_PLAYER_SELECTOR);
            expect(cue, 'no cue rendered yet').not.toBeNull();
            if (!cue) return;
            expect(cue.textBottom, `cue "${cue.text}" spills below the caption display`).toBeLessThanOrEqual(cue.displayBottom + 1);
            expect(cue.fontSize, `cue font ${cue.fontSize}px too large for ${cue.playerWidth}px wide player`).toBeLessThanOrEqual(cue.playerWidth * MAX_FONT_SIZE_TO_WIDTH);
            seen.add(cue.text);
            expect(seen.size, 'waiting for more distinct cues').toBeGreaterThanOrEqual(CUES_TO_SAMPLE);
        }).toPass({ intervals: [500], timeout: 45000 });
    });
}
