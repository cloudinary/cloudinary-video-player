import { Page } from '@playwright/test';
import { HighlightsGraphPage } from './highlightsGraphPage';
import { BasePage } from './BasePage';
import { MainPage } from './mainPage';
import { AnalyticsPage } from './analyticsPage';
import { ApiAndEventsPage } from './apiAndEventsPage';
import { AudioPlayerPage } from './audioPlayerPage';
import { AutoplayOnScrollPage } from './autoplayOnScrollPage';
import { ChaptersPage } from './chaptersPage';
import { CldAnalyticsPage } from './cldAnalyticsPage';
import { CodecsAndFormats } from './codecsAndFormats';
import { ColorsApiPage } from './colorsApiPage';
import { ComponentsPage } from './componentsPage';
import { DisplayConfigurationsPage } from './displayConfigurationsPage';
import { FloatingPlayerPage } from './floatingPlayerPgae';
import { FluidLayoutsPage } from './fluidLayoutsPage';
import { ForceHlsSubtitlesPage } from './forceHlsSubtitlesPage';
import { MultiplePlayersPage } from './multiplePlayersPage';
import { PlaylistPage } from './playlistPage';
import { PlaylistByTagPage } from './playlistByTagPage';
import { PosterOptionsPage } from './posterOptionsPage';
import { ProfilesPage } from './profilesPage';
import { RawUrlPage } from './rawUrlPage';
import { RecommendationsPage } from './recommendationsPage';
import { SeekThumbnailsPage } from './seekThumbnailsPage';
import { ShoppableVideosPage } from './shoppableVideosPage';
import { SubtitlesAndCaptionsPage } from './subtitlesAndCaptionsPage';
import { VideoTransformationsPage } from './videoTransformationsPage';
import { VastAndVpaidPage } from './vastAndVpaidPage';
import { Vr360VideosPage } from './vr360VideosPage';
import { VisualSearchPage } from './visualSearchPage';

/**
 * Page manager,
 * Contains and initialize pages that uses in the tests
 */
export class PageManager {
    private readonly page: Page;
    private readonly pageMap = new Map<string, BasePage>();

    constructor(page: Page) {
        this.page = page;
    }

    /**
     * Helper:
     * Returns and initialize relevant page
     */
    private getPage<T extends BasePage>(page: new (page: Page) => T): T {
        const pageName = page.name;
        if (!this.pageMap.has(pageName)) {
            this.pageMap.set(pageName, new page(this.page));
        }
        return this.pageMap.get(pageName) as T;
    }

    /**
     * Returns main page object
     */
    public get mainPage(): MainPage {
        return this.getPage(MainPage);
    }

    /**
     * Returns highlightGraphPage page object
     */
    public get highlightGraphPage(): HighlightsGraphPage {
        return this.getPage(HighlightsGraphPage);
    }

    /**
     * Returns Analytics page object
     */
    public get analyticsPage(): AnalyticsPage {
        return this.getPage(AnalyticsPage);
    }

    /**
     * Returns API and Events page object
     */
    public get apiAndEventsPage(): ApiAndEventsPage {
        return this.getPage(ApiAndEventsPage);
    }

    /**
     * Returns audio player page object
     */
    public get audioPlayerPage(): AudioPlayerPage {
        return this.getPage(AudioPlayerPage);
    }

    /**
     * Returns autoplay on scroll page object
     */
    public get autoplayOnScrollPage(): AutoplayOnScrollPage {
        return this.getPage(AutoplayOnScrollPage);
    }

    /**
     * Returns chapters page object
     */
    public get chaptersPage(): ChaptersPage {
        return this.getPage(ChaptersPage);
    }

    /**
     * Returns Cloudinary analytics page object
     */
    public get cldAnalyticsPage(): CldAnalyticsPage {
        return this.getPage(CldAnalyticsPage);
    }

    /**
     * Returns codecs and formats page object
     */
    public get codecsAndFormatsPage(): CodecsAndFormats {
        return this.getPage(CodecsAndFormats);
    }

    public get colorsApiPage(): ColorsApiPage {
        return this.getPage(ColorsApiPage);
    }

    public get componentsPage(): ComponentsPage {
        return this.getPage(ComponentsPage);
    }

    public get displayConfigurationsPage(): DisplayConfigurationsPage {
        return this.getPage(DisplayConfigurationsPage);
    }

    public get floatingPlayerPage(): FloatingPlayerPage {
        return this.getPage(FloatingPlayerPage);
    }

    public get fluidLayoutsPage(): FluidLayoutsPage {
        return this.getPage(FluidLayoutsPage);
    }

    public get forceHlsSubtitlesPage(): ForceHlsSubtitlesPage {
        return this.getPage(ForceHlsSubtitlesPage);
    }

    public get multiplePlayersPage(): MultiplePlayersPage {
        return this.getPage(MultiplePlayersPage);
    }

    public get playlistPage(): PlaylistPage {
        return this.getPage(PlaylistPage);
    }

    public get playlistByTagPage(): PlaylistByTagPage {
        return this.getPage(PlaylistByTagPage);
    }

    public get posterOptionsPage(): PosterOptionsPage {
        return this.getPage(PosterOptionsPage);
    }

    public get profilesPage(): ProfilesPage {
        return this.getPage(ProfilesPage);
    }

    public get rawUrlPage(): RawUrlPage {
        return this.getPage(RawUrlPage);
    }

    public get recommendationsPage(): RecommendationsPage {
        return this.getPage(RecommendationsPage);
    }

    public get seekThumbnailsPage(): SeekThumbnailsPage {
        return this.getPage(SeekThumbnailsPage);
    }

    public get shoppableVideosPage(): ShoppableVideosPage {
        return this.getPage(ShoppableVideosPage);
    }

    public get subtitlesAndCaptionsVideosPage(): SubtitlesAndCaptionsPage {
        return this.getPage(SubtitlesAndCaptionsPage);
    }

    public get videoTransformationsPage(): VideoTransformationsPage {
        return this.getPage(VideoTransformationsPage);
    }

    public get vastAndVpaidPage(): VastAndVpaidPage {
        return this.getPage(VastAndVpaidPage);
    }

    public get vr360VideosPage(): Vr360VideosPage {
        return this.getPage(Vr360VideosPage);
    }

    /**
     * Returns visual search page object
     */
    public get visualSearchPage(): VisualSearchPage {
        return this.getPage(VisualSearchPage);
    }
}
export default PageManager;
