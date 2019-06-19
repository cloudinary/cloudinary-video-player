describe('Recommendations tests', () => {
  beforeEach(async () => {
    await page.setViewport({width: 1280, height: 1800});
    await page.goto('http://localhost:3000/recommendations.html', {waitUntil: 'load'});
    jest.setTimeout(10000);
    await page.evaluate(() => {
      Object.defineProperty(HTMLMediaElement.prototype, 'playing', {
        get: function() {
          return !!(this.currentTime > 0 && !this.paused && !this.ended &&
              this.readyState > 2);
        }
      });
    });
  }, 10000);
  it('Test recommendations visibility', async () => {
    await page.waitFor(1000);
    let duration = Math.floor(await page.evaluate(() => player.duration()));
    await page.waitFor(1000);
    expect(await page.$eval('.vjs-recommendations-overlay', (o => o.style.visibility))).toEqual('hidden');
    await page.evaluate((dur) => player.currentTime(dur), duration - 1);
    await page.waitForSelector('.vjs-recommendations-overlay', {visible: true});
    expect(await page.$eval('.vjs-recommendations-overlay', (o => o.style.visibility))).toEqual('visible');
  });
  it('Test recommendations click', async () => {
    await page.waitFor(1000);
    let duration = Math.floor(await page.evaluate(() => player.duration()));
    let currentSrcUrl = await page.evaluate(() => player.currentSourceUrl());
    await page.waitFor(1000);
    await page.evaluate((dur) => player.currentTime(dur), duration - 1);
    await page.waitFor('.vjs-recommendations-overlay', {visible: true});
    await page.click('#player > div.vjs-recommendations-overlay > div > div > .vjs-recommendations-overlay-item.vjs-recommendations-overlay-item-primary > .vjs-recommendations-overlay-item-primary-image');
    await page.waitForFunction('player.videojs.readyState() === 4');
    await page.waitFor(1000);
    let recSourceUrl = await page.evaluate(() => player.currentSourceUrl());
    expect(currentSrcUrl).not.toEqual(recSourceUrl);
    expect(await page.$eval('#player_html5_api', el => el.playing)).toBe(true);
  });
});
