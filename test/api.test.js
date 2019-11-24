const urls = ['http://localhost:3000/api.html?testUrlWith=head', 'http://localhost:3000/api.html?fetchErrorUsing=get'];

urls.forEach((url, index) => {
  describe(`API player tests ${index ? 'fetch error using get' : 'fetch error using head'}`, () => {
    beforeEach(async () => {
      await page.setViewport({ width: 1280, height: 1800 });
      await page.goto(url, { waitUntil: 'load' });
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
      jest.setTimeout(35000);
      await page.waitForFunction('player.videojs.readyState() === 4');
      let time = await page.$eval('#player > .vjs-control-bar > .vjs-current-time.vjs-time-control.vjs-control > .vjs-current-time-display', vt => Number(vt.textContent.replace('0:', '')));
      await page.click('#vid-seek-plus');
      await page.waitForFunction('player.videojs.readyState() === 4');
      let newtime = await page.$eval('#player > .vjs-control-bar > .vjs-current-time.vjs-time-control.vjs-control > .vjs-current-time-display', vt => Number(vt.textContent.replace('0:', '')));
      expect(newtime).toBeGreaterThanOrEqual(time + 10);
    });
    it('Test back 10 seconds', async () => {
      jest.setTimeout(35000);
      await page.waitForFunction('player.videojs.readyState() === 4');
      await page.click('#vid-seek-plus');
      await page.waitForFunction('player.videojs.readyState() === 4');
      await page.click('#vid-seek-minus');
      await page.waitForFunction('player.videojs.readyState() === 4');
      let newtime = await page.$eval('#player > .vjs-control-bar > .vjs-current-time.vjs-time-control.vjs-control > .vjs-current-time-display', vt => Number(vt.textContent.replace('0:', '')));
      expect(newtime).toEqual(0);
    });
    it('Test mute un-mute', async () => {
      await page.waitFor(500);
      await page.click('#vid-mute');
      await page.waitFor(500);
      expect(await page.$eval('#player_html5_api', v => v.muted)).toBe(true);
      await page.click('#vid-unmute');
      await page.waitFor(500);
      expect(await page.$eval('#player_html5_api', v => v.muted)).toBe(false);
    });
    it('Test volume down', async () => {
      await page.waitFor(500);
      await page.click('#vid-unmute');
      await page.waitFor(500);
      let currentVol = await page.$eval('#player_html5_api', v => v.volume);
      await page.click('#vid-volume-minus');
      await page.waitFor(500);
      expect(await page.$eval('#player_html5_api', v => v.volume)).toBe(currentVol - 0.1);
    });
    it('Test volume up', async () => {
      await page.waitFor(500);
      await page.click('#vid-unmute');
      await page.waitFor(500);
      let currentVol = await page.$eval('#player_html5_api', v => v.volume);
      await page.click('#vid-volume-plus');
      await page.waitFor(500);
      expect(await page.$eval('#player_html5_api', v => v.volume)).toBe(currentVol + 0.1);
    });
    it('Test pause', async () => {
      await page.waitFor(500);
      await page.click('#vid-pause');
      await page.waitFor(500);
      expect(await page.$eval('#player video', el => el.playing)).toBe(false);
    });
    it('Test play', async () => {
      await page.waitFor(500);
      await page.click('#player > .vjs-control-bar > button.vjs-play-control.vjs-control');
      await page.waitFor(500);
      expect(await page.$eval('#player video', el => el.playing)).toBe(false);
      await page.waitFor(500);
      await page.click('#vid-play');
      expect(await page.$eval('#player video', el => el.playing)).toBe(true);
    });
    it('Test stop', async () => {
      await page.waitFor(500);
      await page.click('#vid-stop');
      await page.waitFor(500);
      expect(await page.$eval('#player video', el => el.playing)).toBe(false);
    });
    it('Test hide controls', async () => {
      await page.waitFor(500);
      expect(await page.$eval('#player > .vjs-control-bar', p => p.offsetWidth)).toBeGreaterThan(0);
      await page.click('#vid-toggle-controls');
      await page.waitFor(500);
      expect(await page.$eval('#player > .vjs-control-bar', p => p.offsetWidth)).toBe(0);
    });

    /*  it('Test fullscreen', async () => {
        await page.waitFor(1000);
        expect(await page.evaluate(() => document.webkitIsFullScreen)).toBeFalsy();
        await page.click('#vid-maximize');
        await page.waitFor(1000);
        expect(await page.evaluate(() => document.webkitIsFullScreen)).toBeTruthy();
      });*/
  });
});
