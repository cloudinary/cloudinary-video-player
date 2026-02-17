import VideoSource from '../../src/plugins/cloudinary/models/video-source/video-source.js';
import { roundedDpr } from '../../src/plugins/cloudinary/models/video-source/video-source.breakpoints.js';

const cld = { cloud_name: 'demo' };

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
      breakpoints: true,
      dpr: 1.5,
      playerWidth: 500
    });
    
    const srcs = source.generateSources();
    
    // Should contain width (640 - rounded from 500), DPR (1.5), and crop limit
    expect(srcs[0].src).toContain('w_640');
    expect(srcs[0].src).toContain('dpr_1.5');
    expect(srcs[0].src).toContain('c_limit');
  });

  it('should use default DPR 2.0', () => {
    const source = new VideoSource('sea_turtle', {
      cloudinaryConfig: cld,
      breakpoints: true
    });
    
    expect(source._dpr).toEqual(2.0);
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
      breakpoints: true,
      dpr: 2.0
    });
    
    const srcs = source.generateSources();
    expect(srcs[0].src).toEqual(url);
  });

  it('should not apply breakpoints when playerWidth is invalid', () => {
    // Test with negative width
    const source1 = new VideoSource('sea_turtle', {
      cloudinaryConfig: cld,
      breakpoints: true,
      dpr: 1.5,
      playerWidth: -100
    });
    expect(source1.generateSources()[0].src).not.toContain('c_limit');

    // Test with zero width
    const source2 = new VideoSource('sea_turtle', {
      cloudinaryConfig: cld,
      breakpoints: true,
      dpr: 1.5,
      playerWidth: 0
    });
    expect(source2.generateSources()[0].src).not.toContain('c_limit');

    // Test with string width
    const source3 = new VideoSource('sea_turtle', {
      cloudinaryConfig: cld,
      breakpoints: true,
      dpr: 1.5,
      playerWidth: 'large'
    });
    expect(source3.generateSources()[0].src).not.toContain('c_limit');

    // Test with undefined width
    const source4 = new VideoSource('sea_turtle', {
      cloudinaryConfig: cld,
      breakpoints: true,
      dpr: 1.5,
      playerWidth: undefined
    });
    expect(source4.generateSources()[0].src).not.toContain('c_limit');
  });
});
