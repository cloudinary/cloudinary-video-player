import { Page } from '@playwright/test';
import { VideoComponent } from '../../components/videoComponent';
import { BasePage } from './BasePage';
const SUBTITLES_AND_CAPTIONS_PAGE_SRT_AND_VTT_VIDEO_SELECTOR = '//*[@id="player_html5_api"]';
const SUBTITLES_AND_CAPTIONS_PAGE_PLAYLIST_SUBTITLES_VIDEO_SELECTOR = '//*[@id="playlist_html5_api"]';
const SUBTITLES_AND_CAPTIONS_PAGE_PACED_STYLES_CAPTIONS_VIDEO_SELECTOR = '//*[@id="paced_html5_api"]';
const SUBTITLES_AND_CAPTIONS_PAGE_KARAOKE_VIDEO_SELECTOR = '//*[@id="karaoke_html5_api"]';
const SUBTITLES_AND_CAPTIONS_PAGE_TRANSLATED_TRANSCRIPT_VIDEO_SELECTOR = '//*[@id="translated-transcript_html5_api"]';
/**
 * Video player examples subtitles and captions page object
 */
export class SubtitlesAndCaptionsPage extends BasePage {
    public subtitlesAndCaptionsSrtAndVttVideoComponent: VideoComponent;
    public subtitlesAndCaptionsPlaylistSubtitlesVideoComponent: VideoComponent;
    public subtitlesAndCaptionsPacedStyledVideoComponent: VideoComponent;
    public subtitlesAndCaptionsKaraokeVideoComponent: VideoComponent;
    public subtitlesAndCaptionsTranslatedTranscriptVideoComponent: VideoComponent;

    constructor(page: Page) {
        super(page);
        this.subtitlesAndCaptionsSrtAndVttVideoComponent = new VideoComponent(page, SUBTITLES_AND_CAPTIONS_PAGE_SRT_AND_VTT_VIDEO_SELECTOR);
        this.subtitlesAndCaptionsPlaylistSubtitlesVideoComponent = new VideoComponent(page, SUBTITLES_AND_CAPTIONS_PAGE_PLAYLIST_SUBTITLES_VIDEO_SELECTOR);
        this.subtitlesAndCaptionsPacedStyledVideoComponent = new VideoComponent(page, SUBTITLES_AND_CAPTIONS_PAGE_PACED_STYLES_CAPTIONS_VIDEO_SELECTOR);
        this.subtitlesAndCaptionsKaraokeVideoComponent = new VideoComponent(page, SUBTITLES_AND_CAPTIONS_PAGE_KARAOKE_VIDEO_SELECTOR);
        this.subtitlesAndCaptionsTranslatedTranscriptVideoComponent = new VideoComponent(page, SUBTITLES_AND_CAPTIONS_PAGE_TRANSLATED_TRANSCRIPT_VIDEO_SELECTOR);
    }
}
