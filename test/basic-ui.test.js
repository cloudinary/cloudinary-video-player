const puppeteer = require('puppeteer');
const url = require('url');
const path = require('path');
describe('app', () => {
  beforeEach(async () => {
    // const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto('http://localhost:3000/', { waitUntil: 'load' });
  }, 10000);

  it('video player should load', async () => {
    page.once('load', async () => {
      await expect(page).toMatchElement('#example-player');
    });
  });
  it('Video should play', async () => {
    await page.setRequestInterception(true);
    page.on('request', (interceptedRequest) => {
      let reqUrl = interceptedRequest.url();
      let parsed = url.parse(reqUrl);
      let ext = path.extname()
      if (ext === 'webm') {
        return true;
      }
    })
    page.once('load', async () => {
      await expect(page).toClick('button.vjs-big-play-button');
    });
  });
})