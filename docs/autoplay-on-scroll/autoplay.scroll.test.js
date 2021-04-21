const url = 'http://localhost:3000/autoplay-on-scroll/autoplay-on-scroll.html';

describe('Auto-play tests', () => {

  beforeEach(async () => {
    await page.setViewport({width: 1280, height: 800});
    await page.goto(url, {waitUntil: 'load'});
    await page.evaluate(() => {
      Object.defineProperty(HTMLMediaElement.prototype, 'playing', {
        get: function() {
          return !!(this.currentTime > 0 && !this.paused && !this.ended &&
              this.readyState > 2);
        }
      });
    });
  }, 10000);

  it('Test scroll', async () => {
    const player = await page.$('#player_html5_api');
    expect(await player.isIntersectingViewport()).toEqual(false);
    await player.tap();
    await page.waitFor(1000);
    expect(await page.$eval('#player_html5_api', p => p.playing)).toEqual(true);
  });
});
