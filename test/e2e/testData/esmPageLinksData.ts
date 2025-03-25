import { ExampleLinkType } from '../types/exampleLinkType';
import { ExampleLinkName } from './ExampleLinkNames';

/**
 * Array of all the examples pages names and links on ESM import page.
 */
export const ESM_LINKS: ExampleLinkType[] = [
    { name: ExampleLinkName.AdaptiveStreaming, endpoint: 'adaptive-streaming' },
    { name: ExampleLinkName.AIHighlightsGraph, endpoint: 'highlights-graph' },
    { name: ExampleLinkName.Analytics, endpoint: 'analytics' },
    { name: ExampleLinkName.APIAndEvents, endpoint: 'api' },
    { name: ExampleLinkName.AudioPlayer, endpoint: 'audio' },
    { name: ExampleLinkName.AutoplayOnScroll, endpoint: 'autoplay-on-scroll' },
    { name: ExampleLinkName.Chapters, endpoint: 'chapters' },
    { name: ExampleLinkName.CloudinaryAnalytics, endpoint: 'cloudinary-analytics' },
    { name: ExampleLinkName.CodecsAndFormats, endpoint: 'codec-formats' },
    { name: ExampleLinkName.ColorsAPI, endpoint: 'colors' },
    { name: ExampleLinkName.Components, endpoint: 'components' },
    { name: ExampleLinkName.CustomErrors, endpoint: 'custom-cld-errors' },
    { name: ExampleLinkName.DisplayConfigurations, endpoint: 'ui-config' },
    { name: ExampleLinkName.DebugMode, endpoint: 'debug' },
    { name: ExampleLinkName.FloatingPlayer, endpoint: 'floating-player' },
    { name: ExampleLinkName.FluidLayouts, endpoint: 'fluid' },
    { name: ExampleLinkName.ForceHLSSubtitles, endpoint: 'force-hls-subtitles' },
    { name: ExampleLinkName.InteractionArea, endpoint: 'interaction-area' },
    { name: ExampleLinkName.MultiplePlayers, endpoint: 'multiple-players' },
    { name: ExampleLinkName.Playlist, endpoint: 'playlist' },
    { name: ExampleLinkName.PlaylistByTag, endpoint: 'playlist-by-tag' },
    { name: ExampleLinkName.PosterOptions, endpoint: 'poster' },
    { name: ExampleLinkName.Profiles, endpoint: 'profiles' },
    { name: ExampleLinkName.RawURL, endpoint: 'raw-url' },
    { name: ExampleLinkName.Recommendations, endpoint: 'recommendations' },
    { name: ExampleLinkName.SeekThumbnails, endpoint: 'seek-thumbs' },
    { name: ExampleLinkName.ShoppableVideos, endpoint: 'shoppable' },
    { name: ExampleLinkName.SubtitlesAndCaptions, endpoint: 'subtitles-and-captions' },
    { name: ExampleLinkName.VideoTransformations, endpoint: 'transformations' },
    { name: ExampleLinkName.VASTAndVPAIDSupport, endpoint: 'vast-vpaid' },
    { name: ExampleLinkName.VR360Videos, endpoint: '360' },
    { name: ExampleLinkName.AllBuild, endpoint: 'all' },
    { name: ExampleLinkName.LightBuild, endpoint: 'light' },
];

/**
 * Retrieves an example link object from the `ESM_LINKS` array based on a given name.
 */
export function getEsmLinkByName(name: ExampleLinkName): ExampleLinkType {
    return ESM_LINKS.find((link) => link.name === name);
}
