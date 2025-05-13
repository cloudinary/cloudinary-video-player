import { Page, test } from '@playwright/test';
import { waitForPageToLoadWithTimeout } from '../../src/helpers/waitForPageToLoadWithTimeout';
import PageManager from '../../src/pom/PageManager';
import { ExampleLinkType } from '../../types/exampleLinkType';

export async function testSubtitlesAndCaptionsPageVideoIsPlaying(page: Page, pomPages: PageManager, link: ExampleLinkType) {
    await test.step('Navigate to subtitles and captions page by clicking on link', async () => {
        await pomPages.mainPage.clickLinkByName(link.name);
        await waitForPageToLoadWithTimeout(page, 5000);
    });
    await test.step('Click on play button of srt and vtt video to play video', async () => {
        return pomPages.subtitlesAndCaptionsVideosPage.srtAndVttVideoComponent.clickPlay();
    });
    await test.step('Validating that srt and vtt video is playing', async () => {
        await pomPages.subtitlesAndCaptionsVideosPage.srtAndVttVideoComponent.validateVideoIsPlaying(true);
    });
    await test.step('Click on play button of playlist subtitles video to play video', async () => {
        return pomPages.subtitlesAndCaptionsVideosPage.playlistSubtitlesVideoComponent.clickPlay();
    });
    await test.step('Validating that playlist subtitles video is playing', async () => {
        await pomPages.subtitlesAndCaptionsVideosPage.playlistSubtitlesVideoComponent.validateVideoIsPlaying(true);
    });
    await test.step('Click on play button of paced and styled captions video to play video', async () => {
        return pomPages.subtitlesAndCaptionsVideosPage.pacedStyledVideoComponent.clickPlay();
    });
    await test.step('Validating that paced and styled captions video is playing', async () => {
        await pomPages.subtitlesAndCaptionsVideosPage.pacedStyledVideoComponent.validateVideoIsPlaying(true);
    });
    await test.step('Click on play button of karaoke video to play video', async () => {
        return pomPages.subtitlesAndCaptionsVideosPage.karaokeVideoComponent.clickPlay();
    });
    await test.step('Validating that karaoke video is playing', async () => {
        await pomPages.subtitlesAndCaptionsVideosPage.karaokeVideoComponent.validateVideoIsPlaying(true);
    });
    await test.step('Click on play button of translated transcript video to play video', async () => {
        return pomPages.subtitlesAndCaptionsVideosPage.translatedTranscriptVideoComponent.clickPlay();
    });
    await test.step('Validating that translated transcript video is playing', async () => {
        await pomPages.subtitlesAndCaptionsVideosPage.translatedTranscriptVideoComponent.validateVideoIsPlaying(true);
    });
}
