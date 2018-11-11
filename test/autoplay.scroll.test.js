describe('Playlist tests', () => {
  beforeEach(async () => {
    await page.setViewport({width: 1280, height: 800});
    await page.goto('http://localhost:3000/autoplay-on-scroll.html', {waitUntil: 'load'});
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
    expect(await page.$eval('#example-player_html5_api', p => p.playing)).toEqual(false);
    await page.tap('#example-player_html5_api');
    page.waitFor(1000);
    expect(await page.$eval('#example-player_html5_api', p => p.playing)).toEqual(true);
  });
});
