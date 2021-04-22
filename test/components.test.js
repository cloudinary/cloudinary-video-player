describe('Components tests', () => {

  beforeEach(async () => {
    await page.setViewport({width: 1280, height: 800});
    await page.goto('http://localhost:3000/components.html', {waitUntil: 'load'});
    await page.evaluate(() => {
      Object.defineProperty(HTMLMediaElement.prototype, 'playing', {
        get: function() {
          return !!(this.currentTime > 0 && !this.paused && !this.ended &&
              this.readyState > 2);
        }
      });
    });
  }, 10000);

  it('Test components', async () => {
    page.waitFor(1000);
    expect(await page.$eval('.vjs-playlist-control.vjs-playlist-next-control', (b => b.tagName))).toEqual('BUTTON');
    expect(await page.$eval('.vjs-playlist-control.vjs-playlist-previous-control', (b => b.tagName))).toEqual('BUTTON');
  });
});
