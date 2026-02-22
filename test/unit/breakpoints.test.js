import VideoSource from '../../src/plugins/cloudinary/models/video-source/video-source.js';
import { RENDITIONS } from '../../src/plugins/cloudinary/models/video-source/video-source.const.js';
import { getEffectiveDpr } from '../../src/plugins/cloudinary/index.js';

const cld = { cloud_name: 'demo' };
const PUBLIC_ID = 'sea_turtle';

function widthFromRequired(requiredWidth) {
  return RENDITIONS.find(r => r >= requiredWidth) ?? RENDITIONS[RENDITIONS.length - 1];
}

describe('Breakpoints - Unit Tests', () => {
  it('should not apply breakpoints when disabled (default)', () => {
    const source = new VideoSource('sea_turtle', {
      cloudinaryConfig: cld
    });

    const srcs = source.generateSources();
    expect(srcs[0].src).not.toContain('c_limit');
  });

  it('should apply breakpoints when enabled with width only (no dpr in transformation)', () => {
    const source = new VideoSource('sea_turtle', {
      cloudinaryConfig: cld,
      breakpointTransformation: {
        width: 640,
        crop: 'limit'
      }
    });

    const srcs = source.generateSources();

    expect(srcs[0].src).toContain('w_640');
    expect(srcs[0].src).toContain('c_limit');
  });

  it('should skip breakpoints for raw URLs', () => {
    const url = 'https://example.com/test.mp4';
    const source = new VideoSource(url, {
      cloudinaryConfig: cld,
      breakpointTransformation: {
        width: 640,
        crop: 'limit'
      }
    });

    const srcs = source.generateSources();
    expect(srcs[0].src).toEqual(url);
  });

  it('should not apply breakpoints when breakpointTransformation is null', () => {
    const source = new VideoSource('sea_turtle', {
      cloudinaryConfig: cld,
      breakpointTransformation: null
    });
    expect(source.generateSources()[0].src).not.toContain('c_limit');
  });

  it('dpr should not appear in the URL even when passed as a player option', () => {
    // Simulates the state after buildSource strips dpr from options before creating VideoSource.
    // If dpr were still present in options it would leak through resourceConfig() into the URL as dpr_X.
    const source = new VideoSource('sea_turtle', {
      cloudinaryConfig: cld,
      breakpointTransformation: { width: 1280, crop: 'limit' }
      // dpr intentionally absent — buildSource deletes it before reaching here
    });

    const url = source.generateSources()[0].src;
    expect(url).not.toContain('dpr_');
    expect(url).toContain('w_1280');
    expect(url).toContain('c_limit');
  });

  it('dpr leaks into URL when NOT stripped (documents the bug that was fixed)', () => {
    // This test documents what would happen WITHOUT the fix — dpr passed directly
    // into VideoSource options leaks through resourceConfig() into the Cloudinary URL.
    const source = new VideoSource('sea_turtle', {
      cloudinaryConfig: cld,
      dpr: 2,
      breakpointTransformation: { width: 1280, crop: 'limit' }
    });

    const url = source.generateSources()[0].src;
    expect(url).toContain('dpr_');
  });
});

describe('Breakpoints - getEffectiveDpr', () => {
  it('dpr 1 → width based on playerWidth * 1', () => {
    const effectiveDpr = getEffectiveDpr(1, 1);
    const width = widthFromRequired(500 * effectiveDpr);
    expect(effectiveDpr).toBe(1);
    expect(width).toBe(widthFromRequired(500));
  });

  it('dpr 1.5 → width based on playerWidth * 1.5', () => {
    const effectiveDpr = getEffectiveDpr(1.5, 1.5);
    const width = widthFromRequired(500 * effectiveDpr);
    expect(effectiveDpr).toBe(1.5);
    expect(width).toBe(widthFromRequired(750));
  });

  it('dpr 2 (default) → width based on playerWidth * 2', () => {
    const effectiveDpr = getEffectiveDpr(2, 2);
    const width = widthFromRequired(500 * effectiveDpr);
    expect(effectiveDpr).toBe(2);
    expect(width).toBe(widthFromRequired(1000));
  });

  it('user passes dpr 3 but device is 1 → effective is 1 (capped)', () => {
    expect(getEffectiveDpr(3, 1)).toBe(1);
  });

  it('user passes dpr 3 but device is 2 → effective is 2 (capped to max)', () => {
    expect(getEffectiveDpr(3, 2)).toBe(2);
  });

  it('user passes dpr 1.5 but device is 1 → effective is 1 (device is lower)', () => {
    expect(getEffectiveDpr(1.5, 1)).toBe(1);
  });
});
