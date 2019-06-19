describe('basic player tests', () => {
  beforeAll(async () => {
    jest.setTimeout(35000);
    await page.setViewport({width: 1280, height: 800});
    await page.goto('http://localhost:3000/', {waitUntil: 'load'});
    await page.evaluate(() => {
      Object.defineProperty(HTMLMediaElement.prototype, 'playing', {
        get: function() {
          return !!(this.currentTime > 0 && !this.paused && !this.ended &&
              this.readyState > 2);
        }
      });
    });
  }, 10000);
  it('Test title bar title', async () => {
    let ds = JSON.parse(await page.$eval('#player', v => v.getAttribute('data-cld-source')));
    let titlebarTitle = await page.$eval('#player > .vjs-title-bar > .vjs-title-bar-title', t => t.textContent);
    await expect(ds.info.title).toEqual(titlebarTitle);
  });
  it('Test title bar subtitle', async () => {
    let ds = JSON.parse(await page.$eval('#player', v => v.getAttribute('data-cld-source')));
    let sub = await page.$eval('#player > .vjs-title-bar > .vjs-title-bar-subtitle', t => t.textContent);
    await expect(ds.info.subtitle).toEqual(sub);
  });

});


