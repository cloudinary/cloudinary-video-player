const url = 'http://localhost:3000/ui-config/ui-config.html';

describe('UI configuration tests', () => {

  beforeAll(async () => {
    jest.setTimeout(35000);
    await page.setViewport({width: 1280, height: 800});
    await page.goto(url, {waitUntil: 'load'});
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
    const time = await page.$eval('#player > .vjs-control-bar > .vjs-current-time.vjs-time-control.vjs-control > .vjs-current-time-display', vt => Number(vt.textContent.replace('0:', '')));
    await page.click('#player > div.vjs-control-bar > button.vjs-control.vjs-icon-skip-10-plus.vjs-button');
    await page.waitFor(1000);
    await page.waitForFunction('player.videojs.readyState() === 4');
    const newTime1 = await page.$eval('#player > .vjs-control-bar > .vjs-current-time.vjs-time-control.vjs-control > .vjs-current-time-display', vt => Number(vt.textContent.replace('0:', '')));
    expect(newTime1).toEqual(time + 10);
    await page.click('#player > div.vjs-control-bar > button.vjs-control.vjs-icon-skip-10-min.vjs-button');
    await page.waitFor(1000);
    await page.waitForFunction('player.videojs.readyState() === 4');
    const newTime2 = await page.$eval('#player > .vjs-control-bar > .vjs-current-time.vjs-time-control.vjs-control > .vjs-current-time-display', vt => Number(vt.textContent.replace('0:', '')));
    expect(newTime2).toEqual(time);
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
    const opts = await page.evaluate(() => player.videojs.options_);
    const href = await page.$eval('#player > div.vjs-control-bar > a', (a) => a.href);
    const backImage = await page.$eval('#player > div.vjs-control-bar > a', (a) => a.style.backgroundImage);
    expect(opts.logoOnclickUrl).toEqual(href.slice(0, href.length - 1));
    expect(opts.logoImageUrl).toEqual(backImage.replace('url\("', '').replace('"\)', ''));
  });
});


