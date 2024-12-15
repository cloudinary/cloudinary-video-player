import { Page } from '@playwright/test';
import { VideoComponent } from '../../components/videoComponent';
import { BasePage } from './BasePage';
const AUDIO_PLAYER_VIDEO_SELECTOR = '//*[@id="player_html5_api"]';
const AUDIO_PLAYER_WITH_TRANSFORMATION_VIDEO_SELECTOR = '//*[@id="player-t_html5_api"]';
/**
 * Video player examples audio player page object
 */
export class AudioPlayerPage extends BasePage {
    public audioPlayerVideoComponent: VideoComponent;
    public audioPlayerWithTransformationVideoComponent: VideoComponent;

    constructor(page: Page) {
        super(page);
        this.audioPlayerVideoComponent = new VideoComponent(page, AUDIO_PLAYER_VIDEO_SELECTOR);
        this.audioPlayerWithTransformationVideoComponent = new VideoComponent(page, AUDIO_PLAYER_WITH_TRANSFORMATION_VIDEO_SELECTOR);
    }
}
