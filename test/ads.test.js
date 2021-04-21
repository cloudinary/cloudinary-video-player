describe('Ads tests', () => {

  beforeEach(async () => {
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto('http://localhost:3000/vast-vpaid.html', { waitUntil: 'load' });
    await page.evaluate(() => {
      Object.defineProperty(HTMLMediaElement.prototype, 'playing', {
        get: function () {
          return !!(this.currentTime > 0 && !this.paused && !this.ended &&
              this.readyState > 2);
        }
      });
    });

    await page.evaluate(() => (window.ev = []));
    await page.evaluate(() => player.on('readyforpreroll', () => {
      window.ev.push('preroll');
    }));
    await page.evaluate(() => player.on('readyforpostroll', () => {
      window.ev.push('postroll');
    }));
  }, 10000);

  it('event test', async () => {
    jest.setTimeout(65000);
    await page.waitForSelector('#player_ima-ad-container', {visible: true});
    await page.waitFor(1000);
    const duration = await page.evaluate(() => player.duration());
    await page.waitFor(duration * 1000 + 1000);
    const events = await page.evaluate(() => window.ev);
    expect(events.includes('preroll')).toEqual(true);
    expect(events.includes('postroll')).toEqual(true);
  });

});
