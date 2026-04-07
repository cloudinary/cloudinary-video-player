import { describe, it, expect } from 'vitest';
import { getCloudinaryConfigFromOptions } from '../../src/utils/cloudinary-config-from-options';

describe('getCloudinaryConfigFromOptions', () => {
  it('returns explicit cloudinaryConfig when set', () => {
    const cfg = { cloud_name: 'demo', secure: false };
    expect(getCloudinaryConfigFromOptions({ cloudinaryConfig: cfg, cloudName: 'other' })).toBe(cfg);
  });

  it('maps camelCase top-level keys to snake_case cloudinary fields', () => {
    expect(
      getCloudinaryConfigFromOptions({
        cloudName: 'demo',
        secure: false,
        publicId: 'x'
      })
    ).toEqual({
      cloud_name: 'demo',
      secure: false
    });
  });

  it('keeps snake_case keys that are in CLOUDINARY_CONFIG_PARAM', () => {
    expect(
      getCloudinaryConfigFromOptions({
        cloud_name: 'demo',
        cname: 'media.example.com'
      })
    ).toEqual({
      cloud_name: 'demo',
      cname: 'media.example.com'
    });
  });

  it('returns empty object when no cloudinary params', () => {
    expect(getCloudinaryConfigFromOptions({ publicId: 'x', profile: 'p' })).toEqual({});
  });
});
