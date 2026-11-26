import { describe, expect, it } from 'vitest';
import { parseAttributes, parseAttributeValue, toOptionName } from '../../../src/core/options/attributes.ts';

const attrs = (record: Record<string, string>) => Object.entries(record).map(([name, value]) => ({ name, value }));

describe('parseAttributes (FR-036)', () => {
  it('reads data-cld-* attributes as camelCase options', () => {
    const { options } = parseAttributes(attrs({ 'data-cld-public-id': 'sea_turtle', 'data-cld-source-types': '["hls"]' }));
    expect(options).toEqual({ publicId: 'sea_turtle', sourceTypes: ['hls'] });
  });

  it('reads the native media attributes', () => {
    const { options } = parseAttributes(
      attrs({ autoplay: '', muted: '', loop: 'false', controls: 'true', playsinline: '', preload: 'none', poster: 'p.jpg' }),
    );
    expect(options).toEqual({
      autoplay: true,
      muted: true,
      loop: false,
      controls: true,
      playsinline: true,
      preload: 'none',
      poster: 'p.jpg',
    });
  });

  it('ignores every other attribute', () => {
    const { options } = parseAttributes(attrs({ id: 'player', class: 'x', style: 'color: red', width: '640', 'data-foo': '1' }));
    expect(options).toEqual({});
  });

  it('sets fluid from the cld-fluid or vjs-fluid class (v4)', () => {
    expect(parseAttributes([], 'cld-video-player cld-fluid').options).toEqual({ fluid: true });
    expect(parseAttributes([], 'vjs-fluid').options).toEqual({ fluid: true });
    expect(parseAttributes([], 'cld-fluidish').options).toEqual({});
  });

  it('skips an attribute with invalid JSON and reports it', () => {
    const { options, errors } = parseAttributes(attrs({ 'data-cld-colors': '{accent: red}', 'data-cld-loop': 'true' }));
    expect(options).toEqual({ loop: true });
    expect(errors).toEqual(['Attribute "data-cld-colors" is skipped: its value is not valid JSON.']);
  });
});

describe('parseAttributeValue', () => {
  it.each([
    ['maxDpr', '1.5', 1.5],
    ['maxTries', '3', 3],
    ['publicId', '12345', '12345'],
    ['cropPadColor', '000000', '000000'],
    ['aspectRatio', '16:9', '16:9'],
    ['showLogo', 'false', false],
    ['colors', '{"accent":"#ff0"}', { accent: '#ff0' }],
    ['playbackRates', '[0.5,1,2]', [0.5, 1, 2]],
    ['maxDpr', '0x10', '0x10'],
  ])('%s="%s" → %j', (option, value, expected) => {
    expect(parseAttributeValue(option, value)).toEqual(expected);
  });
});

describe('toOptionName', () => {
  it.each([
    ['public-id', 'publicId'],
    ['cloud_name', 'cloudName'],
    ['video-config', 'videoConfig'],
    ['muted', 'muted'],
  ])('%s → %s', (attribute, option) => {
    expect(toOptionName(attribute)).toBe(option);
  });
});
