import { buildPosterUrl, getPosterUrl } from '../../src/utils/poster-url';

describe('buildPosterUrl', () => {
  it('builds correct Cloudinary poster URL for cloudName and publicId', () => {
    const url = buildPosterUrl('demo', 'sample_video');
    expect(url).toContain('res.cloudinary.com');
    expect(url).toContain('demo');
    expect(url).toContain('sample_video.jpg');
    expect(url).toContain('/video/upload/');
  });

  it('uses https by default', () => {
    const url = buildPosterUrl('demo', 'sample');
    expect(url).toMatch(/^https:\/\//);
  });

  it('accepts cloudinaryConfig for overrides', () => {
    const url = buildPosterUrl('demo', 'sample', { secure: true });
    expect(url).toContain('sample');
  });
});

describe('getPosterUrl', () => {
  it('returns poster string when set', () => {
    expect(getPosterUrl({ poster: 'https://example.com/p.jpg' })).toBe('https://example.com/p.jpg');
  });

  it('builds URL from cloudName and publicId', () => {
    const url = getPosterUrl({
      cloudName: 'demo',
      publicId: 'dog'
    });
    expect(url).toContain('demo');
    expect(url).toContain('dog');
    expect(url).toContain('video/upload');
  });

  it('throws when no poster or ids', () => {
    expect(() => getPosterUrl({ cloudName: 'demo' })).toThrow(
      'lazy requires a poster URL or cloudName and publicId'
    );
  });
});
