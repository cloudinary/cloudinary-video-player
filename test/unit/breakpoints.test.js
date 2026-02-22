import VideoSource from '../../src/plugins/cloudinary/models/video-source/video-source.js';
import { RENDITIONS } from '../../src/plugins/cloudinary/models/video-source/video-source.const.js';

const cld = { cloud_name: 'demo' };
const PUBLIC_ID = 'sea_turtle';

function widthFromRequired(requiredWidth) {
  return RENDITIONS.find(r => r >= requiredWidth) ?? RENDITIONS[RENDITIONS.length - 1];
}

describe('Breakpoints - Smoke Tests', () => {
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

// Temp: Behavior Examples table – compute width from playerWidth, deviceDpr, maxDpr and show result URL.
const BEHAVIOR_TABLE = [
  { playerWidth: 300, deviceDpr: 2, maxDpr: 2, requiredWidth: 600, selected: 640 },
  { playerWidth: 360, deviceDpr: 2, maxDpr: 2, requiredWidth: 720, selected: 848 },
  { playerWidth: 500, deviceDpr: 1, maxDpr: 2, requiredWidth: 500, selected: 640 },
  { playerWidth: 1000, deviceDpr: 2, maxDpr: 2, requiredWidth: 2000, selected: 2560 },
  { playerWidth: 2000, deviceDpr: 2, maxDpr: 2, requiredWidth: 4000, selected: 3840 }
];
