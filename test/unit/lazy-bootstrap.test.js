import { shouldUseLazyBootstrap, shouldLoadOnScroll, lazyBootstrap } from '../../src/utils/lazy-player';

describe('lazy-bootstrap', () => {
  describe('shouldUseLazyBootstrap', () => {
    it('is false when lazy missing or falsy', () => {
      expect(shouldUseLazyBootstrap({})).toBe(false);
      expect(shouldUseLazyBootstrap({ lazy: false })).toBe(false);
    });

    it('is true when lazy is true or object', () => {
      expect(shouldUseLazyBootstrap({ lazy: true })).toBe(true);
      expect(shouldUseLazyBootstrap({ lazy: {} })).toBe(true);
      expect(shouldUseLazyBootstrap({ lazy: { loadOnScroll: true } })).toBe(true);
    });
  });

  describe('shouldLoadOnScroll', () => {
    it('false for boolean true', () => {
      expect(shouldLoadOnScroll(true)).toBe(false);
    });

    it('true when loadOnScroll is true', () => {
      expect(shouldLoadOnScroll({ loadOnScroll: true })).toBe(true);
    });

    it('false for empty object', () => {
      expect(shouldLoadOnScroll({})).toBe(false);
    });
  });

  describe('lazyBootstrap DOM', () => {
    beforeEach(() => {
      document.body.innerHTML = '<div><video id="lazy-vid" width="400" height="300"></video></div>';
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('wraps video in overlay with big-play and sets poster', () => {
      const stub = lazyBootstrap('lazy-vid', {
        lazy: true,
        cloudName: 'demo',
        publicId: 'dog'
      });

      const video = document.getElementById('lazy-vid');
      expect(video.poster).toContain('dog');

      const overlay = document.querySelector('.cld-lazy-preactivate-overlay');
      expect(overlay).toBeTruthy();
      expect(overlay.classList.contains('cld-video-player')).toBe(true);
      expect(overlay.classList.contains('cld-video-player-skin-dark')).toBe(true);
      expect(overlay.contains(video)).toBe(true);
      const btn = overlay.querySelector('.vjs-big-play-button');
      expect(btn).toBeTruthy();
      expect(btn.querySelector('.vjs-icon-placeholder')).toBeTruthy();
      expect(stub.source()).toBe(stub);
      expect(typeof stub.loadPlayer).toBe('function');
    });

    it('uses light skin when video has skin-light class', () => {
      document.body.innerHTML = '<div><video id="lazy-vid" class="cld-video-player-skin-light" width="400"></video></div>';
      lazyBootstrap('lazy-vid', { lazy: true, cloudName: 'demo', publicId: 'dog' });
      const video = document.getElementById('lazy-vid');
      const overlay = document.querySelector('.cld-lazy-preactivate-overlay');
      expect(video.classList.contains('cld-video-player-skin-light')).toBe(true);
      expect(overlay.classList.contains('cld-video-player-skin-light')).toBe(true);
      expect(video.classList.contains('cld-video-player-skin-dark')).toBe(false);
    });

    it('applies colors option as CSS custom properties on overlay wrapper', () => {
      lazyBootstrap('lazy-vid', {
        lazy: true,
        cloudName: 'demo',
        publicId: 'dog',
        colors: { base: '#112233', accent: '#aabbcc', text: '#ffeedd' }
      });
      const overlay = document.querySelector('.cld-lazy-preactivate-overlay');
      expect(overlay.style.getPropertyValue('--color-base').trim()).toBe('#112233');
      expect(overlay.style.getPropertyValue('--color-accent').trim()).toBe('#aabbcc');
      expect(overlay.style.getPropertyValue('--color-text').trim()).toBe('#ffeedd');
    });
  });
});
