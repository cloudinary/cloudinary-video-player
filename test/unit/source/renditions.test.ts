import { describe, expect, it } from 'vitest';
import { parseSourceType } from '../../../src/core/source/codecs.js';
import { rawUrlRenditions, renditions, type RenditionSpec } from '../../../src/core/source/renditions.js';

const spec = (overrides: Partial<RenditionSpec> = {}): RenditionSpec => ({
  asset: { cloud: { cloudName: 'demo', secure: true }, publicId: 'a', resourceType: 'video', type: 'upload' },
  sourceTypes: ['auto'],
  hdr: false,
  live: false,
  query: {},
  ...overrides,
});

describe('renditions: order and engines (FR-013)', () => {
  it('keeps the order of sourceTypes, so the layer falls back in that order', () => {
    const result = renditions(spec({ sourceTypes: ['dash', 'hls', 'webm/vp9', 'mp4'] }));

    expect(result.map(({ sourceType, engine, mimeType }) => [sourceType, engine, mimeType])).toEqual([
      ['dash', 'dash', 'application/dash+xml'],
      ['hls', 'hls', 'application/x-mpegURL'],
      ['webm/vp9', 'native', 'video/webm'],
      ['mp4', 'native', 'video/mp4'],
    ]);
  });

  it('joins named transformations to the added step, and puts rawTransformation last (v4)', () => {
    const [auto] = renditions(spec({ transformation: ['a', 'b'], rawTransformation: 'e_loop' }));

    expect(auto?.url).toBe('https://res.cloudinary.com/demo/video/upload/f_auto:video,t_a.b/e_loop/a');
  });

  it('adds no sp_auto to a live stream', () => {
    const [hls] = renditions(spec({ asset: { ...spec().asset, type: 'live' }, sourceTypes: ['hls'], live: true }));

    expect(hls?.url).toBe('https://res.cloudinary.com/demo/video/live/a.m3u8');
  });

  it('delivers audio as MP3', () => {
    const [audio] = renditions(spec({ sourceTypes: ['audio'], transformation: { start_offset: 2 } }));

    expect(audio).toEqual({ url: 'https://res.cloudinary.com/demo/video/upload/so_2/a.mp3', mimeType: 'video/mp4', sourceType: 'audio', engine: 'native' });
  });
});

describe('rawUrlRenditions', () => {
  it('types a raw URL by its extension, with a query string or a fragment', () => {
    expect(rawUrlRenditions('https://example.com/a.m3u8?token=1', [])[0]?.engine).toBe('hls');
    expect(rawUrlRenditions('https://example.com/a.mpd#t=2', ['auto'])[0]?.engine).toBe('dash');
    expect(rawUrlRenditions('https://example.com/a', [])[0]?.mimeType).toBe('video/auto');
  });

  it('uses the container of a source type with a codec', () => {
    expect(rawUrlRenditions('https://example.com/a', ['webm/vp9'])[0]?.mimeType).toBe('video/webm');
  });
});

describe('parseSourceType', () => {
  it('splits container and codec, case-insensitive', () => {
    expect(parseSourceType('HLS/H265')).toEqual({ container: 'hls', codec: 'h265', format: 'm3u8', mimeType: 'application/x-mpegURL', engine: 'hls' });
  });
});
