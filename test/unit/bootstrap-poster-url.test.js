import { getPosterUrl } from '../../src/utils/bootstrap-poster-url';

describe('bootstrap-poster-url', () => {
  it('returns poster string when set', async () => {
    expect(await getPosterUrl({ poster: 'https://example.com/p.jpg' })).toBe(
      'https://example.com/p.jpg'
    );
  });

  it('builds URL from cloudName and publicId', async () => {
    const url = await getPosterUrl({
      cloudName: 'demo',
      publicId: 'dog'
    });
    expect(url).toContain('demo');
    expect(url).toContain('dog');
    expect(url).toContain('video/upload');
  });

  it('throws when no poster or ids', async () => {
    await expect(getPosterUrl({ cloudName: 'demo' })).rejects.toThrow(
      'lazy requires a poster URL or cloudName and publicId'
    );
  });
});
