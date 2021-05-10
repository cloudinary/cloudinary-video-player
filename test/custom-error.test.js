describe('custom error tests', () => {

  beforeAll(async () => {
    jest.setTimeout(35000);
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto('http://localhost:3000/docs/custom-cld-errors.html', { waitUntil: 'load' });
    await page.evaluate(() => {
      Object.defineProperty(HTMLMediaElement.prototype, 'playing', {
        get: function() {
          return !!(this.currentTime > 0 && !this.paused && !this.ended &&
              this.readyState > 2);
        }
      });
    });
  }, 10000);

  it('Test error', async () => {
    jest.setTimeout(35000);
    await page.waitFor(1000);
    // eslint-disable-next-line no-undef
    const errorMsg = await page.evaluate(() => player.videojs.error_.message);
    expect(errorMsg).toBe('My custom error message');
  });
});
