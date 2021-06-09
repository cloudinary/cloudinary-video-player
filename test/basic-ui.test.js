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
    await expect(await page.$eval('video', v => v.id)).toMatch('player_html5_api');
  });

  it('Video should play', async () => {
    jest.setTimeout(35000);
    await page.waitForSelector('.vjs-big-play-button');
    await page.click('#player > button.vjs-big-play-button');
    await page.waitFor(1000);
    const playing = await page.$eval('#player video', el => el.playing);
    await expect(playing).toBe(true);
  });

  it('Pause button test', async () => {
    jest.setTimeout(35000);
    await page.waitForSelector('.vjs-big-play-button');
    await page.click('#player > button.vjs-big-play-button');
    await page.waitForFunction('player.videojs.readyState() === 4');
    await page.waitFor(1000);
    const playing1 = await page.$eval('#player video', el => el.playing);
    await expect(playing1).toBe(true);
    await page.click('#player > .vjs-control-bar > button.vjs-play-control.vjs-control');
    await page.waitFor(500);
    const playing2 = await page.$eval('#player video', el => el.playing);
    await expect(playing2).toBe(false);
  });

  it('Test mute', async () => {
    await page.waitForSelector('.vjs-big-play-button');
    await page.click('#player > button.vjs-big-play-button');
    await page.waitFor(500);
    expect(await page.$eval('#player video', v => v.muted)).toBe(true);
    await page.click('#player > .vjs-control-bar > .vjs-volume-panel.vjs-control.vjs-volume-panel-horizontal > button');
    expect(await page.$eval('#player video', v => v.muted)).toBe(false);
  });

  it('Test video time', async () => {
    await page.waitForSelector('.vjs-big-play-button');
    await page.click('#player > button.vjs-big-play-button');
    await page.waitFor(2000);
    const time = await page.$eval('#player > .vjs-control-bar > .vjs-current-time.vjs-time-control.vjs-control > .vjs-current-time-display', vt => Number(vt.textContent.replace(':', '')));
    await page.waitFor(2000);
    expect(await page.$eval('#player > .vjs-control-bar > .vjs-current-time.vjs-time-control.vjs-control > .vjs-current-time-display', vt => Number(vt.textContent.replace(':', '')))).toBeGreaterThan(time);
  });
});
