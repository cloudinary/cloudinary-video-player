import { buildPosterUrl } from '../../src/utils/poster-url';

describe('buildPosterUrl', () => {
  it('builds correct Cloudinary poster URL for cloudName and publicId', () => {
    const url = buildPosterUrl('demo', 'sample_video');
    expect(url).toContain('res.cloudinary.com');
    expect(url).toContain('demo');
    expect(url).toContain('sample_video');
    expect(url).toContain('/video/upload/');
    expect(url).toContain('so_0');
    expect(url).toContain('f_auto');
    expect(url).toContain('q_auto');
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
