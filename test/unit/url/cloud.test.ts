import { describe, expect, it } from 'vitest';
import { resolveCloudConfig } from '../../../src/core/options/normalize.js';
import { deliveryPrefix } from '../../../src/core/url/cloud.js';

const prefix = (config: Record<string, unknown>) => deliveryPrefix(resolveCloudConfig({ cloudinaryConfig: { cloud_name: 'demo', ...config } }));

describe('deliveryPrefix (the v4 url-gen rule, test/fixtures/url-parity cloud-* cases)', () => {
  it.each([
    ['the shared CDN over https by default', {}, 'https://res.cloudinary.com/demo'],
    ['http', { secure: false }, 'http://res.cloudinary.com/demo'],
    ['a private CDN', { private_cdn: true }, 'https://demo-res.cloudinary.com'],
    ['a secure distribution with a private CDN', { private_cdn: true, secure_distribution: 'media.example.com' }, 'https://media.example.com'],
    ['a secure distribution on the shared domain', { secure_distribution: 'media.example.com' }, 'https://media.example.com/demo'],
    ['the old Akamai host as the shared CDN', { secure_distribution: 'cloudinary-a.akamaihd.net' }, 'https://res.cloudinary.com/demo'],
    ['a cname over http', { secure: false, cname: 'video.example.com' }, 'http://video.example.com/demo'],
    ['no cname over https', { cname: 'video.example.com' }, 'https://res.cloudinary.com/demo'],
    ['a private CDN over http', { secure: false, private_cdn: true }, 'http://demo-res.cloudinary.com'],
    ['cdn_subdomain (no effect, as v4)', { secure: false, cdn_subdomain: true }, 'http://res.cloudinary.com/demo'],
    ['secure_cdn_subdomain (no effect, as v4)', { private_cdn: true, secure_cdn_subdomain: true }, 'https://demo-res.cloudinary.com'],
  ])('%s', (_name, config, expected) => {
    expect(prefix(config)).toBe(expected);
  });

  it('keeps a local cloud name path (url-gen development mode)', () => {
    expect(deliveryPrefix({ cloudName: '/local', secure: true })).toBe('/res/local');
  });
});
