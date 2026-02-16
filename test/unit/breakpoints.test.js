import VideoSource from '../../src/plugins/cloudinary/models/video-source/video-source.js';
import { validateDpr } from '../../src/plugins/cloudinary/models/video-source/video-source.breakpoints.js';

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
    const player = document.createElement('video');
    player.className = 'cld-video-player';
    // Mock clientWidth since element isn't rendered in test
    Object.defineProperty(player, 'clientWidth', {
      configurable: true,
      value: 500
    });
    
    // Add player to DOM so document.querySelector can find it
    document.body.appendChild(player);
    
    const source = new VideoSource('sea_turtle', {
      cloudinaryConfig: cld,
      breakpoints: true,
      dpr: 1.5
    });
    
    const srcs = source.generateSources();
    
    // Clean up
    document.body.removeChild(player);
    
    // Should contain width (500), DPR (1.5), and crop limit
    expect(srcs[0].src).toContain('w_500');
    expect(srcs[0].src).toContain('dpr_1.5');
    expect(srcs[0].src).toContain('c_limit');
  });

  it('should use default DPR 2.0', () => {
    const source = new VideoSource('sea_turtle', {
      cloudinaryConfig: cld,
      breakpoints: true
    });
    
    expect(source.dpr()).toEqual(2.0);
  });

  it('should validate DPR values correctly', () => {
    expect(validateDpr(1.0)).toEqual(1.0);
    expect(validateDpr(1.5)).toEqual(1.5);
    expect(validateDpr(2.0)).toEqual(2.0);
    expect(validateDpr(3.0)).toEqual(2.0); // Cap at 2.0
    expect(validateDpr(undefined)).toEqual(2.0); // Default
    expect(validateDpr(0.5)).toEqual(2.0); // Invalid, use default
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
