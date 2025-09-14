import { Page } from '@playwright/test';
import { VideoComponent } from '../../components/videoComponent';
import { BasePage } from './BasePage';
const PROFILES_PAGE_DEFAULT_PROFILE_VIDEO_SELECTOR = '//*[@id="player-default-profile_html5_api"]';
const PROFILES_PAGE_CUSTOM_PROFILE_VIDEO_SELECTOR = '//*[@id="player-custom-profile_html5_api"]';
const PROFILES_PAGE_CUSTOM_PROFILE_OVERRIDES_VIDEO_SELECTOR = '//*[@id="player-custom-profile-overrides_html5_api"]';

/**
 * Video player examples profiles page object
 */
export class ProfilesPage extends BasePage {
    public profilesDefaultProfileVideoComponent: VideoComponent;
    public profilesCustomProfileVideoComponent: VideoComponent;
    public profilesCustomProfileOverridesVideoComponent: VideoComponent;

    constructor(page: Page) {
        super(page);
        this.profilesDefaultProfileVideoComponent = new VideoComponent(page, PROFILES_PAGE_DEFAULT_PROFILE_VIDEO_SELECTOR);
        this.profilesCustomProfileVideoComponent = new VideoComponent(page, PROFILES_PAGE_CUSTOM_PROFILE_VIDEO_SELECTOR);
        this.profilesCustomProfileOverridesVideoComponent = new VideoComponent(page, PROFILES_PAGE_CUSTOM_PROFILE_OVERRIDES_VIDEO_SELECTOR);
    }
}
