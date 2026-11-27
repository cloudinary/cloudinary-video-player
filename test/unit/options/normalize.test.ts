import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULTS } from '../../../src/core/options/defaults.js';
import { cleanOptions, normalizeOptions, resolveCloudConfig } from '../../../src/core/options/normalize.js';

let warn: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => {
  warn.mockRestore();
});

describe('normalizeOptions', () => {
  it('applies the defaults under the given options', () => {
    const options = normalizeOptions([{ cloudName: 'demo', controls: true }]);
    expect(options.controls).toBe(true);
    expect(options.skin).toBe(DEFAULTS.skin);
    expect(options.sourceTypes).toEqual(['auto']);
    expect(options.fontFace).toBe('Inter');
  });

  it('defaults playsinline from the environment (iOS)', () => {
    expect(normalizeOptions([{}], { ios: true }).playsinline).toBe(true);
    expect(normalizeOptions([{}]).playsinline).toBe(false);
    expect(normalizeOptions([{ playsinline: false }], { ios: true }).playsinline).toBe(false);
  });

  it.each([
    ['camelCase at the top level', { cloudName: 'demo', privateCdn: true }],
    ['snake_case at the top level', { cloud_name: 'demo', private_cdn: true }],
    ['snake_case in cloudinaryConfig', { cloudinaryConfig: { cloud_name: 'demo', private_cdn: true } }],
    ['camelCase in cloudinaryConfig', { cloudinaryConfig: { cloudName: 'demo', privateCdn: true } }],
  ])('reads the cloud settings in %s (FR-006)', (_name, raw) => {
    const options = normalizeOptions([raw]);
    expect(options.cloud).toEqual({ cloudName: 'demo', privateCdn: true, secure: true });
    expect(options).not.toHaveProperty('cloudName');
    expect(options).not.toHaveProperty('cloudinaryConfig');
  });

  it('lets cloudinaryConfig win over top-level cloud keys (v4)', () => {
    const options = normalizeOptions([{ cloudName: 'top', cloudinaryConfig: { cloud_name: 'nested' } }]);
    expect(options.cloud.cloudName).toBe('nested');
  });

  it('converts aliases and drops removed options', () => {
    const options = normalizeOptions([{ resource_type: 'image', raw_transformation: 'e_blur', html5: {}, videoJS: {} }]);
    expect(options.resourceType).toBe('image');
    expect(options.rawTransformation).toBe('e_blur');
    expect(options).not.toHaveProperty('html5');
    expect(options).not.toHaveProperty('videoJS');
    expect(options).not.toHaveProperty('resource_type');
  });

  it('keeps unknown options (they are reported in debug mode, not rejected)', () => {
    expect(normalizeOptions([{ somethingNew: 1 }])).toHaveProperty('somethingNew', 1);
  });

  it('merges default objects one level deep and other values shallowly', () => {
    const options = normalizeOptions([{ colors: { accent: '#ff0000' }, posterOptions: { publicId: 'p' } }]);
    expect(options.colors).toEqual({ base: '#000000', accent: '#ff0000', text: '#FFFFFF' });
    expect(options.posterOptions).toEqual({ publicId: 'p' });
  });

  it('merges saved configurations under local options (data-model §12)', () => {
    const saved = { playerOptions: { fluid: true, controls: false }, sourceOptions: { chapters: true, resource_type: 'image' } };
    const options = normalizeOptions([saved.playerOptions, saved.sourceOptions, { controls: true, resourceType: 'video' }]);
    expect(options).toMatchObject({ fluid: true, controls: true, chapters: true, resourceType: 'video' });
  });

  it('applies the precedence options > attributes > saved > defaults', () => {
    const options = normalizeOptions([{ skin: 'light', loop: true, muted: true }, { loop: false, muted: false }, { muted: true }]);
    expect(options).toMatchObject({ skin: 'light', loop: false, muted: true });
  });

  it('returns a frozen copy and never changes the input', () => {
    const colors = { accent: '#ff0000' };
    const raw = { cloudName: 'demo', colors, playedEventTimes: [10] };
    const options = normalizeOptions([raw]);
    expect(Object.isFrozen(options)).toBe(true);
    expect(Object.isFrozen(options.colors)).toBe(true);
    expect(Object.isFrozen(options.playedEventTimes)).toBe(true);
    expect(Object.isFrozen(raw) || Object.isFrozen(colors)).toBe(false);
    expect(raw).toEqual({ cloudName: 'demo', colors: { accent: '#ff0000' }, playedEventTimes: [10] });
  });

  it('keeps functions as they are', () => {
    const recommendations = (): never[] => [];
    expect(normalizeOptions([{ recommendations }]).recommendations).toBe(recommendations);
  });
});

describe('secrets (FR-029)', () => {
  it.each([
    ['the top level', [{ cloudName: 'demo', api_secret: 'x' }]],
    ['cloudinaryConfig', [{ cloudinaryConfig: { cloud_name: 'demo', sign_url: true } }]],
    ['the v4 source object', [{ source: { publicId: 'a', auth_token: {} } }]],
    ['a saved configuration', [{ apiSecret: 'x' }, { cloudName: 'demo' }]],
  ])('drops a secret in %s with a warning in every mode', (_name, layers) => {
    const options = normalizeOptions(layers as Array<Record<string, unknown>>);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0]?.[0])).toMatch(/sign URLs on your server/);
    expect(JSON.stringify(options)).not.toMatch(/api_secret|apiSecret|sign_url|auth_token/);
  });

  it('cleanOptions does not change its input', () => {
    const raw = { api_secret: 'x', cloudinaryConfig: { auth_token: 'y' } };
    cleanOptions(raw);
    expect(raw).toEqual({ api_secret: 'x', cloudinaryConfig: { auth_token: 'y' } });
  });
});

describe('resolveCloudConfig', () => {
  it('overrides the player settings for one source without changing them (FR-009)', () => {
    const player = resolveCloudConfig({ cloudName: 'demo', secureDistribution: 'cdn.example.com' });
    const source = resolveCloudConfig({ cloudinaryConfig: { cloud_name: 'other' } }, player);
    expect(source).toEqual({ cloudName: 'other', secure: true, secureDistribution: 'cdn.example.com' });
    expect(player.cloudName).toBe('demo');
    expect(Object.isFrozen(source)).toBe(true);
  });

  it('defaults secure to true and accepts false', () => {
    expect(resolveCloudConfig({}).secure).toBe(true);
    expect(resolveCloudConfig({ secure: false }).secure).toBe(false);
  });
});
