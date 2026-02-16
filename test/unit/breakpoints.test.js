import VideoSource from '../../src/plugins/cloudinary/models/video-source/video-source.js';
import { normalizeDpr } from '../../src/plugins/cloudinary/models/video-source/video-source.breakpoints.js';

const cld = { cloud_name: 'demo' };

describe('Breakpoints - Smoke Tests', () => {
  it('should not apply breakpoints when disabled (default)', () => {
    const source = new VideoSource('sea_turtle', {
      cloudinaryConfig: cld
    });
    
    const srcs = source.generateSources();
    expect(srcs[0].src).not.toContain('c_limit');
  });

  it('should apply breakpoints when enabled with playerElement', () => {
    const parent = document.createElement('div');
    // Mock clientWidth since element isn't rendered in test
    Object.defineProperty(parent, 'clientWidth', {
      configurable: true,
      value: 500
    });
    
    const player = document.createElement('video');
    Object.defineProperty(player, 'parentElement', {
      configurable: true,
      value: parent
    });
    
    const source = new VideoSource('sea_turtle', {
      cloudinaryConfig: cld,
      breakpoints: true,
      dpr: 1.0
    });
    
    const srcs = source.generateSources(player);
    expect(srcs[0].src).toContain('c_limit');
  });

  it('should use default DPR 2.0', () => {
    const source = new VideoSource('sea_turtle', {
      cloudinaryConfig: cld,
      breakpoints: true
    });
    
    expect(source.dpr()).toEqual(2.0);
  });

  it('should normalize DPR values correctly', () => {
    expect(normalizeDpr(1.0)).toEqual(1.0);
    expect(normalizeDpr(1.5)).toEqual(1.5);
    expect(normalizeDpr(2.0)).toEqual(2.0);
    expect(normalizeDpr(3.0)).toEqual(2.0); // Cap at 2.0
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
});
