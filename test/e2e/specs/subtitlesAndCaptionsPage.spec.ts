import { vpTest } from '../fixtures/vpTest';
import { test } from '@playwright/test';
import { waitForPageToLoadWithTimeout } from '../src/helpers/waitForPageToLoadWithTimeout';
import { getLinkByName } from '../testData/pageLinksData';
import { ExampleLinkName } from '../testData/ExampleLinkNames';

const link = getLinkByName(ExampleLinkName.SubtitlesAndCaptions);

vpTest(`Test if 5 videos on subtitles and captions page are playing as expected`, async ({ page, pomPages }) => {
    await test.step('Navigate to subtitles and captions page by clicking on link', async () => {
        await pomPages.mainPage.clickLinkByName(link.name);
        await waitForPageToLoadWithTimeout(page, 5000);
    });
    await test.step('Click on play button of srt and vtt video to play video', async () => {
        return pomPages.subtitlesAndCaptionsVideosPage.subtitlesAndCaptionsSrtAndVttVideoComponent.clickPlay();
    });
    await test.step('Validating that srt and vtt video is playing', async () => {
        await pomPages.subtitlesAndCaptionsVideosPage.subtitlesAndCaptionsSrtAndVttVideoComponent.validateVideoIsPlaying(true);
    });
    await test.step('Click on play button of playlist subtitles video to play video', async () => {
        return pomPages.subtitlesAndCaptionsVideosPage.subtitlesAndCaptionsPlaylistSubtitlesVideoComponent.clickPlay();
    });
    await test.step('Validating that playlist subtitles video is playing', async () => {
        await pomPages.subtitlesAndCaptionsVideosPage.subtitlesAndCaptionsPlaylistSubtitlesVideoComponent.validateVideoIsPlaying(true);
    });
    await test.step('Click on play button of paced and styled captions video to play video', async () => {
        return pomPages.subtitlesAndCaptionsVideosPage.subtitlesAndCaptionsPacedStyledVideoComponent.clickPlay();
    });
    await test.step('Validating that paced and styled captions video is playing', async () => {
        await pomPages.subtitlesAndCaptionsVideosPage.subtitlesAndCaptionsPacedStyledVideoComponent.validateVideoIsPlaying(true);
    });
    await test.step('Click on play button of karaoke video to play video', async () => {
        return pomPages.subtitlesAndCaptionsVideosPage.subtitlesAndCaptionsKaraokeVideoComponent.clickPlay();
    });
    await test.step('Validating that karaoke video is playing', async () => {
        await pomPages.subtitlesAndCaptionsVideosPage.subtitlesAndCaptionsKaraokeVideoComponent.validateVideoIsPlaying(true);
    });
    await test.step('Click on play button of translated transcript video to play video', async () => {
        return pomPages.subtitlesAndCaptionsVideosPage.subtitlesAndCaptionsTranslatedTranscriptVideoComponent.clickPlay();
    });
    await test.step('Validating that translated transcript video is playing', async () => {
        await pomPages.subtitlesAndCaptionsVideosPage.subtitlesAndCaptionsTranslatedTranscriptVideoComponent.validateVideoIsPlaying(true);
    });
});
