import { describe, expect, it } from 'vitest';
import { normalizeOptions } from '../../../src/core/options/normalize.js';
import type { SourceOptions } from '../../../src/core/options/types.js';
import { buildSource } from '../../../src/core/source/build-source.js';

const player = normalizeOptions([{ cloudName: 'demo', allowUsageReport: false }]);
const posterOf = (options: SourceOptions) => buildSource(options, player).poster;
const SAVED = 'https://res.cloudinary.com/demo/_applet_/video_service/elements/upload/c2VhX3R1cnRsZQ==/poster';

describe('poster precedence (data-model §5, FR-038)', () => {
  it('uses the poster option first', () => {
    expect(posterOf({ publicId: 'sea_turtle', poster: 'https://cdn.example.com/p.jpg' })).toEqual({ url: 'https://cdn.example.com/p.jpg', origin: 'explicit' });
    expect(posterOf({ publicId: 'sea_turtle', poster: 'sample' })).toEqual({ url: 'https://res.cloudinary.com/demo/image/upload/sample', origin: 'explicit' });
    expect(posterOf({ publicId: 'sea_turtle', poster: false })).toBeNull();
  });

  it('uses posterOptions.publicId as an image poster', () => {
    const poster = posterOf({ publicId: 'sea_turtle', posterOptions: { publicId: 'sample', transformation: { effect: 'sepia' } } });

    expect(poster).toEqual({ url: 'https://res.cloudinary.com/demo/image/upload/e_sepia/sample', origin: 'image' });
  });

  it('loads the saved poster of a video by default, with posterOptions as ?tx=', () => {
    expect(posterOf({ publicId: 'sea_turtle' })).toEqual({ url: SAVED, origin: 'saved' });
    expect(posterOf({ publicId: 'sea_turtle', posterOptions: { transformation: { width: 300 } } })?.url).toBe(`${SAVED}?tx=c_scale%2Cw_300`);
  });

  it('shows the waveform for audio', () => {
    expect(posterOf({ publicId: 'song', sourceTypes: ['audio'] })).toEqual({
      url: 'https://res.cloudinary.com/demo/video/upload/fl_waveform/song.jpg',
      origin: 'waveform',
    });
  });

  it('has no poster of its own for a raw URL or a live stream', () => {
    expect(posterOf({ publicId: 'https://example.com/a.mp4' })).toBeNull();
    expect(posterOf({ publicId: 'stream', type: 'live' })).toBeNull();
    expect(posterOf({ publicId: 'https://example.com/a.mp4', posterOptions: { publicId: 'sample' } })?.origin).toBe('image');
  });

  it('keeps the still of an asset that is not a video resource', () => {
    expect(posterOf({ publicId: 'sample', resourceType: 'image' })).toEqual({ url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', origin: 'image' });
  });
});
