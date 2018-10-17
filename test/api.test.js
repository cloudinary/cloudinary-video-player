describe('API player tests', () => {
  beforeEach(async () => {
    await page.setViewport({width: 1280, height: 800});
    await page.goto('http://localhost:3000/api.html', {waitUntil: 'load'});
    await page.evaluate(() => {
      Object.defineProperty(HTMLMediaElement.prototype, 'playing', {
        get: function() {
          return !!(this.currentTime > 0 && !this.paused && !this.ended &&
              this.readyState > 2);
        }
      });
    });
  }, 10000);
  it('Test forward 10 seconds', async () => {
    await page.click('#example-player > div.vjs-control-bar > button.vjs-play-control.vjs-control');
    await page.waitFor(500);
    let time = await page.$eval('#example-player > div.vjs-control-bar > div.vjs-current-time.vjs-time-control.vjs-control > div.vjs-current-time-display', vt => Number(vt.textContent.replace('0:', '')));
    await page.click('#vid-seek-plus');
    await page.waitFor(500);
    let newtime = await page.$eval('#example-player > div.vjs-control-bar > div.vjs-current-time.vjs-time-control.vjs-control > div.vjs-current-time-display', vt => Number(vt.textContent.replace('0:', '')));
    expect(newtime).toEqual(time + 10);
  });
  it('Test back 10 seconds', async () => {
    await page.click('#example-player > div.vjs-control-bar > button.vjs-play-control.vjs-control');
    await page.waitFor(500);
    await page.click('#vid-seek-plus');
    await page.waitFor(500);
    await page.click('#vid-seek-minus');
    await page.waitFor(500);
    let newtime = await page.$eval('#example-player > div.vjs-control-bar > div.vjs-current-time.vjs-time-control.vjs-control > div.vjs-current-time-display', vt => Number(vt.textContent.replace('0:', '')));
    expect(newtime).toEqual(0);
  });
  it('Test mute un-mute', async () => {
    await page.waitFor(500);
    await page.click('#vid-mute');
    await page.waitFor(500);
    expect(await page.$eval('#example-player_html5_api', v => v.muted)).toBe(true);
    await page.click('#vid-unmute');
    await page.waitFor(500);
    expect(await page.$eval('#example-player_html5_api', v => v.muted)).toBe(false);
  });
  it('Test volume down', async () => {
    await page.waitFor(500);
    let currentVol = await page.$$eval('#example-player_html5_api', v => v.volume);
    await page.click('#vid-volume-minus');
    await page.waitFor(500);
    expect(await page.$$eval('#example-player_html5_api', v => v.volume)).toBe(currentVol - 0.1);
  });
  it('Test volume up', async () => {
    await page.waitFor(500);
    let currentVol = await page.$$eval('#example-player_html5_api', v => v.volume);
    await page.click('#vid-volume-plus');
    await page.waitFor(500);
    expect(await page.$$eval('#example-player_html5_api', v => v.volume)).toBe(currentVol + 0.1);
  });
  it('Test pause', async () => {
    await page.waitFor(500);
    await page.click('#vid-pause');
    await page.waitFor(500);
    expect(await page.$eval('#example-player video', el => el.playing)).toBe(false);
  });
  it('Test play', async () => {
    await page.waitFor(500);
    await page.click('#example-player > div.vjs-control-bar > button.vjs-play-control.vjs-control');
    await page.waitFor(500);
    expect(await page.$eval('#example-player video', el => el.playing)).toBe(false);
    await page.waitFor(500);
    await page.click('#vid-play');
    expect(await page.$eval('#example-player video', el => el.playing)).toBe(true);
  });
  it('Test stop', async () => {
    await page.waitFor(500);
    await page.click('#vid-stop');
    await page.waitFor(500);
    expect(await page.$eval('#example-player video', el => el.playing)).toBe(false);
  });
  it('Test hide controls', async () => {
    await page.waitFor(500);
    expect(await page.$eval('#example-player > div.vjs-control-bar', p => p.offsetWidth)).toBeGreaterThan(0);
    await page.click('#vid-toggle-controls');
    await page.waitFor(500);
    expect(await page.$eval('#example-player > div.vjs-control-bar', p => p.offsetWidth)).toBe(0);
  });
  it('Test fullscreen', async () => {
    await page.waitFor(500);
    expect(await page.evaluate(() => document.fullscreen)).toBe(false);
    await page.click('#vid-vid-maximize');
    await page.waitFor(500);
    expect(await page.evaluate(() => document.fullscreen)).toBe(true);
  });
});

