import { Page } from '@playwright/test';
import { VideoComponent } from '../../components/videoComponent';
import { BasePage } from './BasePage';
const SRT_AND_VTT_VIDEO_SELECTOR = '//*[@id="player_html5_api"]';
const PLAYLIST_SUBTITLES_VIDEO_SELECTOR = '//*[@id="playlist_html5_api"]';
const PACED_STYLES_CAPTIONS_VIDEO_SELECTOR = '//*[@id="paced_html5_api"]';
const KARAOKE_VIDEO_SELECTOR = '//*[@id="karaoke_html5_api"]';
const TRANSLATED_TRANSCRIPT_VIDEO_SELECTOR = '//*[@id="translated-transcript_html5_api"]';
/**
 * Video player examples subtitles and captions page object
 */
export class SubtitlesAndCaptionsPage extends BasePage {
    public srtAndVttVideoComponent: VideoComponent;
    public playlistSubtitlesVideoComponent: VideoComponent;
    public pacedStyledVideoComponent: VideoComponent;
    public karaokeVideoComponent: VideoComponent;
    public translatedTranscriptVideoComponent: VideoComponent;

    constructor(page: Page) {
        super(page);
        this.srtAndVttVideoComponent = new VideoComponent(page, SRT_AND_VTT_VIDEO_SELECTOR);
        this.playlistSubtitlesVideoComponent = new VideoComponent(page, PLAYLIST_SUBTITLES_VIDEO_SELECTOR);
        this.pacedStyledVideoComponent = new VideoComponent(page, PACED_STYLES_CAPTIONS_VIDEO_SELECTOR);
        this.karaokeVideoComponent = new VideoComponent(page, KARAOKE_VIDEO_SELECTOR);
        this.translatedTranscriptVideoComponent = new VideoComponent(page, TRANSLATED_TRANSCRIPT_VIDEO_SELECTOR);
    }
}
