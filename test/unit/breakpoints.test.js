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
      transformation: { width: 640, crop: 'limit' }
    });

    const srcs = source.generateSources();

    expect(srcs[0].src).toContain('w_640');
    expect(srcs[0].src).toContain('c_limit');
  });

  it('should skip breakpoints for raw URLs', () => {
    const url = 'https://example.com/test.mp4';
    const source = new VideoSource(url, {
      cloudinaryConfig: cld,
      transformation: { width: 640, crop: 'limit' }
    });

    const srcs = source.generateSources();
    expect(srcs[0].src).toEqual(url);
  });

  it('should not apply breakpoints when transformation has no breakpoint params', () => {
    const source = new VideoSource('sea_turtle', {
      cloudinaryConfig: cld,
      transformation: {}
    });
    expect(source.generateSources()[0].src).not.toContain('c_limit');
  });

  it('should not add crop: limit when transformation already has crop (crop-mode set)', () => {
    const source = new VideoSource('sea_turtle', {
      cloudinaryConfig: cld,
      transformation: { width: 640, crop: 'fill' }
    });

    const srcs = source.generateSources();
    expect(srcs[0].src).toContain('w_640');
    expect(srcs[0].src).toContain('c_fill');
    expect(srcs[0].src).not.toContain('c_limit');
  });

  it('maxDpr should not appear in the URL — SDK does not recognize it as a transformation param', () => {
    // maxDpr is an internal hint for rendition selection only.
    // Unlike the old 'dpr' name, the SDK does not recognize 'maxDpr' so it never leaks into the URL.
    const source = new VideoSource('sea_turtle', {
      cloudinaryConfig: cld,
      maxDpr: 2,
      transformation: { width: 1280, crop: 'limit' }
    });

    const url = source.generateSources()[0].src;
    expect(url).not.toContain('dpr_');
    expect(url).not.toContain('maxDpr');
    expect(url).toContain('w_1280');
    expect(url).toContain('c_limit');
  });
});

describe('Breakpoints - getEffectiveDpr', () => {
  const originalDevicePixelRatio = Object.getOwnPropertyDescriptor(window, 'devicePixelRatio');

  afterEach(() => {
    if (originalDevicePixelRatio) {
      Object.defineProperty(window, 'devicePixelRatio', originalDevicePixelRatio);
    }
  });

  it('dpr 1 → width based on playerWidth * 1', () => {
    Object.defineProperty(window, 'devicePixelRatio', { value: 1, configurable: true });
    const effectiveDpr = getEffectiveDpr(1);
    const width = widthFromRequired(500 * effectiveDpr);
    expect(effectiveDpr).toBe(1);
    expect(width).toBe(widthFromRequired(500));
  });

  it('dpr 1.5 → width based on playerWidth * 1.5', () => {
    Object.defineProperty(window, 'devicePixelRatio', { value: 1.5, configurable: true });
    const effectiveDpr = getEffectiveDpr(1.5);
    const width = widthFromRequired(500 * effectiveDpr);
    expect(effectiveDpr).toBe(1.5);
    expect(width).toBe(widthFromRequired(750));
  });

  it('dpr 2 (default) → width based on playerWidth * 2', () => {
    Object.defineProperty(window, 'devicePixelRatio', { value: 2, configurable: true });
    const effectiveDpr = getEffectiveDpr(2);
    const width = widthFromRequired(500 * effectiveDpr);
    expect(effectiveDpr).toBe(2);
    expect(width).toBe(widthFromRequired(1000));
  });

  it('user passes maxDpr 3 but device is 1 → effective is 1 (capped)', () => {
    Object.defineProperty(window, 'devicePixelRatio', { value: 1, configurable: true });
    expect(getEffectiveDpr(3)).toBe(1);
  });

  it('user passes maxDpr 3 but device is 2 → effective is 2 (capped to max)', () => {
    Object.defineProperty(window, 'devicePixelRatio', { value: 2, configurable: true });
    expect(getEffectiveDpr(3)).toBe(2);
  });

  it('user passes maxDpr 1.5 but device is 1 → effective is 1 (device is lower)', () => {
    Object.defineProperty(window, 'devicePixelRatio', { value: 1, configurable: true });
    expect(getEffectiveDpr(1.5)).toBe(1);
  });
});
