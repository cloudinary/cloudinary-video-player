import { ExampleLinkType } from '../types/exampleLinkType';
import { ExampleLinkName } from './ExampleLinkNames';

/**
 * Array of all the examples pages names and links.
 */
export const LINKS: ExampleLinkType[] = [
    { name: ExampleLinkName.AdaptiveStreaming, endpoint: 'adaptive-streaming.html' },
    { name: ExampleLinkName.AIHighlightsGraph, endpoint: 'highlights-graph.html' },
    { name: ExampleLinkName.Analytics, endpoint: 'analytics.html' },
    { name: ExampleLinkName.APIAndEvents, endpoint: 'api.html' },
    { name: ExampleLinkName.AudioPlayer, endpoint: 'audio.html' },
    { name: ExampleLinkName.AutoplayOnScroll, endpoint: 'autoplay-on-scroll.html' },
    { name: ExampleLinkName.Chapters, endpoint: 'chapters.html' },
    { name: ExampleLinkName.CloudinaryAnalytics, endpoint: 'cloudinary-analytics.html' },
    { name: ExampleLinkName.CodecsAndFormats, endpoint: 'codec-formats.html' },
    { name: ExampleLinkName.ColorsAPI, endpoint: 'colors.html' },
    { name: ExampleLinkName.Components, endpoint: 'components.html' },
    { name: ExampleLinkName.CustomErrors, endpoint: 'custom-cld-errors.html' },
    { name: ExampleLinkName.DisplayConfigurations, endpoint: 'ui-config.html' },
    { name: ExampleLinkName.DebugMode, endpoint: 'debug.html' },
    { name: ExampleLinkName.ESModuleImports, endpoint: 'es-imports.html' },
    { name: ExampleLinkName.FloatingPlayer, endpoint: 'floating-player.html' },
    { name: ExampleLinkName.FluidLayouts, endpoint: 'fluid.html' },
    { name: ExampleLinkName.ForceHLSSubtitles, endpoint: 'force-hls-subtitles-ios.html' },
    { name: ExampleLinkName.InteractionArea, endpoint: 'interaction-area.html' },
    { name: ExampleLinkName.MultiplePlayers, endpoint: 'multiple-players.html' },
    { name: ExampleLinkName.Playlist, endpoint: 'playlist.html' },
    { name: ExampleLinkName.PlaylistByTag, endpoint: 'playlist-by-tag-captions.html' },
    { name: ExampleLinkName.PosterOptions, endpoint: 'poster.html' },
    { name: ExampleLinkName.Profiles, endpoint: 'profiles.html' },
    { name: ExampleLinkName.RawURL, endpoint: 'raw-url.html' },
    { name: ExampleLinkName.Recommendations, endpoint: 'recommendations.html' },
    { name: ExampleLinkName.SeekThumbnails, endpoint: 'seek-thumbs.html' },
    { name: ExampleLinkName.ShoppableVideos, endpoint: 'shoppable.html' },
    { name: ExampleLinkName.SubtitlesAndCaptions, endpoint: 'subtitles-and-captions.html' },
    { name: ExampleLinkName.VideoTransformations, endpoint: 'transformations.html' },
    { name: ExampleLinkName.VASTAndVPAIDSupport, endpoint: 'vast-vpaid.html' },
    { name: ExampleLinkName.VR360Videos, endpoint: '360.html' },
    { name: ExampleLinkName.EmbeddedIframePlayer, endpoint: 'embedded-iframe.html' },
    { name: ExampleLinkName.ESMImports, endpoint: 'cld-vp-esm-pages.netlify.app' },
    { name: ExampleLinkName.VisualSearch, endpoint: 'visual-search.html' },
];

/**
 * Retrieves an example link object from the `LINKS` array based on a given name.
 */
export function getLinkByName(name: ExampleLinkName): ExampleLinkType {
    return LINKS.find((link) => link.name === name);
}
