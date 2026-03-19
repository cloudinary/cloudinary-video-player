import { getElementForSchedule, renderScheduleImage } from '../../src/utils/schedule';

describe('schedule-bootstrap', () => {
  describe('getElementForSchedule', () => {
    beforeEach(() => {
      document.body.innerHTML = '<video id="test-video"></video>';
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('resolves element by id', () => {
      const el = getElementForSchedule('test-video');
      expect(el.tagName).toBe('VIDEO');
      expect(el.id).toBe('test-video');
    });

    it('strips # prefix from id', () => {
      const el = getElementForSchedule('#test-video');
      expect(el.id).toBe('test-video');
    });

    it('returns element when passed directly', () => {
      const video = document.getElementById('test-video');
      const el = getElementForSchedule(video);
      expect(el).toBe(video);
    });

    it('throws when element not found', () => {
      expect(() => getElementForSchedule('nonexistent')).toThrow('Could not find element');
    });

    it('throws when element is not a video tag', () => {
      document.body.innerHTML = '<div id="not-video"></div>';
      expect(() => getElementForSchedule('not-video')).toThrow('Element is not a video tag');
    });
  });

  describe('renderScheduleImage', () => {
    beforeEach(() => {
      document.body.innerHTML = '<div><video id="vid" width="400" height="300"></video></div>';
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('hides video and inserts poster image', () => {
      const video = document.getElementById('vid');
      const result = renderScheduleImage(video, 'https://example.com/poster.jpg', {});

      expect(video.style.display).toBe('none');
      expect(result.img.src).toBe('https://example.com/poster.jpg');
      expect(result.container).toBeTruthy();
      expect(result.videoElement).toBe(video);
    });

    it('returns refs for load() to use', () => {
      const video = document.getElementById('vid');
      const result = renderScheduleImage(video, 'https://example.com/poster.jpg', {});

      expect(result.img).toBeInstanceOf(HTMLImageElement);
      expect(result.container).toBeInstanceOf(HTMLElement);
      expect(result.videoElement).toBe(video);
    });
  });
});
