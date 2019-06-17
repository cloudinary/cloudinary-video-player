describe('UI configuration tests', () => {
  beforeAll(async () => {
    jest.setTimeout(35000);
    await page.setViewport({width: 1280, height: 800});
    await page.goto('http://localhost:3000/docs/ui-config.html', {waitUntil: 'load'});
    await page.evaluate(() => {
      Object.defineProperty(HTMLMediaElement.prototype, 'playing', {
        get: function() {
          return !!(this.currentTime > 0 && !this.paused && !this.ended &&
              this.readyState > 2);
        }
      });
    });
  }, 10000);
  it('Test +/-10 sec', async () => {
    jest.setTimeout(35000);
    await page.waitForFunction('player.videojs.readyState() === 4');
    await page.waitFor(1000);
    await page.click('#player > div.vjs-control-bar > button.vjs-play-control.vjs-control.vjs-button');
    let time = await page.$eval('#player > .vjs-control-bar > .vjs-current-time.vjs-time-control.vjs-control > .vjs-current-time-display', vt => Number(vt.textContent.replace('0:', '')));
    await page.click('#player > div.vjs-control-bar > button.vjs-control.vjs-icon-skip-10-plus.vjs-button');
    await page.waitFor(1000);
    await page.waitForFunction('player.videojs.readyState() === 4');
    let newTime = await page.$eval('#player > .vjs-control-bar > .vjs-current-time.vjs-time-control.vjs-control > .vjs-current-time-display', vt => Number(vt.textContent.replace('0:', '')));
    expect(newTime).toEqual(time + 10);
    await page.click('#player > div.vjs-control-bar > button.vjs-control.vjs-icon-skip-10-min.vjs-button');
    await page.waitFor(1000);
    await page.waitForFunction('player.videojs.readyState() === 4');
    newTime = await page.$eval('#player > .vjs-control-bar > .vjs-current-time.vjs-time-control.vjs-control > .vjs-current-time-display', vt => Number(vt.textContent.replace('0:', '')));
    expect(newTime).toEqual(time);
  });
  it('Test right click no context menu', async () => {
    await page.waitForFunction('player.videojs.readyState() === 4');
    await page.waitFor(1000);
    await page.click('#player_html5_api', {button: 'right'});
    expect(await page.$('div.vjs-menu.vjs-context-menu-ui')).toEqual(null);
  });
  it('Test logo and logo click url', async () => {
    await page.waitForFunction('player.videojs.readyState() === 4');
    await page.waitFor(1000);
    let opts = await page.evaluate(() => player.videojs.options_);
    let href = await page.$eval('#player > div.vjs-control-bar > a', (a) => a.href);
    let backImage = await page.$eval('#player > div.vjs-control-bar > a', (a) => a.style.backgroundImage);
    expect(opts.logoOnclickUrl).toEqual(href.slice(0, href.length - 1));
    expect(opts.logoImageUrl).toEqual(backImage.replace('url\("', ''). replace('"\)', ''));
  });
});


