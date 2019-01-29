describe('basic player tests', () => {
  beforeEach(async () => {
    await page.setViewport({ width: 1280, height: 1300 });
    await page.goto('http://localhost:3000/', { waitUntil: 'load' });
    await page.evaluate(() => {
      Object.defineProperty(HTMLMediaElement.prototype, 'playing', {
        get: function() {
          return !!(this.currentTime > 0 && !this.paused && !this.ended && this.readyState > 2);
        }
      });
    });
  }, 10000);

  it('video player should load', async () => {
    await expect(page).toMatchElement('#example-player_html5_api');
  });
  it('Video should play', async () => {
    jest.setTimeout(35000);
    await page.waitForSelector('.vjs-big-play-button');
    await page.click('#example-player > button.vjs-big-play-button');
    await page.waitFor(1000);
    let playing = await page.$eval('#example-player video', el => el.playing);
    await expect(playing).toBe(true);
  });
  it('test cloudinery icon', async () => {
    jest.setTimeout(35000);
    await page.waitForSelector('.vjs-big-play-button');
    await page.click('#example-player > button.vjs-big-play-button');
    await page.waitFor(1000);
    await expect(page).toClick('button.vjs-cloudinary-button');
    await expect(page.$eval('.vjs-cloudinary-tooltip', (tt) => tt.style.display !== 'none'));
    await page.waitFor(1000);
  });
  it('Pause button test', async () => {
    jest.setTimeout(35000);
    await page.waitForSelector('.vjs-big-play-button');
    await page.click('#example-player > button.vjs-big-play-button');
    await page.waitFor(500);
    let playing = await page.$eval('#example-player video', el => el.playing);
    await expect(playing).toBe(true);
    await page.click('#example-player > .vjs-control-bar > button.vjs-play-control.vjs-control');
    await page.waitFor(500);
    playing = await page.$eval('#example-player video', el => el.playing);
    await expect(playing).toBe(false);
  });
  it('Test mute', async () => {
    await page.waitForSelector('.vjs-big-play-button');
    await page.click('#example-player > button.vjs-big-play-button');
    await page.waitFor(500);
    expect(await page.$eval('#example-player video', v => v.muted)).toBe(true);
    await page.click('#example-player > .vjs-control-bar > .vjs-volume-panel.vjs-control.vjs-volume-panel-horizontal > button');
    expect(await page.$eval('#example-player video', v => v.muted)).toBe(false);
  });
  it('Test video time', async () => {
    await page.waitForSelector('.vjs-big-play-button');
    await page.click('#example-player > button.vjs-big-play-button');
    await page.waitFor(2000);
    let time = await page.$eval('#example-player > .vjs-control-bar > .vjs-current-time.vjs-time-control.vjs-control > .vjs-current-time-display', vt => Number(vt.textContent.replace(':', '')));
    await page.waitFor(2000);
    expect(await page.$eval('#example-player > .vjs-control-bar > .vjs-current-time.vjs-time-control.vjs-control > .vjs-current-time-display', vt => Number(vt.textContent.replace(':', '')))).toBeGreaterThan(time);
  });
});