import { describe, expect, it } from 'vitest';
import schema from '../../../schema.json' with { type: 'json' };
import { DEFAULTS } from '../../../src/core/options/defaults.js';
import { OPTION_CHANGES } from '../../../src/core/options/renames.js';
import { debugReport } from '../../../src/core/options/validate.js';

const properties: Record<string, { default?: unknown; [key: string]: unknown }> = schema.definitions.PlayerOptions.properties;

describe('debugReport (FR-008)', () => {
  it('reports nothing for a valid v4 configuration', () => {
    const raw = {
      cloud_name: 'demo',
      publicId: 'sea_turtle',
      controls: true,
      colors: { accent: '#ff0000' },
      transformation: [{ width: 400 }, { effect: 'blur' }],
      textTracks: { captions: { label: 'English', default: true }, options: { gravity: 'top' } },
      cloudinaryAnalytics: { customData1: 'x' },
      lazy: { loadOnScroll: true },
      recommendations: () => [],
      _internalAnalyticsMetadata: {},
    };
    expect(debugReport(raw)).toEqual([]);
  });

  it('names unknown options', () => {
    expect(debugReport({ controlz: true })).toEqual(['Unknown option "controlz": it is ignored.']);
  });

  it('names removed options and their replacement', () => {
    const [videojs] = debugReport({ videojs: {} });
    expect(videojs).toMatch(/"videojs" is removed: .*player\.videojs/);
    expect(debugReport({ textTrackSettings: true })[0]).toMatch(/5\.x/);
  });

  it('uses the generic message for options that had no effect in v4', () => {
    expect(debugReport({ videoJS: {}, qualitySelector: {}, ima: {} })).toEqual([
      'Unknown option "videoJS": it is ignored.',
      'Unknown option "qualitySelector": it is ignored.',
      'Unknown option "ima": it is ignored.',
    ]);
  });

  it('checks an alias against its target option', () => {
    expect(debugReport({ resource_type: 5 })).toEqual(['Option "resource_type" has an invalid value: 5.']);
  });

  it('names the path of invalid nested values', () => {
    expect(debugReport({ colors: { accent: 1 }, autoplayMode: 'sometimes' })).toEqual([
      'Option "colors.accent" has an invalid value: 1.',
      'Option "autoplayMode" has an invalid value: "sometimes".',
    ]);
  });

  it('accepts only http and https logo URLs', () => {
    expect(debugReport({ logoOnclickUrl: 'javascript:alert(1)', logoImageUrl: 'https://example.com/logo.png' })).toHaveLength(1);
  });

  it('leaves secrets to the always-on warning', () => {
    expect(debugReport({ api_secret: 'x' })).toEqual([]);
  });
});

describe('one definition (types.ts → schema.json)', () => {
  it('keeps DEFAULTS equal to the @default tags', () => {
    for (const [key, value] of Object.entries(DEFAULTS)) {
      expect(properties[key]?.default, key).toEqual(value);
    }
  });

  it('gives every top-level @default a run-time default', () => {
    const documented = Object.keys(properties).filter((key) => properties[key]?.default !== undefined);
    expect(documented.filter((key) => !(key in DEFAULTS))).toEqual([]);
  });

  it('converts aliases only to options that exist', () => {
    const targets = Object.values(OPTION_CHANGES).flatMap((change) => (change.to ? [change.to] : []));
    expect(targets.filter((key) => !(key in properties))).toEqual([]);
  });
});
