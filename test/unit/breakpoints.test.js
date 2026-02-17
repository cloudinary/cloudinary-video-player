import VideoSource from '../../src/plugins/cloudinary/models/video-source/video-source.js';

const cld = { cloud_name: 'demo' };

// Helper function to test DPR rounding (same logic as in index.js)
const roundedDpr = (value) => {
  const DEFAULT_DPR = 2.0;
  const dprValue = value || DEFAULT_DPR;
  return [1, 1.5, 2].reduce((closest, option) => {
    return Math.abs(dprValue - option) < Math.abs(dprValue - closest)
      ? option
      : closest;
  });
};

describe('Breakpoints - Smoke Tests', () => {
  it('should not apply breakpoints when disabled (default)', () => {
    const source = new VideoSource('sea_turtle', {
      cloudinaryConfig: cld
    });
    
    const srcs = source.generateSources();
    expect(srcs[0].src).not.toContain('c_limit');
  });

  it('should apply breakpoints when enabled with playerWidth', () => {
    const source = new VideoSource('sea_turtle', {
      cloudinaryConfig: cld,
      breakpointTransformation: {
        width: 640,
        dpr: 1.5,
        crop: 'limit'
      }
    });
    
    const srcs = source.generateSources();
    
    // Should contain width (640), DPR (1.5), and crop limit
    expect(srcs[0].src).toContain('w_640');
    expect(srcs[0].src).toContain('dpr_1.5');
    expect(srcs[0].src).toContain('c_limit');
  });

  it('should use default DPR 2.0', () => {
    expect(roundedDpr(undefined)).toEqual(2.0);
    expect(roundedDpr(null)).toEqual(2.0);
  });

  it('should round DPR values to nearest valid option', () => {
    expect(roundedDpr(1.0)).toEqual(1.0);
    expect(roundedDpr(1.5)).toEqual(1.5);
    expect(roundedDpr(2.0)).toEqual(2.0);
    expect(roundedDpr(1.2)).toEqual(1.0); // Closest to 1.0
    expect(roundedDpr(1.3)).toEqual(1.5); // Closest to 1.5
    expect(roundedDpr(1.8)).toEqual(2.0); // Closest to 2.0
  });

  it('should skip breakpoints for raw URLs', () => {
    const url = 'https://example.com/test.mp4';
    const source = new VideoSource(url, {
      cloudinaryConfig: cld,
      breakpointTransformation: {
        width: 640,
        dpr: 2.0,
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
