import { Page } from '@playwright/test';
import { VideoComponent } from '../../components/videoComponent';
import { BasePage } from './BasePage';
const AUDIO_PLAYER_FIRST_VIDEO_SELECTOR = '//*[@id="player_html5_api"]';
const AUDIO_PLAYER_SECOND_VIDEO_SELECTOR = '//*[@id="player-t_html5_api"]';
/**
 * Video player examples audio player page object
 */
export class AudioPlayerPage extends BasePage {
  public audioPlayerFirstVideoComponent: VideoComponent;
  public audioPlayerSecondVideoComponent: VideoComponent;

  constructor(page: Page) {
    super(page);
    this.audioPlayerFirstVideoComponent = new VideoComponent(page, AUDIO_PLAYER_FIRST_VIDEO_SELECTOR);
    this.audioPlayerSecondVideoComponent = new VideoComponent(page, AUDIO_PLAYER_SECOND_VIDEO_SELECTOR);
  }
}