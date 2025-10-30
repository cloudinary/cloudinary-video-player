import { Page } from '@playwright/test';
import { VideoComponent } from '../../components/videoComponent';
import { BasePage } from './BasePage';
const PROFILES_PAGE_DEFAULT_PROFILE_VIDEO_SELECTOR = '//*[@id="player-default-profile_html5_api"]';
const PROFILES_PAGE_CUSTOM_PROFILE_VIDEO_SELECTOR = '//*[@id="player-custom-profile_html5_api"]';
const PROFILES_PAGE_PROFILE_OVERRIDE_VIDEO_SELECTOR = '//*[@id="player-profile-override_html5_api"]';
const PROFILES_PAGE_SOURCE_OVERRIDE_VIDEO_SELECTOR = '//*[@id="player-source-override_html5_api"]';
const PROFILES_PAGE_ASSET_CONFIG_VIDEO_SELECTOR = '//*[@id="player-asset-config_html5_api"]';

/**
 * Video player examples profiles page object
 */
export class ProfilesPage extends BasePage {
    public profilesDefaultProfileVideoComponent: VideoComponent;
    public profilesCustomProfileVideoComponent: VideoComponent;
    public profilesProfileOverrideVideoComponent: VideoComponent;
    public profilesSourceOverrideVideoComponent: VideoComponent;
    public profilesAssetConfigVideoComponent: VideoComponent;

    constructor(page: Page) {
        super(page);
        this.profilesDefaultProfileVideoComponent = new VideoComponent(page, PROFILES_PAGE_DEFAULT_PROFILE_VIDEO_SELECTOR);
        this.profilesCustomProfileVideoComponent = new VideoComponent(page, PROFILES_PAGE_CUSTOM_PROFILE_VIDEO_SELECTOR);
        this.profilesProfileOverrideVideoComponent = new VideoComponent(page, PROFILES_PAGE_PROFILE_OVERRIDE_VIDEO_SELECTOR);
        this.profilesSourceOverrideVideoComponent = new VideoComponent(page, PROFILES_PAGE_SOURCE_OVERRIDE_VIDEO_SELECTOR);
        this.profilesAssetConfigVideoComponent = new VideoComponent(page, PROFILES_PAGE_ASSET_CONFIG_VIDEO_SELECTOR);
    }
}
