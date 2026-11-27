import { describe, expect, it } from 'vitest';
import { buildUsageReport } from '../../src/core/analytics/usage-report.js';
import type { UsageReportOptions } from '../../src/core/analytics/usage-report.js';

const report = (options: UsageReportOptions, defaults: UsageReportOptions = {}) =>
  buildUsageReport({ version: '5.0.0', cloudName: 'demo', options, defaults });

describe('buildUsageReport', () => {
  it('sends the version, the cloud name and nothing else when no feature is in use', () => {
    expect(report({})).toEqual({ vpVersion: '5.0.0', cloudName: 'demo' });
  });

  it('never sends a URL, title, description, ID, tag, label, font or color (FR-028)', () => {
    // Every free-text value is a sentinel; none may reach the report.
    const options = {
      logoImageUrl: 'https://canary.example/logo.png',
      logoOnclickUrl: 'https://canary.example/click',
      title: 'CANARY title',
      description: 'CANARY description',
      info: { title: 'CANARY info title', subtitle: 'CANARY subtitle', description: 'CANARY info description' },
      poster: 'https://canary.example/poster.jpg',
      posterOptions: { publicId: 'CANARY_poster_id' },
      chapters: { url: 'https://canary.example/chapters.vtt' },
      recommendations: [{ publicId: 'CANARY_rec', title: 'CANARY rec title' }],
      videoSources: [{ publicId: 'CANARY_source', label: 'CANARY source label' }],
      fontFace: 'CANARY font',
      cropPadColor: 'CANARY_color',
      colors: { base: 'CANARY_base' },
      schedule: { weekly: [{ day: 'CANARY_day', start: '09:00', end: '17:00' }] },
      textTracks: {
        captions: { label: 'CANARY caption label', url: 'https://canary.example/captions.vtt' },
        subtitles: [{ label: 'CANARY subtitle label', url: 'https://canary.example/subtitles.srt' }],
        options: { fontFace: 'CANARY caption font' },
      },
      ads: { adTagUrl: 'https://canary.example/vast.xml', adLabel: 'CANARY ad label' },
      playlistWidget: { playlist: 'CANARY_playlist', playlistByTag: 'CANARY_tag' },
      // Not features: removed options, ids and v4 internals.
      publicId: 'CANARY_public_id',
      class: 'CANARY_class',
      width: 640,
      height: 360,
      videoJS: { CANARY: true },
      controlBar: { CANARY: true },
      shoppable: { products: ['CANARY_product'] },
      interactionAreas: { CANARY: true },
      _internalAnalyticsMetadata: { playerBundle: 'CANARY_bundle' },
    };
    const result = report(options);

    expect(Object.values(result).join(' ')).not.toMatch(/canary/i);
    const notFeatures = /^(publicId|class|className|width|height|videoJS|controlBar|shoppable.*|interactionAreas|vpInstanceId|_internalAnalyticsMetadata|playerBundle)$/;
    expect(Object.keys(result).filter((key) => notFeatures.test(key))).toEqual([]);
    expect(result).toMatchObject({
      logoImageUrl: 'true',
      logoOnclickUrl: 'true',
      sourceInfo: 'true',
      sourceTitle: 'true',
      sourceDescription: 'true',
      poster: 'url',
      posterOptions: 'true',
      posterOptionsPublicId: 'true',
      chapters: 'url',
      recommendations: '1',
      videoSources: 'true',
      fontFace: 'true',
      cropPadColor: 'true',
      colors: 'true',
      schedule: 'true',
      textTracks: 'true',
      styledTextTracksFont: 'true',
      adsAdTagUrl: 'true',
      adsAdLabel: 'true',
      playlist: 'true',
      playlistByTag: 'true',
    });
  });

  it('sends option values that come from a fixed list, numbers and lists of numbers', () => {
    expect(
      report({ skin: 'light', autoplayMode: 'on-scroll', maxTries: 5, playedEventPercents: [10, 90], sourceTypes: ['hls', 'dash'] }),
    ).toMatchObject({ skin: 'light', autoplayMode: 'on-scroll', maxTries: '5', playedEventPercents: '10,90', sourceTypes: 'hls,dash' });
  });

  it('leaves out options equal to their default, and sends a changed default, also false', () => {
    const defaults = { showLogo: true, skin: 'dark', playedEventPercents: [25, 50, 75, 100], adaptiveStreaming: { strategy: 'balanced' } };
    const options = { showLogo: false, skin: 'dark', playedEventPercents: [25, 50, 75, 100], adaptiveStreaming: { strategy: 'balanced' } };
    expect(report(options, defaults)).toEqual({ vpVersion: '5.0.0', cloudName: 'demo', showLogo: 'false' });
    expect(report({ adaptiveStreaming: { strategy: 'fast' } }, defaults)).toMatchObject({ abrStrategy: 'fast' });
  });

  it('does not count a v4 default-only option (cloudinaryAnalytics: true) or an empty object as a feature', () => {
    const result = report({ cloudinaryAnalytics: true, colors: {}, analytics: false }, { cloudinaryAnalytics: true });
    expect(result).toEqual({ vpVersion: '5.0.0', cloudName: 'demo' });
  });

  it('derives the chapters, poster and lazy modes as v4', () => {
    expect(report({ chapters: true, poster: true, lazy: true })).toMatchObject({ chapters: 'auto', poster: 'auto', lazy: 'true' });
    expect(report({ chapters: { 0: 'Intro', 10: 'Part 1' } })).toMatchObject({ chapters: 'inline-chapters' });
    expect(report({ lazy: { loadOnScroll: true } })).toMatchObject({ lazy: 'true', lazyLoadOnScroll: 'true' });
  });

  it('describes the text tracks without their URLs or labels', () => {
    const textTracks = {
      captions: { language: 'en' },
      subtitles: [{ language: 'fr', maxWords: 4 }, { url: 'https://a.example/b.vtt' }, { url: 'https://a.example/c.srt' }, { url: 'https://a.example/d.transcript' }],
      options: { theme: 'yellow-outlined', gravity: 'top', wordHighlight: true },
    };
    expect(report({ textTracks })).toMatchObject({
      textTracks: 'true',
      textTracksLength: '5',
      textTracksOptions: 'theme,gravity,wordHighlight',
      pacedTextTracks: 'true',
      wordHighlight: 'true',
      transcriptLanguages: 'en,fr',
      transcriptAutoLoaded: 'true',
      transcriptFromURl: 'true',
      vttFromUrl: 'true',
      srtFromUrl: 'true',
      styledTextTracksTheme: 'yellow-outlined',
      styledTextTracksGravity: 'top',
    });
  });

  it('describes ads and the playlist widget with their settings', () => {
    const ads = { adTagUrl: 'https://a.example/vast', showCountdown: true, locale: 'es', prerollTimeout: 5, adsInPlaylist: 'first-video' };
    expect(report({ ads, playlistWidget: { direction: 'vertical', total: 4 } })).toMatchObject({
      adsAdTagUrl: 'true',
      adsShowCountdown: 'true',
      adsLocale: 'es',
      adsPrerollTimeout: '5',
      adsAdsInPlaylist: 'first-video',
      playlistWidgetDirection: 'vertical',
      playlistWidgetTotal: '4',
    });
  });
});
