describe('Fluid tests', () => {

  beforeEach(async () => {
    await page.setViewport({width: 1280, height: 800});
    await page.goto('http://localhost:3000/fluid.html', {waitUntil: 'load'});
    await page.evaluate(() => {
      Object.defineProperty(HTMLMediaElement.prototype, 'playing', {
        get: function() {
          return !!(this.currentTime > 0 && !this.paused && !this.ended &&
              this.readyState > 2);
        }
      });
    });
  }, 10000);

  it('Test fluid change', async () => {
    await page.waitFor(1000);
    const origWidth = await page.$eval('#player_html5_api', p => p.clientWidth);
    await page.setViewport({ width: 800, height: 800 });
    await page.waitFor(1000);
    const currWidth = await page.$eval('#player_html5_api', p => p.clientWidth);
    expect(origWidth).toBeGreaterThan(currWidth);
  });

  it('Test no fluid change', async () => {
    await page.waitFor(1000);
    await page.click('#toggle-fluid');
    await page.waitFor(500);
    const origWidth = await page.$eval('#player_html5_api', p => p.clientWidth);
    await page.setViewport({ width: 800, height: 800 });
    await page.waitFor(1000);
    const currWidth = await page.$eval('#player_html5_api', p => p.clientWidth);
    expect(origWidth).toEqual(currWidth);
  });

});
