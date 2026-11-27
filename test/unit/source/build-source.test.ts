import { describe, expect, it } from 'vitest';
import { normalizeOptions } from '../../../src/core/options/normalize.js';
import type { SourceOptions } from '../../../src/core/options/types.js';
import { buildSource, thumbnailSpriteUrl } from '../../../src/core/source/build-source.js';

const player = normalizeOptions([{ cloudName: 'demo', transformation: { width: 600 } }]);

describe('buildSource: source isolation (US2-2, FR-009)', () => {
  it('keeps the cloud settings of one source out of the player and of the next source', () => {
    const first = buildSource({ publicId: 'a', cloudinaryConfig: { cloud_name: 'other', private_cdn: true } }, player);
    const second = buildSource({ publicId: 'b' }, player);

    expect(first.renditions[0]?.url).toBe('https://other-res.cloudinary.com/video/upload/w_600/f_auto:video/a?_s=vp');
    expect(second.renditions[0]?.url).toBe('https://res.cloudinary.com/demo/video/upload/w_600/f_auto:video/b?_s=vp');
    expect(player.cloud).toEqual({ secure: true, cloudName: 'demo' });
  });

  it('never carries a transformation over to the next source', () => {
    buildSource({ publicId: 'a', transformation: { effect: 'sepia' } }, player);
    const next = buildSource({ publicId: 'b' }, player);

    expect(next.transformation).toEqual({ width: 600 });
  });

  it('gives the same result for the same input, and does not change the input', () => {
    const options: SourceOptions = { publicId: 'a', transformation: [{ width: 300 }], queryParams: { token: 'x' } };
    const snapshot = structuredClone(options);

    expect(buildSource(options, player)).toEqual(buildSource(options, player));
    expect(options).toEqual(snapshot);
  });

  it('returns a frozen source', () => {
    const source = buildSource({ publicId: 'a', sourceTypes: ['hls', 'mp4'] }, player);

    expect(Object.isFrozen(source)).toBe(true);
    expect(Object.isFrozen(source.renditions)).toBe(true);
    expect(Object.isFrozen(source.renditions[0])).toBe(true);
    expect(Object.isFrozen(source.poster)).toBe(true);
  });

  it('accepts the v4 snake_case names in source options', () => {
    const source = buildSource({ publicId: 'a', resource_type: 'image' } as SourceOptions, player);

    expect(source.resourceType).toBe('image');
  });
});

describe('thumbnailSpriteUrl', () => {
  const minimal = normalizeOptions([{ cloudName: 'demo' }]);

  it('has none for a raw URL, a live stream or audio', () => {
    expect(thumbnailSpriteUrl(buildSource({ publicId: 'https://example.com/a.mp4' }, minimal))).toBeNull();
    expect(thumbnailSpriteUrl(buildSource({ publicId: 'a', type: 'live' }, minimal))).toBeNull();
    expect(thumbnailSpriteUrl(buildSource({ publicId: 'a', sourceTypes: ['audio'] }, minimal))).toBeNull();
  });

  it('drops the formats from a chained transformation', () => {
    const source = buildSource({ publicId: 'a', transformation: [{ width: 300 }, { fetch_format: 'auto' }] }, minimal);

    expect(thumbnailSpriteUrl(source)).toBe('https://res.cloudinary.com/demo/video/upload/w_300/fl_sprite/a.vtt?_s=vp');
  });
});
