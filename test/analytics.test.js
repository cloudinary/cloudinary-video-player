const RequestInterceptor = require('puppeteer-request-spy').RequestInterceptor;
const RequestSpy = require('puppeteer-request-spy').RequestSpy;
const URL = require('url').URL;

describe('Analytics tests', () => {
  let paramInterceptor = null;

  beforeEach(async () => {
    // parameter Interceptor
    paramInterceptor = new RequestInterceptor((testee, keyword) => {
      const urlObj = new URL(testee);
      return urlObj.searchParams.get('ea') === keyword;
    });
    await page.setRequestInterception(true);
    await page.setViewport({ width: 1280, height: 1800 });
  }, 35000);

  it('Analytics requests', async () => {
    jest.setTimeout(35000);
    const requestInterceptor = new RequestInterceptor((testee, keyword) => testee.startsWith(keyword));
    const reqSpy = new RequestSpy('https://www.google-analytics.com/collect');
    requestInterceptor.addSpy(reqSpy);
    await page.on('request', requestInterceptor.intercept.bind(requestInterceptor));
    await page.goto('http://localhost:3000/analytics.html', { waitUntil: 'load' });
    await page.waitFor(1000);
    expect(reqSpy.hasMatch()).toBe(true);
  });

  it('Test pause event', async () => {
    jest.setTimeout(35000);
    const puseSpy = new RequestSpy('Pause');
    paramInterceptor.addSpy(puseSpy);
    await page.on('request', paramInterceptor.intercept.bind(paramInterceptor));
    await page.goto('http://localhost:3000/analytics.html', { waitUntil: 'load' });
    await page.waitFor(1000);
    await page.click('#player > div.vjs-control-bar > button.vjs-play-control');
    expect(puseSpy.hasMatch()).toBe(true);
  });

  it('Test play event', async () => {
    jest.setTimeout(35000);
    const playSpy = new RequestSpy('Play');
    paramInterceptor.addSpy(playSpy);
    await page.on('request', paramInterceptor.intercept.bind(paramInterceptor));
    await page.goto('http://localhost:3000/analytics.html', { waitUntil: 'load' });
    await page.waitFor(1000);
    await page.click('#player > div.vjs-control-bar > button.vjs-play-control');
    await page.waitFor(500);
    await page.click('#player > div.vjs-control-bar > button.vjs-play-control');
    expect(playSpy.getMatchCount()).toBe(2);
  });

  it('Test volume event', async () => {
    jest.setTimeout(35000);
    const spy = new RequestSpy('Volume Change');
    paramInterceptor.addSpy(spy);
    await page.on('request', paramInterceptor.intercept.bind(paramInterceptor));
    await page.goto('http://localhost:3000/analytics.html', { waitUntil: 'load' });
    await page.waitFor(1000);
    await page.click('#player > .vjs-control-bar > .vjs-volume-panel.vjs-control.vjs-volume-panel-horizontal > button');
    expect(spy.hasMatch()).toBe(true);
  });

  it('Test percentage event', async () => {
    jest.setTimeout(60000);
    let fussyParamInterceptor = new RequestInterceptor((testee, keyword) => {
      let urlObj = new URL(testee);
      const event = urlObj.searchParams.get('ea');
      return event !== null && event.includes(keyword);
    });
    const spy = new RequestSpy('Percents Played');
    fussyParamInterceptor.addSpy(spy);
    await page.on('request', fussyParamInterceptor.intercept.bind(fussyParamInterceptor));
    await page.goto('http://localhost:3000/analytics.html', { waitUntil: 'load' });
    await page.waitFor(1000);
    const duration = await page.evaluate(() => player.duration());
    await page.waitFor(duration * 1000 + 1000);
    expect(spy.getMatchCount()).toBe(4);
  });

  it('Test seek', async () => {

    jest.setTimeout(35000);
    const fussyParamInterceptor = new RequestInterceptor((testee, keyword) => {
      const urlObj = new URL(testee);
      const event = urlObj.searchParams.get('ea');
      return event !== null && event.includes(keyword);
    });

    const spy = new RequestSpy('Seek');
    fussyParamInterceptor.addSpy(spy);
    await page.on('request', fussyParamInterceptor.intercept.bind(fussyParamInterceptor));
    await page.goto('http://localhost:3000/analytics.html', { waitUntil: 'load' });
    await page.waitFor(1000);
    await page.evaluate(() => player.currentTime(player.currentTime() + 10));
    await page.waitFor(1000);
    expect(spy.getMatchCount()).toBe(2);
  });

/*  it('Test full screen', async () => {
    jest.setTimeout(35000);
    let spy = new RequestSpy('Enter Fullscreen');
    paramInterceptor.addSpy(spy);
    await page.on('request', paramInterceptor.intercept.bind(paramInterceptor));
    await page.goto('http://localhost:3000/analytics.html', { waitUntil: 'load' });
    await page.waitFor(1000);
    await page.click('#player > .vjs-control-bar > button.vjs-fullscreen-control.vjs-control.vjs-button');
    await page.waitFor(500);
    expect(spy.hasMatch()).toBe(true);
  });*/
});
