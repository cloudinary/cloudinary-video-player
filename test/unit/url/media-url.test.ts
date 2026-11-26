import { describe, expect, it } from 'vitest';
import type { CloudConfig } from '../../../src/core/options/types.js';
import { isRawUrl, mediaUrl, queryParamsOf, withQuery } from '../../../src/core/url/media-url.js';

const cloud: CloudConfig = { cloudName: 'demo', secure: true };
const video = (publicId: string, extra: Partial<CloudConfig> = {}) =>
  ({ cloud: { ...cloud, ...extra }, publicId, resourceType: 'video', type: 'upload' });
const image = (publicId: string, extra: Partial<CloudConfig> = {}) => ({ ...video(publicId, extra), resourceType: 'image' });

describe('mediaUrl (v4 url-gen legacy URL)', () => {
  it('adds v1 to a public ID in a folder, and encodes it once', () => {
    expect(mediaUrl(video('folder/été vidéo'))).toBe('https://res.cloudinary.com/demo/video/upload/v1/folder/%C3%A9t%C3%A9%20vid%C3%A9o');
    expect(mediaUrl(video('folder/a%20b'))).toBe('https://res.cloudinary.com/demo/video/upload/v1/folder/a%20b');
    expect(mediaUrl(video('v123/folder/a'))).toBe('https://res.cloudinary.com/demo/video/upload/v123/folder/a');
  });

  it('puts the transformation before the version and the format after the public ID', () => {
    expect(mediaUrl(video('a/b'), { transformation: 'w_400', format: 'm3u8' })).toBe('https://res.cloudinary.com/demo/video/upload/w_400/v1/a/b.m3u8');
  });

  it('uses the short form with a URL suffix', () => {
    expect(mediaUrl(video('a'), { urlSuffix: 'my-video', format: 'mp4' })).toBe('https://res.cloudinary.com/demo/videos/a/my-video.mp4');
    expect(() => mediaUrl({ ...video('a'), type: 'private' }, { urlSuffix: 'x' })).toThrow('URL Suffix only supported');
    expect(() => mediaUrl(video('a'), { urlSuffix: 'a.b' })).toThrow('url_suffix should not include . or /');
  });

  it('uses the root path and the short form for image uploads only', () => {
    expect(mediaUrl(image('sample', { useRootPath: true }))).toBe('https://res.cloudinary.com/demo/sample');
    expect(mediaUrl(image('sample', { shorten: true }))).toBe('https://res.cloudinary.com/demo/iu/sample');
    expect(mediaUrl(video('a', { shorten: true }))).toBe('https://res.cloudinary.com/demo/video/upload/a');
    expect(() => mediaUrl(video('a', { useRootPath: true }))).toThrow('Root path only supported for image/upload');
  });
});

describe('query parameters (v4 appendQueryParams)', () => {
  it('appends encoded parameters and leaves out empty values', () => {
    const query = queryParamsOf({ _s: 'vp', token: 'a b&c', n: 1, none: undefined });

    expect(withQuery('https://res.cloudinary.com/demo/video/upload/a', query)).toBe('https://res.cloudinary.com/demo/video/upload/a?_s=vp&token=a+b%26c&n=1');
    expect(withQuery('https://example.com/a?x=1', {})).toBe('https://example.com/a?x=1');
  });
});

describe('isRawUrl', () => {
  it('is true only for an absolute http(s) URL', () => {
    expect(isRawUrl('https://example.com/a.mp4?x=1')).toBe(true);
    expect(isRawUrl('folder/https_video')).toBe(false);
  });
});
