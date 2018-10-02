const puppeteer = require('puppeteer');
const url = require('url');
const path = require('path');
describe('basic player tests', () => {
  beforeEach(async () => {
    // const browser = await puppeteer.launch({ headless: false });
    // const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
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
    await expect(page).toMatchElement('#example-player');
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
  });
});