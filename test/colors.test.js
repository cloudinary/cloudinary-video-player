describe('Colors api tests', () => {

  beforeAll(async () => {
    jest.setTimeout(35000);
    await page.setViewport({width: 1280, height: 800});
    await page.goto('http://localhost:3000/docs/colors.html', {waitUntil: 'load'});
    await page.evaluate(() => {
      Object.defineProperty(HTMLMediaElement.prototype, 'playing', {
        get: function() {
          return !!(this.currentTime > 0 && !this.paused && !this.ended &&
              this.readyState > 2);
        }
      });
    });
  }, 10000);

  it('Test colors', async () => {
    jest.setTimeout(35000);
    await page.waitFor(1000);
    const playersInf = await page.evaluate(() => players.map((p) => {
      const op = {};
      op[p.videojs.id_] = p.videojs.options_['data-cld-colors'];
      return op;
    }),
    );

    for (const player of playersInf) {
      const id = Object.keys(player);
      const opts = player[id];
      const tooltipColor = rgb2hex(await page.$eval(`#${id} .vjs-time-tooltip`, e => getComputedStyle(e).color));
      const progressColor = rgb2hex(await page.$eval(`#${id} .vjs-play-progress`, e => getComputedStyle(e).backgroundColor));
      const titleBarColor = rgb2hex(await page.$eval(`#${id} .vjs-title-bar`, e => getComputedStyle(e).color));
      const optColors = JSON.parse(opts);
      expect(tooltipColor).toEqual(extendHex(optColors.base));
      expect(progressColor).toEqual(extendHex(optColors.accent));
      expect(titleBarColor).toEqual(extendHex(optColors.text));
    }
  });
});

function rgb2hex(rgb) {
  rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);

  function hex(x) {
    // eslint-disable-next-line radix
    return ('0' + parseInt(x).toString(16)).slice(-2);
  }

  return '#' + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}

function extendHex(hex) {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function(m, r, g, b) {
    return r + r + g + g + b + b;
  });
  return hex.startsWith('#') ? hex : '#' + hex;
}
