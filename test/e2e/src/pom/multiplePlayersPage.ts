import { Page } from '@playwright/test';
import { VideoComponent } from '../../components/videoComponent';
import { BasePage } from './BasePage';
const MULTIPLE_PLAYERS_PAGE_PLAYER_1_VIDEO_SELECTOR = '//*[@id="player-1_html5_api"]';
const MULTIPLE_PLAYERS_PAGE_PLAYER_2_VIDEO_SELECTOR = '//*[@id="player-2_html5_api"]';
const MULTIPLE_PLAYERS_PAGE_PLAYER_3_VIDEO_SELECTOR = '//*[@id="player-3_html5_api"]';

/**
 * Video player examples colors API page object
 */
export class MultiplePlayersPage extends BasePage {
    public multiplePlayersPlayer1VideoComponent: VideoComponent;
    public multiplePlayersPlayer2VideoComponent: VideoComponent;
    public multiplePlayersPlayer3VideoComponent: VideoComponent;

    constructor(page: Page) {
        super(page);
        this.multiplePlayersPlayer1VideoComponent = new VideoComponent(page, MULTIPLE_PLAYERS_PAGE_PLAYER_1_VIDEO_SELECTOR);
        this.multiplePlayersPlayer2VideoComponent = new VideoComponent(page, MULTIPLE_PLAYERS_PAGE_PLAYER_2_VIDEO_SELECTOR);
        this.multiplePlayersPlayer3VideoComponent = new VideoComponent(page, MULTIPLE_PLAYERS_PAGE_PLAYER_3_VIDEO_SELECTOR);
    }
}
