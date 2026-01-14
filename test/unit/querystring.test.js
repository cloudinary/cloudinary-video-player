import { appendQueryParams } from '../../src/utils/querystring';

describe('appendQueryParams', () => {
  const baseUrl = 'https://example.com/video.mp4';

  it('appends params to URL', () => {
    expect(appendQueryParams(baseUrl, { foo: 'bar' })).toBe('https://example.com/video.mp4?foo=bar');
  });

  it('returns original URL when params is empty', () => {
    expect(appendQueryParams(baseUrl, {})).toBe(baseUrl);
    expect(appendQueryParams(baseUrl, null)).toBe(baseUrl);
  });

  it('filters out null/undefined values', () => {
    expect(appendQueryParams(baseUrl, { a: 1, b: null, c: undefined })).toBe('https://example.com/video.mp4?a=1');
  });
});
