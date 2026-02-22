import VideoSource from '../../src/plugins/cloudinary/models/video-source/video-source.js';
import { RENDITIONS } from '../../src/plugins/cloudinary/models/video-source/video-source.const.js';

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
});
