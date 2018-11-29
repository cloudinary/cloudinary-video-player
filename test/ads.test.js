describe('Ads tests', () => {
  beforeEach(async () => {
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto('http://localhost:3000/vast-vpaid.html', { waitUntil: 'load' });
    await page.evaluate(() => {
      Object.defineProperty(HTMLMediaElement.prototype, 'playing', {
        get: function() {
          return !!(this.currentTime > 0 && !this.paused && !this.ended &&
              this.readyState > 2);
        }
      });
    });
    await page.evaluate(() => player.on('readyforpreroll', () => {
      window.ev = [];
      window.ev.push('preroll');
    }));
  }, 10000);
  it('Preroll test', async () => {
    await page.waitFor(3000);
    expect(await page.evaluate(() => window.ev.length)).toEqual(1);
  });

});
