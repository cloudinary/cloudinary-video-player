import { getVideoElement, preparePlayerPlaceholder } from '../../src/utils/lazy-player';

describe('lazy-placeholder', () => {
  describe('getVideoElement', () => {
    beforeEach(() => {
      document.body.innerHTML = '<video id="test-video"></video>';
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('resolves element by id', () => {
      const el = getVideoElement('test-video');
      expect(el.tagName).toBe('VIDEO');
      expect(el.id).toBe('test-video');
    });

    it('strips # prefix from id', () => {
      const el = getVideoElement('#test-video');
      expect(el.id).toBe('test-video');
    });

    it('returns element when passed directly', () => {
      const video = document.getElementById('test-video');
      const el = getVideoElement(video);
      expect(el).toBe(video);
    });

    it('throws when element not found', () => {
      expect(() => getVideoElement('nonexistent')).toThrow('Could not find element');
    });

    it('throws when element is not a video tag', () => {
      document.body.innerHTML = '<div id="not-video"></div>';
      expect(() => getVideoElement('not-video')).toThrow('Element is not a video tag');
    });
  });

  describe('preparePlayerPlaceholder', () => {
    beforeEach(() => {
      document.body.innerHTML = '<div><video id="vid" width="400" height="300"></video></div>';
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('sets native poster and turns off controls', () => {
      const video = document.getElementById('vid');
      video.src = 'https://example.com/x.mp4';
      video.controls = true;
      const result = preparePlayerPlaceholder(video, 'https://example.com/poster.jpg', {});

      expect(result.videoElement).toBe(video);
      expect(video.poster).toBe('https://example.com/poster.jpg');
      expect(video.preload).toBe('none');
      expect(video.src).toContain('https://example.com/x.mp4');
      expect(video.controls).toBe(false);
    });

    it('adds cld-fluid when fluid is not false', () => {
      const video = document.getElementById('vid');
      preparePlayerPlaceholder(video, 'https://example.com/p.jpg', { fluid: true });
      expect(video.classList.contains('cld-fluid')).toBe(true);
    });
  });
});
