describe('Multi-player tests', () => {
  beforeEach(async () => {
    await page.setViewport({width: 1280, height: 800});
    await page.goto('http://localhost:3000/multiple-players.html', { waitUntil: 'load' });
    await page.evaluate(() => {
      Object.defineProperty(HTMLMediaElement.prototype, 'playing', {
        get: function() {
          return !!(this.currentTime > 0 && !this.paused && !this.ended &&
              this.readyState > 2);
        }
      });
    });
  }, 10000);
  it('Test play', async () => {
    page.waitFor(1500);
    const ids = ['#vjs_video_3_html5_api', '#vjs_video_626_html5_api', '#vjs_video_1140_html5_api'];
    for (const id of ids) {
      page.waitFor(1000);
      expect(await page.$eval(id, el => el.playing)).toBe(true);
    }
  });
});